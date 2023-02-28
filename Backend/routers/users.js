const {User}=require('../models/user');
const express = require('express');
const router=express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');


router.get(`/`, async(req,res)=>{
    const userList = await User.find().select('-passwordHash');
    if(!userList){
        return res.status(500).json({success:false});
    }
    res.status(200).send(userList);
});

router.get(`/:id`,async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');
    if(!user){
        return res.status(500).json({success:false, message: 'User with the given Id not Found'})
    }
    res.status(200).send(user);
})

router.post('/',async(req,res)=>{
   
    let user=new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password,10),
        street:req.body.street,
        apartment:req.body.apartment,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        isAdmin:req.body.isAdmin
    });
    //category.save returns a promise 
    user=await user.save();
    if(!user){
        return res.status(404).send('the User cannot be created')
    }
    res.send(user);
})
router.put('/:id',async(req,res)=>{
    const userExists = await User.findById(req.params.id);
    if(!userExists){
        return res.status(404).send('User not found!!')
    }
    let password=userExists.passwordHash;
    if(req.body.password){
        password=bcrypt.hashSync(req.body.password,10);
    }
    const user= await User.findByIdAndUpdate(req.params.id,{
        name:req.body.name,
        email:req.body.email,
        passwordHash:password,
        street:req.body.street,
        apartment:req.body.apartment,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        isAdmin:req.body.isAdmin
    },{new:true});
    if(!user){
        return res.status(500).json({success:false, message:'User has not been updated!!'})
    }
    res.status(200).send(user);
})

router.post('/login',async(req,res)=>{
    const userExists = await User.findOne({email:req.body.email});
    if(!userExists){
        return res.status(404).send('User not found!!')
    }
    if(userExists && bcrypt.compareSync(req.body.password,userExists.passwordHash)){
        const token= jwt.sign({
            userId:userExists.id,
            isAdmin:userExists.isAdmin
        },process.env.SECRET,{expiresIn:'1d'});
        res.status(200).send({user:userExists.email,token:token});
    }else{
        res.status(404).send('Password is wrong')
    }
})

router.post('/register',async(req,res)=>{
   
    let user=new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password,10),
        street:req.body.street,
        apartment:req.body.apartment,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        isAdmin:req.body.isAdmin
    });
    //category.save returns a promise 
    user=await user.save();
    if(!user){
        return res.status(404).send('the User cannot be Registered')
    }
    res.send(user);
})

module.exports=router;