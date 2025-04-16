// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const admin = require('firebase-admin');
// const serviceAccount = require('./firebaseServiceKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();
// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(bodyParser.json());

// /**
//  * Routes
//  */

// // GET menu items
// app.get('/menu', async (req, res) => {
//   try {
//     const snapshot = await db.collection('menuItems').get();
//     const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     res.status(200).json(items);
//   } catch (err) {
//     res.status(500).send('Error fetching menu: ' + err.message);
//   }
// });

// // POST new order
// app.post('/order', async (req, res) => {
//   try {
//     const orderData = req.body;
//     await db.collection('orders').add(orderData);
//     res.status(201).send('Order placed successfully');
//   } catch (err) {
//     res.status(500).send('Error placing order: ' + err.message);
//   }
// });

// app.post('/menu/add', async (req, res) => {
//     try {
//       const { name, price, restaurantId } = req.body;
  
//       if (!name || !price || !restaurantId) {
//         return res.status(400).send('Missing name, price or restaurantId');
//       }
  
//       const newItem = {
//         name,
//         price,
//         restaurantId,
//         createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       };
  
//       const docRef = await db.collection('menuItems').add(newItem);
//       res.status(201).send({ id: docRef.id, message: 'Menu item added' });
//     } catch (err) {
//       res.status(500).send('Error adding menu item: ' + err.message);
//     }
//   });

// app.listen(PORT, () => {
//   console.log(`TapToDine backend running on http://localhost:${PORT}`);
// });


// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const admin = require('firebase-admin');
// const serviceAccount = require('./firebaseServiceKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();
// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(bodyParser.json());

// /**
//  * Routes
//  */

// // GET menu items by restaurantId
// app.get('/menu/:restaurantId', async (req, res) => {
//   try {
//     const { restaurantId } = req.params;
//     const snapshot = await db.collection('menuItems').where('restaurantId', '==', restaurantId).get();
//     const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     res.status(200).json(items);
//   } catch (err) {
//     res.status(500).send('Error fetching menu: ' + err.message);
//   }
// });

// // POST new order
// app.post('/order', async (req, res) => {
//   try {
//     const orderData = req.body;
//     orderData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    
//     await db.collection('orders').add(orderData);
//     res.status(201).send('Order placed successfully');
//   } catch (err) {
//     res.status(500).send('Error placing order: ' + err.message);
//   }
// });

// // GET orders for restaurant
// app.get('/orders/:restaurantId', async (req, res) => {
//   try {
//     const { restaurantId } = req.params;
//     const snapshot = await db.collection('orders').where('restaurantId', '==', restaurantId).orderBy('createdAt', 'desc').get();
//     const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     res.status(200).json(orders);
//   } catch (err) {
//     res.status(500).send('Error fetching orders: ' + err.message);
//   }
// });

// // POST add menu item
// app.post('/menu/add', async (req, res) => {
//   try {
//     const { name, price, restaurantId } = req.body;

//     if (!name || !price || !restaurantId) {
//       return res.status(400).send('Missing name, price or restaurantId');
//     }

//     const newItem = {
//       name,
//       price,
//       restaurantId,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//     };

//     const docRef = await db.collection('menuItems').add(newItem);
//     res.status(201).send({ id: docRef.id, message: 'Menu item added' });
//   } catch (err) {
//     res.status(500).send('Error adding menu item: ' + err.message);
//   }
// });

// // PUT update menu item
// app.put('/menu/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, price } = req.body;
//     await db.collection('menuItems').doc(id).update({ name, price });
//     res.status(200).send('Menu item updated');
//   } catch (err) {
//     res.status(500).send('Error updating item: ' + err.message);
//   }
// });

// // DELETE menu item
// app.delete('/menu/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     await db.collection('menuItems').doc(id).delete();
//     res.status(200).send('Menu item deleted');
//   } catch (err) {
//     res.status(500).send('Error deleting item: ' + err.message);
//   }
// });

// // POST register
// app.post('/register', async (req, res) => {
//   try {
//     const { email, password, restaurantName } = req.body;
//     const userRecord = await admin.auth().createUser({
//       email,
//       password,
//     });

