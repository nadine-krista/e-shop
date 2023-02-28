const {Product}=require('../models/product');
const express = require('express');
const router=express.Router();
const {Category}=require("../models/category");
const mongoose=require('mongoose');
const multer = require ('multer');

const FILE_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('Invalid Image type')
      if(isValid){
        uploadError=null;
      }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName=file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
  })
  
  const uploadOptions = multer({ storage: storage })

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

router.put('/:id',uploadOptions.single('image'),async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid Product Id');
    }
    const category=await Category.findById(req.body.category);
    if(!category){
        res.status(400).send('Invalid Category!!');
    }

    const productExists=await Product.findById(req.params.id);
    if(!productExists){
        res.status(400).send('Product Not Found!!');
    }
    const file = req.file;
    let imagePath;
    if(file){
        const filename=req.file.filename;// gets the file name from the uploaded diskstorage by multer. but this file name will have only the file name and not the full path of image storage.
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
        imagePath=`${basePath}${filename}`;
    }else{
        imagePath=productExists.image;
    }
    const product= await Product.findByIdAndUpdate(req.params.id,{
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:imagePath,
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
//multer will take care of the image upload and send the file details in request.
router.post('/',uploadOptions.single('image'),async(req,res)=>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category!!');
    //To make sure Image is uploaded as part of request.
    const file = req.file;
    if(!file) return res.status(400).send('No Image in the Request!!');
   
    const filename=req.file.filename;// gets the file name from the uploaded diskstorage by multer. but this file name will have only the file name and not the full path of image storage.
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    let product=new Product({
        id:req.body.id,
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:`${basePath}${filename}`,
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

//For uploading gallery of images
//We can specify the number of images it can upload per request
router.put('/gallery-images/:id',uploadOptions.array('images',10),async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid Product Id');
    }
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    const files=req.files;
    let imagePaths=[];
    files?.map(file=>{
        imagePaths.push(`${basePath}${req.file.fieldname}`)
    })
    const product= await Product.findByIdAndUpdate(req.params.id,{
        images:imagePaths,  
    },{new:true});
    if(!product){
        return res.status(500).json({success:false, message:'Product Images has not been uploaded!!'})
    }
    res.status(200).send(product);
})

router.get(`/get/count`,async (req,res)=>{
    const userCount = await User.countDocuments((count)=>count);
    if(!userCount){
         return res.status(500).json({success:false});
    }
    res.status(200).send({
        count:userCount
    });
})
module.exports=router;