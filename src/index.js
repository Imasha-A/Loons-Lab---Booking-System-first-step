const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require("multer");
const User = require("./config");
const session = require('express-session')

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized:true
}));

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb){
        cb(null, Date.now()+ '-' +file.originalname);
    }
});

const upload = multer({storage: storage});

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", upload.single('picture'), async (req, res)=>
{
    try{
        const { firstName, lastName, mobileNumber, email, password } = req.body;
        const picture = req.file.path;

        const userExists = await User.findOne({email: email});

        if (userExists)
        {
            res.send("User already exists in database. Please choose a different email.")
        }
        else
        { 
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newUser = new User({
                firstName,
                lastName,
                mobileNumber,
                email,
                password: hashedPassword,
                picture
            });

            const savedUser = await newUser.save();
            res.send("User registered successfully. The user account has been created.");
        }
    }catch (error){
        console.error(error);
        res.send("Error occurred during sign up.");
    }    
});

app.post("/login", async (req, res)=>
{
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email:email});
        if(!user){
            res.send("Email not found");
        } else{
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid)
            {
                req.session.user = user;
                res.redirect("/dashboard");
            } else {
                req.send("Incorrect Password")
            }
        }
    }catch (error) {
        console.error(error);
        res.send("Error occurred during login.");
    }
});

app.get("/dashboard", (req, res)=>{
    if (req.session.user){
        res.render("dashboard", {user: req.session.user});
    }else{
        res.redirect("/");
    }
});

app.get("/logout", (req, res)=>{
    req.session.destroy(err=>{
        if (err){
            return res.send("Error logging out.");
        }            
        res.redirect("/");
    });
});

const port = 5000;
app.listen(port, ()=>{
    console.log(`Server running on Port: ${port}`);
});