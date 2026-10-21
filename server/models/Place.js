const m=require("mongoose");
const s=new m.Schema({id:{type:String,unique:true,required:true},n:{type:String,required:true,trim:true},c:{type:String,required:true},g:{type:String,required:true,enum:["Heritage","Coast","Culture","Nature"]},
km:{type:Number,required:true,min:0.1,max:25},lat:{type:Number,min:5.5,max:10,default:null},lng:{type:Number,min:79,max:82.2,default:null},geoVerified:{type:Boolean,default:false},h:String,d:{type:Number,default:60},b:String,t:{type:String,required:true},tr:String,img:String},{timestamps:true});
s.set("toJSON",{transform:(_,o)=>{delete o._id;delete o.__v;delete o.createdAt;delete o.updatedAt}});
module.exports=m.model("Place",s);
