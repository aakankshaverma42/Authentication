require('dotenv').config();
const express =require("express");
const bodyParser = require("body-parser");
const ejs = require ("ejs");
const mongoose = require ("mongoose");
//const res = require("express/lib/response");
const encrypt = require("mongoose-encryption");
//for hashing we use md5 ,it is very normal hashing
//const md5 = require("md5");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
// console.log(md5("123456"));
 app.use(express.static("public"));
 app.set('view engine','ejs');
 app.use(bodyParser.urlencoded({
     extended:true
 }));

mongoose.connect('mongodb://localhost:27017/userDb');
const db = mongoose.connection;
db.on('error',function(error){
    console.log('error is :',error);
});
db.once('open',function(){
    console.log('connected to mongodb')
});

const userSchema = new mongoose.Schema({
    email: String,
    password : String
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedField: ["password"] });

const User = new mongoose.model("User",userSchema); 

 app.get("/",function(req,res){
     res.render("home");
 });
 app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save(function(err){
            if(err){
                console.log(err);
            }else{
                res.render("secrets");
            }
    });    

    });
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password =(req.body.password);

    User.findOne({email:username}, function(err,foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                bcrypt.compare(password,foundUser.password, function(err, result) {
                    if(result === true){
                     res.render("secrets");
                    }
                });
            }
        }
    });
}); 

 app.listen(3000,function(){
     console.log("Sever is ready to start at port 3000");
 });  