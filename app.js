require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

//seting up 'public' static files
app.use(express.static("public"))
//Setting Up bodyParser
app.use(bodyParser.urlencoded({extended: true}))
//seting up 'ejs'
app.set('view engine', 'ejs')
//connecting to mongoDB
mongoose.connect("mongodb://localhost:27017/userDB");

//Creating Schema
const userSchema = new mongoose.Schema({
    email : String,
    password : String
})

/*
    During save, documents are encrypted and then signed.
    During find, documents are authenticated and then decrypted.
*/ 
// to access 'SECRET' key from '.env' file, use :
console.log(process.env.SECRET)
/*
    Here we need to encrypt only "password" field so we are mentioning
    it as encryptedFields : ["password"]
*/
userSchema.plugin(encrypt, { secret : process.env.SECRET , encryptedFields : ["password"] });

//Creating Model
//this below line will create a collection known as "Users"
const User = new mongoose.model("User", userSchema)

app.get('/',function(req,res){
    res.render("home")
})

app.get('/login',function(req,res){
    res.render("login")
})

app.get('/register',function(req,res){
    res.render("register")
})

app.post('/register', (req,res)=>{
    const newUser = new User({
        email : req.body.username,
        password : req.body.password
    })
    
    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render("secrets");
        }
    })
})

app.post('/login', (req,res)=>{

    const username = req.body.username;
    const password = req.body.password;
    
    User.findOne(
        {email : username},
        function(err,foundUser){
            if(err){
                console.log("ERROR");
                res.redirect('/login');
            }else{        
                if(foundUser){
                    if(foundUser.password === password){
                        res.render("secrets")
                    }else{
                        console.log("ERROR");
                        res.redirect('/login');
                    }
                }
            }
        }
    )
})

app.listen('3000',(req,res)=>{
    console.log('Server is up in port 3000');
});