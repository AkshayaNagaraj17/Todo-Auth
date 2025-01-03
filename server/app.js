const express=require('express')
const path=require("path")
const jwt=require("jsonwebtoken")
const fs=require("fs")

const app=express()

const JWT_SECRET="aksh12345"

app.use(express.json())
app.use(express.static(path.join(__dirname,"public")))

const todosFile=path.join(__dirname,"data","todos.json")
const usersFile=path.join(__dirname,"data","users.json")

const readFromfile=(filepath)=>{
    if(fs.existsSync(filepath))
    {
        return JSON.parse(fs.readFileSync(filepath,"utf-8"))
    }
}

const writeToFile=(filepath)=>
    {
        fs.writeFileSync(filepath,JSON.stringify(DataTransfer,null,2,"utf-8"))
    }


app.post("/signup",function(req,res){
    const uname=req.body.uname;
    const pword=req.body.pword;
    const users=readFromfile(usersFile)
    if(users.find(user=>user.uname==uname))
    {
        res.json({
            message:"You are alread exista"
        })
    }
    users.push({uname,pword})
    writeToFile(usersFile,users)
    res.json(
        {
            message:"Signed up"
        }
    )
})

app.post("./signin",function(req,res){
    const uname=req.body.uname;
    const pword=req.body.pword;
    const users=readFromfile(usersFile)
    const user=users.find(user=> user.uname===uname && user.pword===pword)
    if(user)
    {
        const token=jwt.sign({uname},"JWT_SECRET")
        res.json({
            token:token
        })
    }
    
})

function auth(req,res,next)
{
    const token=req.headers.token;
    const decode=jwt.verify(token,JWT_SECRET)
    if(decode.uname)
    {
        req.uname=decode.uname
        next()
    }
    else{
        res.json({
            message:"Not logged in"
        })
    }
}
