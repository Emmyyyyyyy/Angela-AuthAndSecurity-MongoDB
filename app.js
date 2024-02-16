require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose')
// const encrypt = require('mongoose-encryption')
// const md5 = require('md5')
// const bcrypt = require('bcrypt')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express()

// console.log(process.env.SECRET);

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true})

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
})

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

userSchema .plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.get('/register', (req, res)=>{
    res.render('register')
})

app.get('/secrets', (req, res)=>{
    if(req.isAuthenticated()){
        res.render('secrets')
    } else {
        res.redirect('/login')
    }
})

app.get('/logout', (req, res)=>{
    req.logout((err)=>{
        if(err) {
            console.log(err);
        }else {
            res.redirect('/')
        }
    })
})

app.post('/login', async (req, res)=>{
    // const username = req.body.username
    // const password = req.body.password
    // try {
    //     const isUser = await User.findOne({email: username})
    //     if(isUser) {
    //         if(await bcrypt.compare(password, isUser.password)) {
    //             res.render('secrets')
    //             console.log('login successful');
    //         }
    //     } 
    // } catch (error) {
    //     console.error('Error saving user:', error);
    // }

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err)=>{
        if(err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, ()=>{
                res.redirect('/secrets')
            })
        }
    })
})

app.post('/register', async (req, res) => {
    // try {
    //     const saltRounds = 10;
    //     const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hashedPassword
    //     });
    //     await newUser.save();
    //     res.render('secrets')
    //     console.log('User saved successfully');
    // } catch (error) {
    //     console.error('Error saving user:', error);
    // }

    User.register({username: req.body.username, active: false}, req.body.password, (err, user)=>{
        if (err) { 
            console.log(err);
            res.redirect('/register')
        } else {
            passport.authenticate("local")(req, res, ()=>{
                res.redirect('/secrets')
            })
        }
    });
});

app.listen(3000, ()=>{
    console.log("start"); 
})