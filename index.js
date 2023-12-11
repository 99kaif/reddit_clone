const express = require("express")
const body_parser = require("body-parser")
const mg = require("mongoose")
const fs = require("fs")

const app = express()

app.use(express.static(__dirname + '/static'))

var current_pid = 1
var comment_pid = 0

mg.connect("mongodb://127.0.0.1:27017/mydb")
.then(() => console.log("connected to mongoose"))
.catch((e) => console.log(e))

const post_schema = new mg.Schema({
	pid: {
		type: Number,
		unique: true
	},
	title: {
		type: String,
		maxlength: [100, "Title should not be bigger than 50 characters"],
		minlength: [1, "ERROR: Empty title"]
	},
	date: {
		type: Date,
		default: Date.now()
	},
	content: {
		type: String,
		maxlength: [1000, "Content should not be bigger than 1000 characters"],
		minlength: [1, "ERROR: Empty content"]
	}
})

const post_model = new mg.model("post", post_schema)

const insertPost = async(title, content) => {
	const new_post = new post_model({title: title, content: content, pid: current_pid})
	new_post.save()
	current_pid += 1
	fs.writeFileSync("current_post_id.txt", `${current_pid}`)
}

const getPost = async(starting_index, limit) => {
	// console.log(starting_index,limit)
	const result = await post_model.find()
	return result
}

const comment_schema = new mg.Schema({
    pid:{
        type:Number
    },
    content:{
        type:String,
        maxlength:[500,'max length is less than 500'],
        minlength:[1,'min length is greater than 1']
    },
    date:{
        type:Date,
        default:Date.now()
    }
})

const comment_model = new mg.model('comments',comment_schema)

// Making use of post method
app.use(body_parser.urlencoded({ extended: true}))

app.get("/", (req, res) => {
	res.redirect("/home/1")
})

app.get("/home/:id", async (req, res) => {
	const data = await getPost(req.params.id, 10)
	res.set("Content-type", "text/html")
	res.write("<html><head><link rel='stylesheet' href='/style.css'></head><body>")
	for(i in data){
		current_pid += 1
		res.write("<div class='post'>")
		res.write("<div class='title'>")
		res.write(`<a href='http://localhost:8000/posts/${data[i].pid}'>${data[i].title}</a>`)
		res.write("</div>")
		res.write("<hr>")
		res.write("<div class='content'>")
		res.write(`${data[i].content}`)
		res.write("</div>")
		res.write("<hr>")
		res.write("<div>")
		res.write(`${data[i].date.toString()}`)
		res.write("</div>")
		res.write("</div>")
	}
	res.write(`<button><a href='/create_post'>create post</a></button>`)
	res.write("</body></html>")
	res.end()
})


app.get("/posts/:id", async (req, res) => {
	const data = await post_model.find({pid:req.params.id})
	// console.log(data)
	res.set("Content-type", "text/html")
	res.write("<html><head><link rel='stylesheet' href='/style.css'></head><body>")
	res.write("<div class='post'>")
	res.write("<div class='title'>")
	res.write(`${data[0].title}`)
	res.write("</div>")
	res.write("<hr>")
	res.write("<div class='content'>")
	res.write(`${data[0].content}`)
	res.write("</div>")
	res.write("<hr>")
	res.write("<div>")
	res.write(`${data[0].date.toString()}`)
	res.write("</div>")
	res.write("</div>")
	res.write("<div class='comment_box'>")
	var c = await comment_model.find({pid:req.params.id})
	for (i in c){
		res.write("<div class='comment'>")
		res.write(`<p>${c[i].content}</p>`)
		res.write(`<div>${c[i].date.toString()}</div>`)
		res.write('</div>')
	}
	res.write("</div>")
	res.write(`<button><a href='/posts/${req.params.id}/create_comment'>create comment</a></button>`)
	comment_pid = req.params.id
	res.write("</body></html>")
	res.end()
})

app.get("/comments/:id", (req, res) => {
	console.log(req.params.id)
	res.send("bye")
})

app.get("/create_post", (req, res) => {
	res.sendFile(__dirname + "/static/create_post.html")
})

app.get("/posts/:id/create_comment", (req, res) => {
	res.sendFile(__dirname+"/static/comment.html")
})

app.post("/submit_post", (req, res) => {
	const title = req.body.title;
	const content = req.body.content;
	//const new_post = new post_model({title: title, content: content, pid: current_pid})
	//new_post.save()
	insertPost(title, content)
	res.redirect('/home/1')
})

app.post("/submit_comment", (req, res) => {
	var comment_data = req.body.comment;
	var pid = req.body.pid;
	const create_c = async ()=>{
        var commentdata = new comment_model({pid:comment_pid,content:comment_data})
        res = await commentdata.save()
        return res
   }
   if (create_c()){
	res.redirect(`/posts/${comment_pid}`)
   }
	else{
   res.send("error")
	}
})

app.listen(8000, () => console.log("The server is started"))
