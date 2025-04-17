const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
require('dotenv').config();

// Decode service account from Base64
const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const jsonString = Buffer.from(base64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(jsonString);

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://taptodine-649b0-default-rtdb.firebaseio.com' // 🔁 replace with your Realtime DB URL
});

const db = admin.firestore();
const rtdb = admin.database();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Utility: push updated orders to Realtime Database
const pushLiveOrders = async (restaurantId) => {
  const snapshot = await db.collection('orders')
    .where('restaurantId', '==', restaurantId)
    .orderBy('createdAt', 'desc')
    .get();

  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  await rtdb.ref(`liveOrders/${restaurantId}`).set(orders);
};

// Get menu by restaurantId
app.get('/menu/:restaurantId', async (req, res) => {
  try {
    const snapshot = await db.collection('menuItems')
      .where('restaurantId', '==', req.params.restaurantId)
      .get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (err) {
    res.status(500).send('Error fetching menu: ' + err.message);
  }
});

app.put('/orders/fulfilled/:restaurantId/:orderId', async (req, res) => {
  try {
    const { restaurantId, orderId } = req.params;
    
    // Update order status to 'fulfilled' in Realtime Database
    await rtdb.ref(`orders/${restaurantId}/${orderId}`).update({
      status: 'fulfilled',
    });

    // Optionally, push live orders after update (e.g., syncing data elsewhere)
    await pushLiveOrders(restaurantId);

    res.status(200).send('Order marked as fulfilled');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Add menu item
app.post('/menu/add', async (req, res) => {
  try {
    const { name, price, restaurantId } = req.body;
    if (!name || !price || !restaurantId) {
      return res.status(400).send('Missing fields');
    }

    const newItem = {
      name,
      price,
      restaurantId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('menuItems').add(newItem);
    res.status(201).send({ id: docRef.id, message: 'Menu item added' });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Update menu item
app.put('/menu/:id', async (req, res) => {
  try {
    const { name, price } = req.body;
    await db.collection('menuItems').doc(req.params.id).update({ name, price });
    res.status(200).send('Menu item updated');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Delete menu item
app.delete('/menu/:id', async (req, res) => {
  try {
    await db.collection('menuItems').doc(req.params.id).delete();
    res.status(200).send('Menu item deleted');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Place an order
app.post('/order', async (req, res) => {
  try {
    const order = req.body;
    if (!order.items?.length || !order.restaurantId) {
      return res.status(400).send('Invalid order');
    }

    const items = order.items.map(item => ({
      name: item.name,
      price: item.price,
      qty: item.qty,
      totalPrice: item.price * item.qty
    }));

    const orderData = {
      ...order,
      items,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('orders').add(orderData);

    // Update Realtime DB for live dashboard
    await pushLiveOrders(order.restaurantId);

    res.status(201).send('Order placed');
  } catch (err) {
    res.status(500).send('Error placing order: ' + err.message);
  }
});

// Get orders for a restaurant
app.get('/orders/:restaurantId', async (req, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('restaurantId', '==', req.params.restaurantId)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).send('Error fetching orders: ' + err.message);
  }
});

// Fulfill order
// app.put('/orders/fulfilled/:orderId', async (req, res) => {
//   try {
//     await db.collection('orders').doc(req.params.orderId).update({ status: 'fulfilled' });

//     const orderDoc = await db.collection('orders').doc(req.params.orderId).get();
//     const restaurantId = orderDoc.data().restaurantId;
//     await pushLiveOrders(restaurantId);

//     res.status(200).send('Order marked fulfilled');
//   } catch (err) {
//     res.status(500).send('Error: ' + err.message);
//   }
// });





// Delete order
app.delete('/orders/:orderId', async (req, res) => {
  try {
    const orderRef = db.collection('orders').doc(req.params.orderId);
    const order = await orderRef.get();
    const restaurantId = order.data().restaurantId;

    await orderRef.delete();
    await pushLiveOrders(restaurantId);

    res.status(200).send('Order deleted');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Register restaurant
app.post('/register', async (req, res) => {
  try {
    const { email, password, restaurantName } = req.body;
    const userRecord = await admin.auth().createUser({ email, password });

    const newRestaurant = {
      uid: userRecord.uid,
      email,
      restaurantName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('restaurants').doc(userRecord.uid).set(newRestaurant);

    res.status(201).send({ message: 'Registered', restaurantId: userRecord.uid });
  } catch (err) {
    res.status(500).send('Registration error: ' + err.message);
  }
});

// Login restaurant
app.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const snapshot = await db.collection('restaurants').where('email', '==', email).get();

    if (snapshot.empty) return res.status(404).send('User not found');

    const user = snapshot.docs[0].data();
    res.status(200).send({ message: 'Login success', restaurantId: user.uid, restaurantName: user.restaurantName });
  } catch (err) {
    res.status(500).send('Login error: ' + err.message);
  }
});



app.get('/name/:restaurantId', async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const doc = await db.collection('restaurants').doc(restaurantId).get();

    if (!doc.exists) return res.status(404).send('Restaurant not found');

    const user = doc.data();
    res.status(200).send({ message: 'success', restaurantName: user.restaurantName });
  } catch (err) {
    res.status(500).send('Name error: ' + err.message);
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`TapToDine backend running at http://localhost:${PORT}`);
});
