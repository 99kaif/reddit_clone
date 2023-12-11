const mc = require("mongodb").MongoClient
const client = new mc("mongodb://127.0.0.1:27017/")
//console.log(client)
const db = client.db("mydb")
console.log(db.collection("tables").find())
console.log(db.collection('tables').countDocuments())
//db.collection("tables").find({}).toArray((err, result) => {
//	if (err) {
//		console.log(err)
//	}
//	console.log(result)
//})
