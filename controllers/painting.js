const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync')
const ExpressError=require('../utils/ExpressError')
const paintings=require("../controllers/painting")
const {validatePainting}=require('../middleware')
const User=require('../models/users')
const {isLoggedIn}=require('../middleware')
const Painting=require('../models/paintings')
const multer=require('multer');
var session = require('express-session')
const flash=require('connect-flash')
const {storage}=require('../cloudinary')
const upload=multer({storage});
const index=async(req,res)=>{
    req.flash('success','Successfully made a new campground!');
    
    const paintings=await Painting.find({}).populate('sellername');
 
    res.render('paintings/index',{paintings})

   
   //req.flash('success','successfully loggedin');
}
const addnew=(req,res)=>{
    res.render('paintings/new')
}
const showPainting=async(req,res)=>{
    const painting=await Painting.findById(req.params.id).populate('sellername')
    res.render('paintings/show',{painting,req})
}

const deletePainting=async(req,res)=>
{
    const {id}=req.params;
    await Painting.findByIdAndDelete(id)
    res.redirect('/paintings')
}
const showEditpage=async(req,res)=>{
    const painting=await Painting.findById(req.params.id).populate('sellername')
    res.render('paintings/edit',{painting})
}
const createPainting=async(req,res)=>{
 
    const painting=new Painting(req.body.painting);
    painting.images=req.files.map(f=>({url:f.path,filename:f.filename}))
   
    if(!req.body.painting) throw new ExpressError('invalid data',505)
  

    
    painting.sellername=req.session.user_id;
    await painting.save();
   
 
   res.redirect(`/paintings/${painting.id}`)
}
const editPainting=async(req,res)=>{
    const {id}=req.params;

 const painting=await Painting.findByIdAndUpdate(id,{ ...req.body.painting})
   const imgs=req.files.map(f=>({
    url:f.path,
    filename:f.filename
}))
    painting.images.push(...imgs);
    
    await painting.save()
    if(req.body.deleteImages){
        for(let file in req.body.deleteImages){
            await cloudinary.uploader.destroy(file);
        }
        await painting.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    await painting.save()
    res.redirect(`/paintings/${painting._id}`)
}


const addToCart=async(req,res)=>
{console.log("added to cart")
res.redirect('/paintings')
    
}
module.exports={index,addnew,showPainting,deletePainting,showEditpage,createPainting,editPainting,addToCart}