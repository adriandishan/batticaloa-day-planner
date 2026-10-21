// Non-destructive seed. Safe to re-run.
//  - Places that do not exist yet are inserted.
//  - Existing places keep every field an administrator edited.
//  - Coordinates are refreshed ONLY for places whose coordinates are not marked "verified" in the admin form.
//  - The admin account is created if missing. An existing admin password is changed only with --reset-admin.
require("dotenv").config();
const mongoose=require("mongoose"),bcrypt=require("bcryptjs"),Place=require("./models/Place"),Admin=require("./models/Admin"),places=require("./data/places.json");
(async()=>{const {MONGODB_URI,ADMIN_EMAIL,ADMIN_PASSWORD}=process.env;
if(!MONGODB_URI||!ADMIN_EMAIL||!ADMIN_PASSWORD||ADMIN_PASSWORD.length<10){console.error("Set MONGODB_URI, ADMIN_EMAIL and an ADMIN_PASSWORD of 10+ characters in server/.env");process.exit(1)}
await mongoose.connect(MONGODB_URI);let added=0,geo=0;
for(const p of places){
  const r=await Place.updateOne({id:p.id},{$setOnInsert:p},{upsert:true});if(r.upsertedCount)added++;
  const g=await Place.updateOne({id:p.id,geoVerified:{$ne:true}},{$set:{lat:p.lat??null,lng:p.lng??null,geoVerified:!!p.geoVerified}});if(g.modifiedCount)geo++}
const email=ADMIN_EMAIL.toLowerCase(),hash=async()=>bcrypt.hash(ADMIN_PASSWORD,12);
if(process.argv.includes("--reset-admin"))await Admin.updateOne({email},{passwordHash:await hash()},{upsert:true});
else await Admin.updateOne({email},{$setOnInsert:{email,passwordHash:await hash()}},{upsert:true});
const missing=await Place.countDocuments({$or:[{lat:null},{lat:{$exists:false}}]});
console.log(`Places added: ${added}. Coordinates refreshed on ${geo} unverified place(s). Places still missing coordinates: ${missing}.`);process.exit(0)})();