//     const newRestaurant = {
//       uid: userRecord.uid,
//       email,
//       restaurantName,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//     };

//     await db.collection('restaurants').doc(userRecord.uid).set(newRestaurant);
//     res.status(201).send({ message: 'Registered successfully', restaurantId: userRecord.uid });
//   } catch (err) {
//     res.status(500).send('Error registering user: ' + err.message);
//   }
// });

// // POST login (basic check, real-world apps should use Firebase Auth client SDK)
// app.post('/login', async (req, res) => {
//   try {
//     const { email } = req.body;
//     const usersSnapshot = await db.collection('restaurants').where('email', '==', email).get();
//     if (usersSnapshot.empty) {
//       return res.status(404).send('User not found');
//     }
//     const userData = usersSnapshot.docs[0].data();
//     res.status(200).send({ message: 'Login successful', restaurantId: userData.uid, restaurantName: userData.restaurantName });
//   } catch (err) {
//     res.status(500).send('Login failed: ' + err.message);
//   }
// });

// app.listen(PORT, () => {
//   console.log(`TapToDine backend running on http://localhost:${PORT}`);
// });







// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const admin = require('firebase-admin');
// const serviceAccount = require('./firebaseServiceKey.json');
// const { WebSocketServer } = require('ws');
// const http = require('http');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();
// const app = express();
// const PORT = 5000;

// const server = http.createServer(app);
// const wss = new WebSocketServer({ server });

// app.use(cors());
// app.use(bodyParser.json());

// // Store active WebSocket connections mapped by restaurantId
// const clients = new Map(); // { restaurantId: Set<WebSocket> }

// // Broadcast updated orders to all connected clients for a given restaurantId
// function broadcastOrders(restaurantId) {
//   db.collection('orders')
//     .where('restaurantId', '==', restaurantId)
//     .orderBy('createdAt', 'desc')
//     .get()
//     .then(snapshot => {
//       const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       const receivers = clients.get(restaurantId);
//       if (receivers) {
//         const msg = JSON.stringify(orders);
//         receivers.forEach(ws => {
//           if (ws.readyState === 1) ws.send(msg); // Ensure WebSocket is open before sending
//         });
//       }
//     })
//     .catch(err => {
//       console.error('Error fetching orders: ', err);
//     });
// }

// // Routes

// // GET menu items by restaurantId
// app.get('/menu/:restaurantId', async (req, res) => {
//   try {
//     const { restaurantId } = req.params;
//     const snapshot = await db.collection('menuItems').where('restaurantId', '==', restaurantId).get();
//     const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     res.status(200).json(items);
//   } catch (err) {
//     res.status(500).send('Error fetching menu: ' + err.message);
//   }
// });

// // POST new order
// app.post('/order', async (req, res) => {
//   try {
//     const orderData = req.body;
//     orderData.createdAt = admin.firestore.FieldValue.serverTimestamp();

//     // Save order to Firestore
//     await db.collection('orders').add(orderData);

//     // Broadcast the updated orders to all connected clients
//     broadcastOrders(orderData.restaurantId);

//     res.status(201).send('Order placed successfully');
//   } catch (err) {
//     res.status(500).send('Error placing order: ' + err.message);
//   }
// });

// // GET orders for a restaurant
// app.get('/orders/:restaurantId', async (req, res) => {
//   try {
//     const { restaurantId } = req.params;
//     const snapshot = await db.collection('orders').where('restaurantId', '==', restaurantId).orderBy('createdAt', 'desc').get();
//     const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     res.status(200).json(orders);
//   } catch (err) {
//     res.status(500).send('Error fetching orders: ' + err.message);
//   }
// });

// // POST add menu item
// app.post('/menu/add', async (req, res) => {
//   try {
//     const { name, price, restaurantId } = req.body;

//     if (!name || !price || !restaurantId) {
//       return res.status(400).send('Missing name, price or restaurantId');
//     }

//     const newItem = {
//       name,
//       price,
//       restaurantId,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//     };

//     const docRef = await db.collection('menuItems').add(newItem);
//     res.status(201).send({ id: docRef.id, message: 'Menu item added' });
//   } catch (err) {
//     res.status(500).send('Error adding menu item: ' + err.message);
//   }
// });

