const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use (express.static(path.join(__dirname, 'public'))); 
app.use(cookieParser());
const bcrypt = require('bcrypt');

//this is home route
app.get('/', (req, res) => {
    res.send('working')
});

//route for going to register page
app.get('/register', async (req, res) => {
  res.render('index')
})

//route for getting data from register page and posting into database 
app.post('/register', async (req, res) => {
    let {username, name, age, email, password} = req.body; //destructuring data coming from form
    let newuser = await userModel.findOne({email:email});
    if(newuser){
        res.status(500).send('User already exists');} //checking if user already exists
        //encrypting the password using the bcrypt
        bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(password, salt, async function(err, hash){
            //saving the data into the variable user and create user through mongoose
          let user = await userModel.create({
               username: username,
               name: name,
               age: age,
               email: email,
               password: hash
            })
 //creating a token for the user which take email and user id as payload
            let token = jwt.sign({email:email, userid:user._id},"secret")
            res.cookie('token', token); //setting the token in the cookie
            res.redirect('/')
        });
    });
})

//route for login page
app.get('/login',  (req, res) => {
    res.render('login')
})

//route for getting data from login page and checking if the user exists or not
app.post('/login', async (req, res) => {
    let{email, password} = req.body;    
    let user = await userModel.findOne({email:email})
    if(!user){
        //if user not found then send status 500 and send message
        res.status(500).send('username or password incorrect');
    }
    bcrypt.compare(password, user.password, function(err, result) {
       if(result){
        //if user found then create a token and set it in the cookie and send status 200
        let token = jwt.sign({email:email, userid:user._id},"secret")
        res.cookie('token', token);
        res.status(200).send('logged in');
       }
       else res.redirect('/login')
    });
});



//middleware for checking if the user is logged in or not using the jwt token that we provide before while login
function isLoggedIn(req, res,next){
    if(req.cookies.token === ''){
        res.send('you must log in');
    }
    else{
       let data = jwt.verify(req.cookies.token, 'secret');
         req.user = data;
          next();
          }
}

app.get('/profile', isLoggedIn, (req, res) => {
    res.send ('post goes here')
})


app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.redirect('/login')
});






app.listen(3000, () => {});