//jshint esversion:6
require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended  : true }));
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema=new mongoose.Schema({
    email: String,
    password: String
});

//console.log(process.env.API_KEY);
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields:["password"]});
const User=mongoose.model('User',userSchema);


app.get("/",function(req,res){
    res.render("home.ejs");
});

app.get("/login",function(req,res){
    res.render("login.ejs");
});

app.get("/register",function(req,res){
    res.render("register.ejs");
});

app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });
        if (foundUser) {
            // şifrelenmiş şifreyi kontrol etmek için şifrelemeyi tekrar uygulayın
            const tempUser = new User({
                email: username,
                password: password
            });

            if (tempUser.password === foundUser.password) { // bu karşılaştırma şifrelenmiş şifreler arasında yapılır
                res.render("secrets.ejs");
            } else {
                res.status(401).send("Hatalı parola girdiniz !!!");
            }
        } else {
            res.status(401).send("Böyle bir email bulunamadı...");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// app.post("/login",async function(req,res){
//     const username=req.body.username;
//     const password=req.body.password;
//     try {
//         if (await User.findOne({email: username})) {
//             if (await User.findOne({password: password})) {
//                 res.render("secrets.ejs");
//             } else {
//                 res.status(401).send("Hatalı parola girdiniz !!!");
//             }
//         } 
//         else {
//             res.status(401).send("Böyle bir email bulunamadı...");
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).send("Internal Server Error");
//     }
// });

app.post("/register",function(req,res){
    const newUser=new User({
        email:req.body.username,
        password:req.body.password,
    });
    newUser.save()
    .catch(function(err){
        console.log(err);
    });
    res.render("secrets.ejs");

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
