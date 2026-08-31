/* Authentication: the inventory app stays locked until a valid local account signs in. */
const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const authTitle = document.querySelector("#authTitle");
const authSubtitle = document.querySelector("#authSubtitle");
const authMessage = document.querySelector("#authMessage");
const showSignup = document.querySelector("#showSignup");
const showLogin = document.querySelector("#showLogin");

let users = JSON.parse(localStorage.getItem("inventoryUsers") || "[]");
let currentUser = JSON.parse(localStorage.getItem("inventoryCurrentUser") || "null");

function initials(name){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase() || "U";}
function setAuthMessage(message="",good=false){authMessage.textContent=message;authMessage.style.color=good?"#18a66a":"#d45252";}
function showLoginView(){loginForm.classList.remove("hidden");signupForm.classList.add("hidden");authTitle.textContent="Welcome back";authSubtitle.textContent="Sign in to access your inventory dashboard and management tools.";setAuthMessage("");}
function showSignupView(){signupForm.classList.remove("hidden");loginForm.classList.add("hidden");authTitle.textContent="Create your account";authSubtitle.textContent="Set up your secure account before entering the inventory workspace.";setAuthMessage("");}
function applyUser(){
  if(!currentUser)return;
  const initialsText=initials(currentUser.name);
  ["#topAvatar","#sidebarAvatar","#profileAvatar"].forEach(sel=>{const el=document.querySelector(sel);if(el)el.textContent=initialsText;});
  const top=document.querySelector("#topUserName"),side=document.querySelector("#sidebarUserName");
  if(top)top.textContent=currentUser.name;if(side)side.textContent=currentUser.name;
  const pn=document.querySelector("#profileName"),pe=document.querySelector("#profileEmail");
  if(pn)pn.value=currentUser.name;if(pe)pe.value=currentUser.email;
}
function unlockApp(){authScreen.style.display="none";appShell.style.display="flex";applyUser();}
function lockApp(){currentUser=null;localStorage.removeItem("inventoryCurrentUser");document.querySelector("#profileModal")?.classList.remove("show");authScreen.style.display="grid";appShell.style.display="none";loginForm.reset();showLoginView();}
showSignup.addEventListener("click",showSignupView);showLogin.addEventListener("click",showLoginView);
loginForm.addEventListener("submit",e=>{e.preventDefault();const email=document.querySelector("#loginEmail").value.trim().toLowerCase();const password=document.querySelector("#loginPassword").value;const user=users.find(u=>u.email===email&&u.password===password);if(!user){setAuthMessage("Incorrect email or password. Please try again or create an account.");return;}currentUser={name:user.name,email:user.email};localStorage.setItem("inventoryCurrentUser",JSON.stringify(currentUser));setAuthMessage("Login successful",true);setTimeout(unlockApp,250);});
signupForm.addEventListener("submit",e=>{e.preventDefault();const name=document.querySelector("#signupName").value.trim();const email=document.querySelector("#signupEmail").value.trim().toLowerCase();const password=document.querySelector("#signupPassword").value;const confirm=document.querySelector("#signupConfirm").value;if(password!==confirm){setAuthMessage("Passwords do not match.");return;}if(users.some(u=>u.email===email)){setAuthMessage("An account with this email already exists. Please sign in.");return;}users.push({name,email,password});localStorage.setItem("inventoryUsers",JSON.stringify(users));currentUser={name,email};localStorage.setItem("inventoryCurrentUser",JSON.stringify(currentUser));setAuthMessage("Account created successfully",true);setTimeout(unlockApp,250);});
if(currentUser){unlockApp();}else{appShell.style.display="none";authScreen.style.display="grid";}

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const defaultProducts = [
  {id:1,name:"Wireless Keyboard",sku:"KEY-204",category:"Electronics",stock:148,reorder:50,price:1299},
  {id:2,name:"USB-C Hub 7-in-1",sku:"HUB-118",category:"Accessories",stock:32,reorder:40,price:1899},
  {id:3,name:"Office Chair Pro",sku:"CHR-502",category:"Furniture",stock:18,reorder:10,price:8499},
  {id:4,name:"27-inch Monitor",sku:"MON-271",category:"Electronics",stock:9,reorder:15,price:16499},
  {id:5,name:"Mechanical Keyboard",sku:"KEY-310",category:"Electronics",stock:0,reorder:20,price:4599},
  {id:6,name:"Laptop Stand",sku:"STD-087",category:"Accessories",stock:61,reorder:20,price:2199},
  {id:7,name:"Desk Lamp",sku:"LMP-122",category:"Furniture",stock:24,reorder:12,price:1599},
  {id:8,name:"Wireless Mouse",sku:"MSE-415",category:"Accessories",stock:96,reorder:35,price:899}
];

