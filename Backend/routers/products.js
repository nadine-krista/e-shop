const {Product}=require('../models/product');
const express = require('express');
const router=express.Router();
const {Category}=require("../models/category");
const mongoose=require('mongoose');

router.get(`/`, async(req,res)=>{
    // const productList = await Product.find().select('name image -_id');
    const productList = await Product.find().populate('category');
    if(!productList){
        return res.status(500).json({success:false});
    }
    res.status(200).send(productList);
});

router.get(`/:id`,async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category');
    if(!product){
         return res.status(500).json({success:false});
    }
    res.status(200).send(product);
})

router.put('/:id',async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid Product Id');
    }
    const category=await Category.findById(req.body.category);
    if(!category){
        res.status(400).send('Invalid Category!!');
    }
    const product= await Product.findByIdAndUpdate(req.params.id,{
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:req.body.image,
        images:req.body.images,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured,
        dateCreated:req.body.dateCreated
    },{new:true});
    if(!product){
        return res.status(500).json({success:false, message:'Product has not been updated!!'})
    }
    res.status(200).send(product);
})

router.post('/',async(req,res)=>{
    const category = await Category.findById(req.body.category);

    if(!category) return res.status(400).send('Invalid Category!!');

    let product=new Product({
        id:req.body.id,
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:req.body.image,
        images:req.body.images,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured,
        dateCreated:req.body.dateCreated
    });
    //category.save returns a promise 
    product=await product.save();
    if(!product){
        return res.status(404).send('the product cannot be created')
    }
    res.send(product);
})

router.delete('/:id',(req,res)=>{
    Product.findByIdAndRemove(req.params.id).then((product)=>{
        if(product){
            return res.status(200).json({success:true, message:'the product has been deleted'})
        }else{
            return res.status(404).json({success:false, message:'product not found!'})
        }
    }).catch(error=>{
        return res.status(400).json({success:false, error:err});
    })
})

router.get(`/get/count`,async (req,res)=>{
    const productCount = await Product.countDocuments((count)=>count);
    if(!productCount){
         return res.status(500).json({success:false});
    }
    res.status(200).send({
        count:productCount
    });
})

router.get(`/get/featured`,async (req,res)=>{
    const featuredProducts = await Product.find({isFeatured:true});
    if(!featuredProducts){
         return res.status(500).json({success:false});
    }
    res.status(200).send(featuredProducts);
})

router.get(`/get/featured/:count`,async (req,res)=>{
    const count=req.params.count?req.params.count:0;
    const featuredProducts = await Product.find({isFeatured:true}).limit(+count);
    if(!featuredProducts){
         return res.status(500).json({success:false});
    }
    res.status(200).send(featuredProducts);
})
//If we pass {category:categories} like this inside find then in case of category Id passed 
//we will get no data returned
router.get(`/filterByCategory`, async(req,res)=>{
    //http://localhost:3000/api/v1/products?categories=21345,76345
    let categories=[];
    if(req.params.categories){
        categories = req.params.categories.split(',');
    }
    const productList = await Product.find({category:categories}).populate('category');
    if(!productList){
        return res.status(500).json({success:false});
    }
    res.status(200).send(productList);
});
//If we pass filter varaible as an object like below in case no property is passed then all the products will be returned
router.get(`/filterByCategory`, async(req,res)=>{
    //http://localhost:3000/api/v1/products?categories=21345,76345
    let filter={};
    if(req.params.categories){
        filter = {category: req.params.categories.split(',')};
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList){
        return res.status(500).json({success:false});
    }
    res.status(200).send(productList);
});

module.exports=router;