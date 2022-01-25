//jshint esversion:6


//requiring the necessary packages
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose=require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app=express();


app.use(express.static("public"));
app.set('view engine','ejs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(
    session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");


const userSchema=new mongoose.Schema({
    email:String,
    password:String,
    googleID:String,
    secret:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User=new mongoose.model("User",userSchema);


////////////////////Passport strategies and sessions handling//////////////////

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },

//   function(accessToken, refreshToken, profile, cb){
//       console.log(profile.id)
//       User.findOne({
//         googleID:profile.id
//       },function(err,user){
//           if(err){
//             return cb(err);
//           }
//           if(!user){
//               user=new User({
//                 googleID:profile.id
//               });
//               user.save(function(err) {
//                 if (err) console.log(err);
//                 return cb(err, user);
//             });
//           }
//           else{
//             return cb(err, user);
//           }
//       }
//       );
//   }

    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleID: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));


/////////////////////////Register, Login and Logout/////////////////////////////



app.post("/register",function(req,res){

    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }

        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }


    });
    
});

app.post("/login",function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        res.render("submit");
    }

    else{
        res.redirect("/login");
    }
});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});


///////////////handling the get and post methods for different routes///////////

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});



app.post("/submit",function(req,res){
    const submittedSecret=req.body.secret;

    User.findById(req.user.id,function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                foundUser.secret=submittedSecret;
                foundUser.save();
                res.redirect("/secrets");
            }
        }
    });

});


app.get("/secrets",function(req,res){
    User.find({secret:{$ne:null}},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                res.render("secrets",{usersWithSecrets:foundUser});
            }
        }
    });
});



app.listen(3000,function(){
    console.log("server started on port 3000");
})