let products = JSON.parse(localStorage.getItem("inventoryProducts") || "null") || defaultProducts;
let movements = JSON.parse(localStorage.getItem("inventoryMovements") || "null") || [
  {product:"Wireless Keyboard",type:"in",qty:40,note:"New shipment received",time:"Today, 10:32 AM"},
  {product:"27-inch Monitor",type:"out",qty:6,note:"Sales order #1048",time:"Today, 09:15 AM"},
  {product:"USB-C Hub 7-in-1",type:"in",qty:25,note:"Supplier delivery",time:"Yesterday, 04:42 PM"},
  {product:"Office Chair Pro",type:"out",qty:3,note:"Sales order #1043",time:"Yesterday, 01:08 PM"}
];
let editingId = null;

function save() {
  localStorage.setItem("inventoryProducts", JSON.stringify(products));
  localStorage.setItem("inventoryMovements", JSON.stringify(movements));
}
function money(n){return "₹" + Number(n).toLocaleString("en-IN");}
function statusOf(p){ if(p.stock===0)return "out"; if(p.stock<=p.reorder)return "low"; return "healthy"; }
function statusBadge(s){
  const map={healthy:["Healthy","healthy"],low:["Low Stock","warning"],out:["Out of Stock","danger"]};
  return `<span class="badge ${map[s][1]}">${map[s][0]}</span>`;
}
function productCell(p){return `<div class="product-cell"><div class="product-img">${p.name.charAt(0)}</div><div><div class="product-name">${p.name}</div><div class="product-sku">${p.sku}</div></div></div>`;}