// // PUT update menu item
// app.put('/menu/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, price } = req.body;
//     await db.collection('menuItems').doc(id).update({ name, price });
//     res.status(200).send('Menu item updated');
//   } catch (err) {
//     res.status(500).send('Error updating item: ' + err.message);
//   }
// });

// // DELETE menu item
// app.delete('/menu/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     await db.collection('menuItems').doc(id).delete();
//     res.status(200).send('Menu item deleted');
//   } catch (err) {
//     res.status(500).send('Error deleting item: ' + err.message);
//   }
// });

// // POST register
// app.post('/register', async (req, res) => {
//   try {
//     const { email, password, restaurantName } = req.body;

//     if (!email || !password || !restaurantName) {
//       return res.status(400).send('Missing email, password, or restaurantName');
//     }

//     const userRecord = await admin.auth().createUser({
//       email,
//       password,
//     });

//     const newRestaurant = {
//       uid: userRecord.uid,
//       email,
//       restaurantName,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//     };

//     await db.collection('restaurants').doc(userRecord.uid).set(newRestaurant);
//     res.status(201).send({ message: 'Registered successfully', restaurantId: userRecord.uid });
//   } catch (err) {
//     res.status(500).send('Error registering user: ' + err.message);
//   }
// });

// // POST login
// app.post('/login', async (req, res) => {
//   try {
//     const { email } = req.body;
//     const usersSnapshot = await db.collection('restaurants').where('email', '==', email).get();
//     if (usersSnapshot.empty) {
//       return res.status(404).send('User not found');
//     }
//     const userData = usersSnapshot.docs[0].data();
//     res.status(200).send({ message: 'Login successful', restaurantId: userData.uid, restaurantName: userData.restaurantName });
//   } catch (err) {
//     res.status(500).send('Login failed: ' + err.message);
//   }
// });

// app.put('/orders/fulfilled/:orderId', async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     await db.collection('orders').doc(orderId).update({
//       status: 'fulfilled',
//     });
//     res.status(200).send('Order marked as fulfilled');
//   } catch (err) {
//     res.status(500).send('Error updating order status: ' + err.message);
//   }
// });

// // DELETE an order
// app.delete('/orders/:orderId', async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     await db.collection('orders').doc(orderId).delete();
//     res.status(200).send('Order deleted');
//   } catch (err) {
//     res.status(500).send('Error deleting order: ' + err.message);
//   }
// });


// // WebSocket logic to manage connections per restaurant
// wss.on('connection', (ws, req) => {
//   const restaurantId = req.url.split("/").pop();
//   if (!restaurantId) return ws.close();

//   if (!clients.has(restaurantId)) {
//     clients.set(restaurantId, new Set());
//   }
//   clients.get(restaurantId).add(ws);

//   ws.on('close', () => {
//     clients.get(restaurantId)?.delete(ws);
//     if (clients.get(restaurantId)?.size === 0) {
//       clients.delete(restaurantId);
//     }
//   });

//   // Initial push to WebSocket client with orders for restaurant
//   broadcastOrders(restaurantId);
// });

// // Start the server
// server.listen(PORT, () => {
//   console.log(`TapToDine backend running on http://localhost:${PORT}`);
// });





const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceKey.json');
const { WebSocketServer } = require('ws');
const http = require('http');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const PORT = 5000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(bodyParser.json());

// Store active WebSocket connections mapped by restaurantId
const clients = new Map(); // { restaurantId: Set<WebSocket> }

// Broadcast updated orders to all connected clients for a given restaurantId
function broadcastOrders(restaurantId) {
  db.collection('orders')
    .where('restaurantId', '==', restaurantId)
    .orderBy('createdAt', 'desc')
    .get()
    .then(snapshot => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const receivers = clients.get(restaurantId);
      if (receivers) {
        const msg = JSON.stringify(orders);
        receivers.forEach(ws => {
          if (ws.readyState === 1) ws.send(msg); // Ensure WebSocket is open before sending
        });
      }
    })
    .catch(err => {
      console.error('Error fetching orders: ', err);
    });
}

// Routes

