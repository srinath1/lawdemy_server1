const { Schemas } = require('aws-sdk')
const mongoose=require('mongoose')
const{Schema}=mongoose
const{ObjectId}=Schema
const completedSchema=new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:'User'
    },
    course:{
        type:ObjectId,
        ref:'Course'
    },
    lessons:[]
},
{timeStams:true})
module.exports=mongoose.model('Completed',completedSchema)