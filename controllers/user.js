const express=require("express")
const router=express.Router()
const jwt=require('jsonwebtoken')
const catchAsync=require('../utils/catchAsync')
const ExpressError=require('../utils/ExpressError')
const {validatePainting}=require('../middleware')
const User=require('../models/users')
const users=require("../controllers/user")
const {isLoggedIn}=require('../middleware')
const age=3*24*60*60;
const signIn=(req,res)=>{
    res.render('users/register')
    const user=new User(req.body.user)
}
const register=async(req,res)=>{
    try{
    const user=new User(req.body.user)
    await user.save();
    const token=createToken(user._id);
    res.cookie('jwt',token,{httpOnly:true,maxAge:age*1000})
    res.status(201).json({user:user._id});
    req.session.user_id=user._id
    res.locals.user=user._id;
   // req.flash('success', 'Successfully made a new campground!');
   //req.flash('success','successfully created an account');
    res.redirect('/paintings')
    }
    catch(e){
        res.redirect('/register')
    }
}
const loginPage=(req,res)=>{
    res.render('users/login')
}
const login=async(req,res)=>{
    const testUser=new User(req.body.user)
   const user=await User.findOne({username:testUser.username})

   if(user){
         user.comparePassword(testUser.password, function(err, isMatch) {
         if (err) throw err;
        
        if(isMatch){
            req.session.user_id=user._id
        
      // req.flash('success','successfully loggedin');
        res.redirect('/paintings')
        }
    })
}
 else{
    res.redirect('/login')
}
}
const dashboard=async(req,res)=>{
    console.log('in dashboad')
    const user=await User.findById(req.session.user_id)
    res.render('dashboard',{user})
}
    module.exports={signIn,register,loginPage,login,dashboard}