const expr = require("express")
const app = expr()
var mg = require("mongoose")
const body = require("body-parser")
app.use(body.urlencoded({extended:true}))
mg.connect("mongodb://127.0.0.1:27017/mydb").then(()=>{
    console.log("ok")
}).catch((e)=>{
    console.log(e)
})
const comment_schema = new mg.Schema({
    cid:{
        type:Number,
        unique:true
    },
    pid:{
        type:Number,
        unique:true
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

const comment_model = new mg.model('comment',comment_schema)

app.get('/create_comment',(req,res)=>{
    res.sendFile(__dirname+"/comment.html")
})

app.post('/submit_comment', (req,res)=>{
    var comment_data = req.body.comment;
   const create_c = async ()=>{
    console.log("f")
        var commentdata = new comment_model({cid:1,pid:1,content:comment_data})
        res = await commentdata.save()
        console.log(res)
        return res
   }
   if (create_c()){
        res.send("ok")
   }
   res.send("error")
})

app.listen(5000)
