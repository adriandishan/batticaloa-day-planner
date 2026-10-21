const API="/api",$=s=>document.querySelector(s),root=$("#root");
const CATS=["History","Landmark","Beach","Cultural","Lagoon","Religious","Shopping","Leisure","Nature"],GROUPS=["Heritage","Coast","Culture","Nature"];
let token=sessionStorage.getItem("tok"),places=[];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const noGeo=p=>p.lat==null||p.lng==null;
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.i);toast.i=setTimeout(()=>t.classList.remove("on"),2600)}
document.addEventListener("error",e=>{if(e.target.tagName=="IMG")e.target.style.visibility="hidden"},true);
async function api(path,opt={}){let r;try{r=await fetch(API+path,{...opt,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})}})}catch(e){throw new Error("Cannot reach the server. Start it with npm start, then reload.")}
const d=await r.json().catch(()=>({}));if(r.status==401&&token&&path!="/admin/login"){logout();throw new Error("Your session expired. Sign in again.")}if(!r.ok)throw new Error(d.error||"Something went wrong. Try again.");return d}
function logout(){token=null;sessionStorage.removeItem("tok");login()}
function login(){document.title="Administrator sign-in · Batticaloa Day Planner";root.innerHTML=`<div class="login"><div class="vis"><img src="images/batticaloa-lagoon-aerial.jpg" fetchpriority="high" decoding="async" alt="Aerial view of Batticaloa lagoon at sunset with palm-fringed houses along the shore"><div class="vt"><span class="badge-a">Administrators only</span><h2 style="margin-top:12px">Keep every place up to date</h2><p>Add, edit and remove the attractions visitors see on the planner.</p></div></div>
<div class="fm"><form id="lf" novalidate><a class="brand" href="index.html"><i></i>Batticaloa Day Planner</a><div><h1>Administrator sign-in</h1></div><p class="sub">This area is for authorised administrators only. Visitors can use the public site.</p>
<div class="err" id="er" role="alert" aria-live="assertive" hidden></div>
<label>Email<input class="in" type="email" name="email" autocomplete="username" required autofocus></label>
<label>Password<span class="pw"><input class="in" type="password" name="password" autocomplete="current-password" required><button type="button" id="sp" aria-label="Show password">Show</button></span></label>
<button class="btn s" id="sb">Sign in</button><a class="back" href="index.html">Back to the visitor website</a></form></div></div>`;
$("#sp").onclick=()=>{const i=$("[name=password]"),s=i.type=="password";i.type=s?"text":"password";$("#sp").textContent=s?"Hide":"Show"};
$("#lf").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),er=$("#er");er.hidden=true;
if(!f.get("email").trim()||!f.get("password")){er.textContent="Enter your email and password.";er.hidden=false;return}
const b=$("#sb");b.disabled=true;b.textContent="Signing in…";
try{const d=await api("/admin/login",{method:"POST",body:JSON.stringify({email:f.get("email").trim(),password:f.get("password")})});token=d.token;sessionStorage.setItem("tok",token);dash()}
catch(x){er.textContent=x.message;er.hidden=false;b.disabled=false;b.textContent="Sign in"}}}
async function dash(){document.title="Admin · Batticaloa Day Planner";root.innerHTML=`<div class="dash"><header class="dbn"><img src="images/batticaloa-fishing-sunset.jpg" alt=""><div class="dbt"><small>Administrator</small><h1>Manage places</h1></div><div class="dba"><button class="btn" id="add">Add place</button><a class="btn g" href="index.html">View site</a><button class="btn g" id="lo">Sign out</button></div></header><div id="gw"></div>
<div class="tbl"><table><thead><tr><th></th><th>Name</th><th>Category</th><th>Distance</th><th>Coordinates</th><th>Hours</th><th></th></tr></thead><tbody id="tb"><tr><td colspan="7">Loading places…</td></tr></tbody></table></div></div><dialog id="dlg"></dialog>`;
$("#lo").onclick=logout;$("#add").onclick=()=>form();
try{places=await api("/places");list()}catch(x){toast(x.message)}}
function list(){const miss=places.filter(noGeo);$("#gw").innerHTML=miss.length?`<div class="warnb" role="status"><b>${miss.length} place${miss.length>1?"s":""} without map coordinates:</b> ${miss.map(p=>esc(p.n)).join(", ")}. They show in lists but not on the map. Edit each one to add verified latitude and longitude.</div>`:"";
$("#tb").innerHTML=places.length?places.map(p=>`<tr><td>${p.img?`<img src="${esc(p.img)}" alt="">`:""}</td><td><b>${esc(p.n)}</b></td><td>${esc(p.c)}</td><td>${p.km} km</td><td>${noGeo(p)?'<span class="miss">Missing</span>':`${Number(p.lat).toFixed(5)}, ${Number(p.lng).toFixed(5)}<br>${p.geoVerified?'<span class="ok">Verified</span>':'<span class="miss">Unverified</span>'}`}</td><td>${esc(p.h)}</td><td><div class="a"><button class="sm" data-e="${esc(p.id)}">Edit</button><button class="sm d" data-d="${esc(p.id)}">Delete</button></div></td></tr>`).join(""):`<tr><td colspan="7">No places yet. Select “Add place” to create the first one.</td></tr>`;
$("#tb").onclick=e=>{const t=e.target.closest("button");if(!t)return;if(t.dataset.e)form(places.find(p=>p.id==t.dataset.e));if(t.dataset.d)del(places.find(p=>p.id==t.dataset.d))}}
async function del(p){if(!confirm(`Delete “${p.n}”? Visitors will no longer see it.`))return;try{await api("/places/"+encodeURIComponent(p.id),{method:"DELETE"});places=places.filter(x=>x.id!=p.id);list();toast("Place deleted")}catch(x){toast(x.message)}}
function form(p){const e=!!p;p=p||{};const d=$("#dlg"),o=(a,v)=>a.map(x=>`<option ${x==v?"selected":""}>${x}</option>`).join(""),f=(n,l,v,ex="",w="")=>`<label class="${w}">${l}<input class="in" name="${n}" value="${esc(v)}" ${ex}><small data-for="${n}"></small></label>`;
d.innerHTML=`<form novalidate id="pf"><h2>${e?"Edit place":"Add place"}</h2><div class="fg">${f("n","Name *",p.n,"","w")}
<label>Category *<select class="in" name="c">${o(CATS,p.c)}</select></label><label>Filter group *<select class="in" name="g">${o(GROUPS,p.g)}</select></label>
${f("km","Distance from centre (km) *",p.km,'type="number" step="0.1" min="0.1" max="25"')}${f("d","Time to allow (minutes)",p.d,'type="number" min="10" max="480"')}
${f("h","Opening hours",p.h)}${f("b","Best time to visit",p.b)}
<label class="w">Description *<textarea class="in" name="t" rows="3">${esc(p.t)}</textarea><small data-for="t"></small></label>${f("tr","Getting there",p.tr,"","w")}
${f("img","Image (file in images/ or https link, optional)",p.img||"","placeholder=\"images/place.jpg\"","w")}${f("lat","Latitude",p.lat??"",'type="number" step="any" min="5.5" max="10"')}${f("lng","Longitude",p.lng??"",'type="number" step="any" min="79" max="82.2"')}
<label class="w chk"><input type="checkbox" name="geoVerified" ${p.geoVerified?"checked":""}> I checked these coordinates against a reliable source</label>
<p class="note w" style="margin:0">Leave both empty if you do not know the position. Tip: right-click the exact spot on OpenStreetMap or Google Maps and copy its coordinates.</p></div>
<div class="ra"><button type="button" class="btn o" id="cx">Cancel</button><button class="btn s">${e?"Save changes":"Add place"}</button></div></form>`;d.showModal();$("#cx").onclick=()=>d.close();
$("#pf").onsubmit=async ev=>{ev.preventDefault();const v=Object.fromEntries(new FormData(ev.target)),er={},la=v.lat.trim()===""?null:Number(v.lat),ln=v.lng.trim()===""?null:Number(v.lng);
if(!v.n.trim())er.n="Enter a name.";if(!v.t.trim())er.t="Enter a description.";if(v.img.trim()&&!/^(images\/[\w.\-]+\.(jpe?g|png|webp|gif|svg)|https:\/\/[^\s"'<>]+)$/i.test(v.img.trim()))er.img="Use a file in the images folder (images/name.jpg) or an https link.";if(!(+v.km>0&&+v.km<=25))er.km="Enter a distance between 0.1 and 25 km.";
if((la==null)!=(ln==null)){er.lat="Enter both latitude and longitude, or leave both empty."}else if(la!=null){if(!(la>=5.5&&la<=10))er.lat="Latitude must be between 5.5 and 10 (Sri Lanka).";if(!(ln>=79&&ln<=82.2))er.lng="Longitude must be between 79 and 82.2 (Sri Lanka)."}
document.querySelectorAll("[data-for]").forEach(s=>s.textContent=er[s.dataset.for]||"");if(Object.keys(er).length)return;
const body={n:v.n.trim(),c:v.c,g:v.g,km:+v.km,h:v.h,b:v.b,t:v.t.trim(),tr:v.tr,img:v.img.trim(),lat:la,lng:ln,geoVerified:v.geoVerified==="on"&&la!=null};if(v.d!=="")body.d=+v.d;
try{const r=e?await api("/places/"+encodeURIComponent(p.id),{method:"PUT",body:JSON.stringify(body)}):await api("/places",{method:"POST",body:JSON.stringify(body)});
places=e?places.map(x=>x.id==p.id?r:x):[...places,r];places.sort((a,b)=>a.km-b.km);list();d.close();toast(e?"Place updated":"Place added")}catch(x){toast(x.message)}}}
(function(){const rm=matchMedia("(prefers-reduced-motion:reduce)").matches;if(rm||!matchMedia("(pointer:fine)").matches)return;let tk=0,x=0,y=0;
addEventListener("pointermove",e=>{x=e.clientX/innerWidth-.5;y=e.clientY/innerHeight-.5;if(!tk)tk=requestAnimationFrame(()=>{tk=0;const i=document.querySelector(".login .vis img");if(i)i.style.transform=`translate3d(${(x*-24).toFixed(1)}px,${(y*-18).toFixed(1)}px,0)`})},{passive:true})})();
token?dash():login();
