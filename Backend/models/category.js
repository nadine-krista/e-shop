const mongoose = require('mongoose');
const categorySchema = mongoose.Schema({
    id:{type:String,
        required:true
    },
    name:{
        type:String,
        rquired:true
    },
    color:{
        type:String
    },
    icon:{
        type:String
    },
    image:{
        type:String
    }
})
exports.Category=mongoose.model('Category', categorySchema);