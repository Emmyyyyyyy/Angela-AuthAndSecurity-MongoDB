require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose')
// const encrypt = require('mongoose-encryption')
// const md5 = require('md5')
const bcrypt = require('bcrypt')

const app = express()

// console.log(process.env.SECRET);

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true})

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
})

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema)

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.get('/register', (req, res)=>{
    res.render('register')
})

app.post('/login', async (req, res)=>{
    const username = req.body.username
    const password = req.body.password
    try {
        const isUser = await User.findOne({email: username})
        if(isUser) {
            if(await bcrypt.compare(password, isUser.password)) {
                res.render('secrets')
                console.log('login successful');
            }
        } 
    } catch (error) {
        console.error('Error saving user:', error);
    }
})

app.post('/register', async (req, res) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = new User({
            email: req.body.username,
            password: hashedPassword
        });
        await newUser.save();
        res.render('secrets')
        console.log('User saved successfully');
    } catch (error) {
        console.error('Error saving user:', error);
    }
});

app.listen(3000, ()=>{
    console.log("start"); 
})