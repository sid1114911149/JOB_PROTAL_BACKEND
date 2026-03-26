const mongoose=require('mongoose');
const applicationSchema=new mongoose.Schema({
    job:{
        type:String,
        required:true
    },applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },status:{
        type:[String],
        enum:["pending","accepted","rejected"],
        required:true,
        default:"pending"
    }
},{timestamps:true});
module.exports=mongoose.model('Application',applicationSchema);