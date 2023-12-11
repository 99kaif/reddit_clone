const MongoClient = require('mongodb').MongoClient;
// Connection URL and database name
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'mydb';
// Create a new MongoClient
const client = new MongoClient(url);
// Connect to the MongoDB server
client.connect(async (err) => {
 if (err) {
 console.error('Error connecting to the database:', err);
 return;
 }
 console.log("ok!")
 const db = client.db(dbName);
 const userdata = db.collection('userdata');
})
