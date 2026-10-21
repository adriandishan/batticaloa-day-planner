const m=require("mongoose");
module.exports=m.model("Admin",new m.Schema({email:{type:String,unique:true,required:true,lowercase:true},passwordHash:{type:String,required:true}},{timestamps:true}));
