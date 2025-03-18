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
const { log } = require('console');

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
 //creating a token for the user which take email and user id as payload and secret is our secret key
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
    //checkinig the encrypted password from db with the password from req.body
    bcrypt.compare(password, user.password, function(err, result) {
       if(result){
        //if user found then create a token and set it in the cookie and send status 200
        let token = jwt.sign({email:email, userid:user._id},"secret")
        res.cookie('token', token);
        res.status(200).redirect('/profile');
       }
       else res.redirect('/login')
    });
});



//middleware for checking if the user is logged in or not using the jwt token that we provide before while login
function isLoggedIn(req, res,next){
    if(!req.cookies.token){
        return res.redirect('login');
    }
    else{
       let data = jwt.verify(req.cookies.token, 'secret');
         req.user = data;
          next();
          }
}

//isLOggenIn function check if the user is already login or not
app.get('/profile', isLoggedIn, async(req, res) => {
    
    
 let user=await userModel.findOne({email:req.user.email}).populate('posts') //this req.user.email is from isLOggedIn function above
 
 res.render('profile', {user:user})
})

app.post('/post',isLoggedIn, async(req, res) => {
    let user = await userModel.findOne({email:req.user.email})
   let post = await postModel.create({
      user:user._id,
      content:req.body.content
    })

    //posting poat in users post array
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile')
   });

//logout route for clearing the token from cookie
app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.redirect('/login')
});

app.get('/like/:id', isLoggedIn, async(req, res) => {
    try {
        let post = await postModel.findOne({ _id: req.params.id }).populate('user');
        if (!post) {
            return res.status(404).send('Post not found');
        }
        if (post.likes.indexOf(req.user.userid) === -1) {
            post.likes.push(req.user.userid);
        } else {
            post.likes.splice(post.likes.indexOf(req.user.userid), 1);
        }
        await post.save();
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/edit/:id',async(req,res)=>{ 
    let post = await postModel.findOne({_id:req.params.id})
    res.render('edit',{post:post})
});

app.post('/edit/:id', async(req,res)=>{
  await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content})
    res.redirect('/profile')
})

app.get('/delete/:id', async(req,res)=>{
   await postModel.findOneAndDelete({_id:req.params.id})
    res.redirect('/profile')
});
app.listen(3000, () => {});