function renderDashboard(){
  const totalStock=products.reduce((a,p)=>a+p.stock,0);
  const value=products.reduce((a,p)=>a+p.stock*p.price,0);
  const low=products.filter(p=>statusOf(p)==="low").length;
  const out=products.filter(p=>statusOf(p)==="out").length;
  const healthy=products.length-low-out;
  $("#totalProducts").textContent=products.length;
  $("#totalStock").textContent=totalStock.toLocaleString("en-IN");
  $("#inventoryValue").textContent=money(value);
  $("#lowStockCount").textContent=low;
  $("#healthyCount").textContent=healthy; $("#warningCount").textContent=low; $("#outCount").textContent=out;
  const hp=products.length ? Math.round(healthy/products.length*100):0;
  $("#healthyPercent").textContent=hp+"%";
  $(".donut").style.background=`conic-gradient(var(--primary) 0 ${hp}%, #f3ad4e ${hp}% ${hp+Math.round(low/products.length*100)}%, #eb6c6c ${hp+Math.round(low/products.length*100)}% 100%)`;
  $("#recentTable").innerHTML=products.slice(0,5).map(p=>`<tr><td>${productCell(p)}</td><td>${p.category}</td><td>${p.stock}</td><td>${money(p.price)}</td><td>${statusBadge(statusOf(p))}</td></tr>`).join("");
  renderActivity();
}
function renderActivity(){
  $("#activityList").innerHTML=movements.slice(0,5).map(m=>`<div class="activity"><div class="activity-icon">${m.type==="in"?"↑":"↓"}</div><div><strong>${m.type==="in"?"Stock received":"Stock issued"} · ${m.product}</strong><span>${m.note || "Inventory movement"} · ${m.time}</span></div></div>`).join("") || `<div class="empty">No activity yet.</div>`;
}
function categories(){
  return [...new Set(products.map(p=>p.category))].sort();
}
function renderFilters(){
  const current=$("#categoryFilter").value;
  $("#categoryFilter").innerHTML=`<option value="all">All categories</option>`+categories().map(c=>`<option value="${c}">${c}</option>`).join("");
  if(categories().includes(current))$("#categoryFilter").value=current;
}
function renderInventory(){
  renderFilters();
  const q=$("#searchInput").value.toLowerCase().trim(), cat=$("#categoryFilter").value, st=$("#statusFilter").value;
  const filtered=products.filter(p=>(!q || [p.name,p.sku,p.category].join(" ").toLowerCase().includes(q)) && (cat==="all"||p.category===cat) && (st==="all"||statusOf(p)===st));
  $("#inventorySummary").textContent=`Showing ${filtered.length} of ${products.length} products`;
  $("#inventoryTable").innerHTML=filtered.length ? filtered.map(p=>`<tr>
    <td>${productCell(p)}</td><td>${p.sku}</td><td>${p.category}</td><td><strong>${p.stock}</strong></td><td>${p.reorder}</td><td>${money(p.price)}</td><td>${statusBadge(statusOf(p))}</td>
    <td><button class="action-btn" onclick="editProduct(${p.id})" title="Edit">✎</button> <button class="action-btn" onclick="deleteProduct(${p.id})" title="Delete">×</button></td>
  </tr>`).join(""):`<tr><td colspan="8" class="no-results">No products match your search.</td></tr>`;
}
function renderStock(){
  $("#stockProduct").innerHTML=products.map(p=>`<option value="${p.id}">${p.name} — ${p.stock} units</option>`).join("");
  $("#movementHistory").innerHTML=movements.map(m=>`<div class="movement"><div class="movement-main"><div class="movement-sign ${m.type}">${m.type==="in"?"↑":"↓"}</div><div><strong>${m.product}</strong><span>${m.note||"Stock movement"} · ${m.time}</span></div></div><div class="movement-qty ${m.type}">${m.type==="in"?"+":"−"}${m.qty}</div></div>`).join("") || `<div class="empty">No stock movements yet.</div>`;
}
function renderReports(){
  const low=products.filter(p=>statusOf(p)==="low").length, totalStock=products.reduce((a,p)=>a+p.stock,0);
  $("#avgStock").textContent=products.length?Math.round(totalStock/products.length):0;
  $("#lowRate").textContent=products.length?Math.round(low/products.length*100)+"%":"0%";
  const byCat={}; products.forEach(p=>byCat[p.category]=(byCat[p.category]||0)+p.stock*p.price);
  const sorted=Object.entries(byCat).sort((a,b)=>b[1]-a[1]); const max=sorted[0]?.[1]||1;
  $("#topCategory").textContent=sorted[0]?.[0]||"—";
  const reorder=products.filter(p=>p.stock<=p.reorder).reduce((a,p)=>a+Math.max(p.reorder-p.stock,0)*p.price,0);
  $("#reorderValue").textContent=money(reorder);
  $("#categoryReport").innerHTML=sorted.map(([cat,val])=>`<div class="bar-row"><strong>${cat}</strong><div class="bar-bg"><div class="bar-fill" style="width:${Math.max(5,val/max*100)}%"></div></div><span class="bar-value">${money(val)}</span></div>`).join("");
}
function renderAll(){renderDashboard();renderInventory();renderStock();renderReports();save();}

function showSection(id){
  $$(".section").forEach(s=>s.classList.remove("active-section"));
  const target=$("#"+id); if(!target)return;
  target.classList.add("active-section");
  $$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.section===id));
  $("#pageTitle").textContent=id.charAt(0).toUpperCase()+id.slice(1);
  if($("#sidebar").classList.contains("open"))$("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".nav-item").forEach(btn=>btn.addEventListener("click",()=>showSection(btn.dataset.section)));
$$("[data-go='inventory']").forEach(btn=>btn.addEventListener("click",()=>showSection("inventory")));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));

