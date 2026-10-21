require("dotenv").config();
const express=require("express"),mongoose=require("mongoose"),jwt=require("jsonwebtoken"),bcrypt=require("bcryptjs"),rate=require("express-rate-limit"),path=require("path");
const Place=require("./models/Place"),Admin=require("./models/Admin");
const {MONGODB_URI,JWT_SECRET,PORT=3000}=process.env;
if(!MONGODB_URI||!JWT_SECRET){console.error("Set MONGODB_URI and JWT_SECRET in server/.env");process.exit(1)}
const app=express();app.use(express.json({limit:"100kb"}));
const guard=role=>(req,res,next)=>{try{const t=jwt.verify((req.headers.authorization||"").replace("Bearer ",""),JWT_SECRET);if(t.role!==role)throw 0;req.uid=t.sub;next()}catch{res.status(401).json({error:"Please sign in."})}};
const auth=guard("admin");
const limiter=rate({windowMs:15*60*1000,max:20,message:{error:"Too many attempts. Try again in 15 minutes."}});
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);
const pick=b=>{const o={};["n","c","g","km","h","d","b","t","tr","img"].forEach(k=>{if(b[k]!==undefined)o[k]=typeof b[k]=="string"?b[k].trim():b[k]});
for(const k of ["lat","lng"]){if(b[k]===undefined)continue;o[k]=(b[k]===null||b[k]==="")?null:Number(b[k])}
if(b.geoVerified!==undefined)o.geoVerified=b.geoVerified===true;if(o.lat==null||o.lng==null)o.geoVerified=false;return o};
const coordErr=o=>{const a=o.lat==null,b=o.lng==null;if(a&&b)return null;if(a||b)return"Enter both latitude and longitude, or leave both empty.";
return(Number.isFinite(o.lat)&&Number.isFinite(o.lng)&&o.lat>=5.5&&o.lat<=10&&o.lng>=79&&o.lng<=82.2)?null:"Enter a valid latitude and longitude in Sri Lanka."};
const imgErr=o=>(!o.img||/^(images\/[\w.\-]+\.(jpe?g|png|webp|gif|svg)|https:\/\/[^\s"'<>]+)$/i.test(o.img))?null:"Image path must be a file in the images folder or an https link.";
const bad=o=>!o.n?"Enter a name.":!o.t?"Enter a description.":!(o.km>0&&o.km<=25)?"Distance must be between 0.1 and 25 km.":imgErr(o)||coordErr(o);
app.get("/api/places",async(_,res)=>res.json(await Place.find().sort({km:1})));
app.post("/api/admin/login",limiter,async(req,res)=>{
const a=await Admin.findOne({email:String(req.body.email||"").toLowerCase()});
if(!a||!(await bcrypt.compare(String(req.body.password||""),a.passwordHash)))return res.status(401).json({error:"Email or password is incorrect."});
res.json({token:jwt.sign({sub:a.id,role:"admin"},JWT_SECRET,{expiresIn:"2h"})})});
app.post("/api/places",auth,async(req,res)=>{const o=pick(req.body),e=bad(o);if(e)return res.status(400).json({error:e});
try{res.status(201).json(await Place.create({...o,id:slug(o.n)+"-"+Date.now().toString(36).slice(-4)}))}catch(x){res.status(400).json({error:x.message})}});
app.put("/api/places/:id",auth,async(req,res)=>{const o=pick(req.body),e=bad(o);if(e)return res.status(400).json({error:e});
const p=await Place.findOneAndUpdate({id:req.params.id},o,{new:true,runValidators:true});p?res.json(p):res.status(404).json({error:"Place not found."})});
app.delete("/api/places/:id",auth,async(req,res)=>{const p=await Place.findOneAndDelete({id:req.params.id});p?res.json({ok:true}):res.status(404).json({error:"Place not found."})});
app.use(express.static(path.join(__dirname,"..","public")));
mongoose.connect(MONGODB_URI).then(()=>app.listen(PORT,()=>console.log("Running on http://localhost:"+PORT))).catch(e=>{console.error("MongoDB connection failed:",e.message);process.exit(1)});