// GET menu items by restaurantId
app.get('/menu/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const snapshot = await db.collection('menuItems').where('restaurantId', '==', restaurantId).get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (err) {
    res.status(500).send('Error fetching menu: ' + err.message);
  }
});

// POST new order (with qty)
app.post('/order', async (req, res) => {
  try {
    const orderData = req.body;

    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).send('Order must have at least one item');
    }

    // Calculate total price for each item based on qty and price
    const updatedItems = orderData.items.map(item => ({
      name: item.name,
      price: item.price,
      qty: item.qty,
      totalPrice: item.price * item.qty, // Calculate total price for each item
    }));

    orderData.items = updatedItems;
    orderData.createdAt = admin.firestore.FieldValue.serverTimestamp();

    // Save order to Firestore
    await db.collection('orders').add(orderData);

    // Broadcast the updated orders to all connected clients
    broadcastOrders(orderData.restaurantId);

    res.status(201).send('Order placed successfully');
  } catch (err) {
    res.status(500).send('Error placing order: ' + err.message);
  }
});

// GET orders for a restaurant
app.get('/orders/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const snapshot = await db.collection('orders').where('restaurantId', '==', restaurantId).orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).send('Error fetching orders: ' + err.message);
  }
});

// POST add menu item
app.post('/menu/add', async (req, res) => {
  try {
    const { name, price, restaurantId } = req.body;

    if (!name || !price || !restaurantId) {
      return res.status(400).send('Missing name, price or restaurantId');
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
    res.status(500).send('Error adding menu item: ' + err.message);
  }
});

// PUT update menu item
app.put('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    await db.collection('menuItems').doc(id).update({ name, price });
    res.status(200).send('Menu item updated');
  } catch (err) {
    res.status(500).send('Error updating item: ' + err.message);
  }
});

// DELETE menu item
app.delete('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('menuItems').doc(id).delete();
    res.status(200).send('Menu item deleted');
  } catch (err) {
    res.status(500).send('Error deleting item: ' + err.message);
  }
});

// POST register
app.post('/register', async (req, res) => {
  try {
    const { email, password, restaurantName } = req.body;

    if (!email || !password || !restaurantName) {
      return res.status(400).send('Missing email, password, or restaurantName');
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    const newRestaurant = {
      uid: userRecord.uid,
      email,
      restaurantName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('restaurants').doc(userRecord.uid).set(newRestaurant);
    res.status(201).send({ message: 'Registered successfully', restaurantId: userRecord.uid });
  } catch (err) {
    res.status(500).send('Error registering user: ' + err.message);
  }
});

// POST login
app.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const usersSnapshot = await db.collection('restaurants').where('email', '==', email).get();
    if (usersSnapshot.empty) {
      return res.status(404).send('User not found');
    }
    const userData = usersSnapshot.docs[0].data();
    res.status(200).send({ message: 'Login successful', restaurantId: userData.uid, restaurantName: userData.restaurantName });
  } catch (err) {
    res.status(500).send('Login failed: ' + err.message);
  }
});

// PUT update order status to fulfilled
app.put('/orders/fulfilled/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    await db.collection('orders').doc(orderId).update({
      status: 'fulfilled',
    });
    res.status(200).send('Order marked as fulfilled');
  } catch (err) {
    res.status(500).send('Error updating order status: ' + err.message);
  }
});

// DELETE an order
app.delete('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    await db.collection('orders').doc(orderId).delete();
    res.status(200).send('Order deleted');
  } catch (err) {
    res.status(500).send('Error deleting order: ' + err.message);
  }
});

// WebSocket logic to manage connections per restaurant
wss.on('connection', (ws, req) => {
  const restaurantId = req.url.split("/").pop();
  if (!restaurantId) return ws.close();

  if (!clients.has(restaurantId)) {
    clients.set(restaurantId, new Set());
  }
  clients.get(restaurantId).add(ws);

  ws.on('close', () => {
    clients.get(restaurantId)?.delete(ws);
    if (clients.get(restaurantId)?.size === 0) {
      clients.delete(restaurantId);
    }
  });

  // Initial push to WebSocket client with orders for restaurant
  broadcastOrders(restaurantId);
});

// Start the server
server.listen(PORT, () => {
  console.log(`TapToDine backend running on http://localhost:${PORT}`);
});
