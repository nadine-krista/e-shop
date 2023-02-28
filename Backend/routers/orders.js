const {Order}=require('../models/order');
const express = require('express');
const router=express.Router();
const mongoose=require('mongoose');
const { OrderItem } = require('../models/order-item');

router.get(`/`, async(req,res)=>{
    //if we want to populate only name from User table 
    const orderList = await Order.find()
    .populate('user','name')
    .populate({path:'orderItems', populate:
        {path:'product',populate:'category'}
    })
    .sort({'dateOrdered':-1});

    if(!orderList){
        return res.status(500).json({success:false});
    }
    res.status(200).send(orderList);
});

router.get(`/:id`,async (req,res)=>{
    const order = await Order.findById(req.params.id)
    .populate('user','name')
    .populate({path:'orderItems', populate:
        {path:'product',populate:'category'}
    });

    if(!order){
         return res.status(500).json({success:false});
    }
    res.status(200).send(order);
})
//In orders we need to update only one field that is the status.
router.put('/:id',async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid Order Id');
    }
    const order= await Order.findByIdAndUpdate(req.params.id,{
        status:req.body.status
    },{new:true});
    if(!order){
        return res.status(500).json({success:false, message:'Order Status has not been updated!!'})
    }
    res.status(200).send(order);
})

router.post('/',async(req,res)=>{
    //here first we need to save the order items to table and then save the order 
    // item ids alone to the Order.
    //Promise.all will combine multiple promises and will return one promise.
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem=>{
        let newOrderItem = new OrderItem({
            quantity:orderItem.quanity,
            product:orderItem.product
        })
        //await returns promises hence newOrderItem._id will not work. so will have to enclose the function with Promise.all to resolve it.
        newOrderItem= await newOrderItem.save();
        return newOrderItem._id;
    }));
    // need to await to get orderItems resolved to get id's
    const orderItemsIdsResolved= await orderItemsIds;
    //This will return array of prices;
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItem)=>{
        const orderItemExists = await OrderItem.findById(orderItemId).populate('product','price');
        const orderPrice = orderItemExists.product.price * orderItem.quanity;
        return orderPrice;
    }))

    const totalPrice = totalPrices.reduce((a,b)=>a+b,0);
    
    let order=new Order({
        orderItems:orderItemsIdsResolved,
        shippingAddress1:req.body.shippingAddress1,
        shippingAddress2:req.body.shippingAddress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        status:req.body.status,
        totalPrice:totalPrice,
        user:req.body.user
    });
    //category.save returns a promise 
    order=await order.save();
    if(!order){
        return res.status(404).send('the Order cannot be created')
    }
    res.send(order);
})
//deleting orders alone is not enough. related order items also should be deleted.
router.delete('/:id',(req,res)=>{
    Order.findByIdAndRemove(req.params.id).then(async (order)=>{
        if(order){
            //order Item have only ids
            await order.orderItems.map(async orderItem=>{
                await orderItem.findByIdAndRemove(orderItem);
            })
            return res.status(200).json({success:true, message:'the Order has been deleted'})
        }else{
            return res.status(404).json({success:false, message:'Order not found!'})
        }
    }).catch(error=>{
        return res.status(400).json({success:false, error:err});
    })
})
//a group specification cannot be created without an id
router.get(`/get/totalsales`,async (req,res)=>{
    const totalSales = await Order.aggregate([
        {$group:{_id:null, totalSales:{$sum:'$totalPrice'}}}
    ])
    if(!totalSales){
        return res.status(404).json({success:false, message:'Total Sales cannot be generated!'})
    }
    //this will send an array object with id null and totalSales
    //res.send({totalSales:totalSales});
    // this will send totalSales value alone.
    res.send({totalSales:totalSales.pop().totalSales})
})

router.get(`/get/count`,async (req,res)=>{
    const orderCount = await Order.countDocuments((count)=>count);
    if(!orderCount){
         return res.status(500).json({success:false});
    }
    res.status(200).send({
        count:orderCount
    });
});

router.get(`/get/usersorder/:userId`, async(req,res)=>{
    //if we want to populate only name from User table 
    const userOrderList = await Order.find({user:req.params.userId})
    .populate({path:'orderItems', populate:
        {path:'product',populate:'category'}
    })
    .sort({'dateOrdered':-1});

    if(!userOrderList){
        return res.status(500).json({success:false});
    }
    res.status(200).send(userOrderList);
});

module.exports=router;