function openModal(product=null){
  editingId=product?.id||null;
  $("#modalTitle").textContent=product?"Edit Product":"Add New Product";
  $("#productName").value=product?.name||"";
  $("#productSku").value=product?.sku||"";
  $("#productCategory").value=product?.category||"";
  $("#productPrice").value=product?.price||"";
  $("#productStock").value=product?.stock??"";
  $("#productReorder").value=product?.reorder??"";
  $("#productModal").classList.add("show");
  setTimeout(()=>$("#productName").focus(),100);
}
function closeModal(){$("#productModal").classList.remove("show");editingId=null}
$("#addProductBtn").onclick=()=>openModal();
$("#addProductBtn2").onclick=()=>openModal();
$("#modalClose").onclick=closeModal;
$("#productModal").addEventListener("click",e=>{if(e.target.id==="productModal")closeModal()});
$("#productForm").addEventListener("submit",e=>{
  e.preventDefault();
  const data={name:$("#productName").value.trim(),sku:$("#productSku").value.trim().toUpperCase(),category:$("#productCategory").value.trim(),price:Number($("#productPrice").value),stock:Number($("#productStock").value),reorder:Number($("#productReorder").value)};
  if(editingId){Object.assign(products.find(p=>p.id===editingId),data);toast("Product updated successfully");}
  else{data.id=Date.now();products.unshift(data);toast("Product added successfully");}
  closeModal();renderAll();
});
window.editProduct=id=>openModal(products.find(p=>p.id===id));
window.deleteProduct=id=>{
  const p=products.find(x=>x.id===id);
  if(confirm(`Delete "${p.name}" from inventory?`)){products=products.filter(x=>x.id!==id);toast("Product deleted");renderAll();}
};

$("#stockForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=Number($("#stockProduct").value), p=products.find(x=>x.id===id), qty=Number($("#movementQty").value), type=$("#movementType").value;
  if(type==="out" && qty>p.stock){toast("Stock out quantity exceeds available stock");return;}
  p.stock += type==="in"?qty:-qty;
  movements.unshift({product:p.name,type,qty,note:$("#movementNote").value.trim()|| (type==="in"?"Stock received":"Stock issued"),time:new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})});
  movements=movements.slice(0,15);
  $("#movementQty").value=1;$("#movementNote").value="";
  toast("Stock updated successfully");renderAll();
});
["searchInput","categoryFilter","statusFilter"].forEach(id=>$("#"+id).addEventListener("input",renderInventory));
$("#exportBtn").addEventListener("click",()=>{
  const rows=[["Product","SKU","Category","Stock","Reorder Level","Price","Status"],...products.map(p=>[p.name,p.sku,p.category,p.stock,p.reorder,p.price,statusOf(p)])];
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="inventory-report.csv";a.click();URL.revokeObjectURL(a.href);toast("CSV report exported");
});
$("#printReport").onclick=()=>window.print();
$("#themeToggle").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("inventoryTheme",document.body.classList.contains("dark")?"dark":"light");};
if(localStorage.getItem("inventoryTheme")==="dark")document.body.classList.add("dark");

function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2400)}

/* Profile & logout controls */
const profileModal=document.querySelector("#profileModal");
document.querySelector("#profileBtn").addEventListener("click",()=>{applyUser();profileModal.classList.add("show");});
document.querySelector("#profileClose").addEventListener("click",()=>profileModal.classList.remove("show"));
profileModal.addEventListener("click",e=>{if(e.target===profileModal)profileModal.classList.remove("show")});
document.querySelector("#logoutBtn").addEventListener("click",()=>{if(confirm("Are you sure you want to logout?"))lockApp();});
document.querySelector("#profileLogout").addEventListener("click",()=>{if(confirm("Are you sure you want to logout?"))lockApp();});
document.querySelector("#profileForm").addEventListener("submit",e=>{e.preventDefault();const name=document.querySelector("#profileName").value.trim();const email=document.querySelector("#profileEmail").value.trim().toLowerCase();if(!name||!email)return;const duplicate=users.find(u=>u.email===email&&u.email!==currentUser.email);if(duplicate){toast("That email is already in use");return;}const oldUser=users.find(u=>u.email===currentUser.email);if(oldUser){oldUser.name=name;oldUser.email=email;}currentUser={name,email};localStorage.setItem("inventoryUsers",JSON.stringify(users));localStorage.setItem("inventoryCurrentUser",JSON.stringify(currentUser));applyUser();profileModal.classList.remove("show");toast("Profile updated successfully");});

renderAll();