const express=require('express')
const path=require("path")
const jwt=require("jsonwebtoken")
const fs=require("fs")

const app=express()

const JWT_SECRET="aksh12345"

app.use(express.json())
app.use(express.static(path.join(__dirname,"../public")))

const todosFile=path.join(__dirname,"data","todos.json")
const usersFile=path.join(__dirname,"data","users.json")

const readFromfile=(filepath)=>{
    if(fs.existsSync(filepath))
    {
        const data=fs.readFileSync(filepath, "utf-8");
        return JSON.parse(data);
    }
    return[]
}

const writeToFile=(filepath,data)=>
    {
        fs.writeFileSync(filepath,JSON.stringify(data,null,2,"utf-8"))
    }

    app.get("/",function(req,res)
    {
        res.sendFile(path.join(__dirname, './public/index.html'));
    })
app.post("/signup",function(req,res){
    const uname=req.body.uname;
    const pword=req.body.pword;
    const users=readFromfile(usersFile)
    if(users.find(user=>user.uname === uname))
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

app.post("/signin",function(req,res){
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


app.get("/todos",auth,function(req,res)
{
    const todos=readFromfile(todosFile)
    const userTodos=todos.filter(todo=> todo.uname===req.uname)
    res.json(userTodos)
})

app.post("/todos",auth,function(req,res)
{
    const todos=req.body.todos
    const text=req.body.text;
    const newTodos={uname:req.uname,text,completed:false}
    todos.push(newTodos)
    writeToFile(todosFile,todos)
    res.json(
        {
            message:"todo added succcesfully"
        }
    )
})

app.put("/todos/:id",auth,function(req,res)
{
    const id=req.params.id;
    const text=req.body.text;
    const completed=req.body.completed;
    const todos=readFromfile(todosFile)

    const ind=todos.findIndex(todo=>todo.uname===req.uname && todo.id===id)
    todos[ind]={...todos[ind],text,completed}
    writeToFile(todosFile,todos)
    res.json({
        message:"Todo updated"
    })
})

app.delete("/todos/:id",auth,function(req,res)
{
    
    const id=req.params.id;
    const todos=readFromfile(todosFile)

    const del=todos.filter(todo=>!(todo.uname===req.uname && id===id))
    todos.push(del)
    writeToFile(todosFile,todos)
    res.json(
        {
            message:"Deletion completed"
        }
    )
})

app.listen(3006)