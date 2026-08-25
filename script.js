/* StockFlow Inventory Management System
   Frontend-only version using LocalStorage.
   No backend is required to run this project.
*/
const KEYS = {
  users: "sf_users",
  session: "sf_session",
  products: "sf_products",
  categories: "sf_categories",
  history: "sf_history",
  notifications: "sf_notifications",
  settings: "sf_settings"
};

const $ = (id) => document.getElementById(id);
const uid = (prefix="ID") => prefix + "-" + Math.random().toString(36).slice(2,8).toUpperCase();
const nowISO = () => new Date().toISOString();
const fmtDate = (v) => new Date(v).toLocaleString([], {dateStyle:"medium", timeStyle:"short"});
const escapeHTML = (s="") => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const get = (key, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
  catch { return fallback; }
};
const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const money = (n) => `${getSettings().currency}${Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

function getSettings(){ return {...{currency:"₹",threshold:10}, ...get(KEYS.settings,{})}; }
function currentUser(){
  const email = localStorage.getItem(KEYS.session);
  return get(KEYS.users, []).find(u => u.email === email) || null;
}
function products(){ return get(KEYS.products, []); }
function categories(){ return get(KEYS.categories, []); }
function history(){ return get(KEYS.history, []); }
function users(){ return get(KEYS.users, []); }
function setProducts(v){set(KEYS.products,v)}
function setCategories(v){set(KEYS.categories,v)}
function setHistory(v){set(KEYS.history,v)}
function addHistory(item){ const h=history(); h.unshift(item); setHistory(h.slice(0,500)); }
function notifications(){ return get(KEYS.notifications, []); }
function addNotification(message, type="info"){
  const n=notifications(); n.unshift({id:uid("NT"),message,type,date:nowISO()}); set(KEYS.notifications,n.slice(0,30));
  renderNotifications();
}

function seedData(){
  if(!localStorage.getItem(KEYS.users)){
    set(KEYS.users,[{id:uid("USR"),name:"Admin User",email:"admin@stockflow.com",password:"admin123",createdAt:nowISO()}]);
  }
  if(!localStorage.getItem(KEYS.categories)){
    set(KEYS.categories,["Electronics","Furniture","Stationery","Accessories","Office Supplies"]);
  }
  if(!localStorage.getItem(KEYS.products)){
    const sample = [
      ["Dell Inspiron 15","ELEC-001","Electronics",64999,18,5,"TechWorld"],
      ["Samsung 24-inch Monitor","ELEC-002","Electronics",13999,7,8,"Samsung Distributor"],
      ["Logitech MX Mouse","ACC-001","Accessories",7499,32,10,"Logitech India"],
      ["Mechanical Keyboard","ACC-002","Accessories",4999,0,5,"KeyPro Supplies"],
      ["Office Chair","FURN-001","Furniture",8999,12,4,"Comfort Office"],
      ["A4 Notebook","STAT-001","Stationery",120,76,20,"Paper House"],
      ["USB-C Cable","ACC-003","Accessories",799,9,10,"CableHub"],
      ["Laser Printer","OFF-001","Office Supplies",18499,4,5,"PrintTech"],
      ["Desk Lamp","FURN-002","Furniture",1599,25,5,"BrightDesk"],
      ["Wireless Headphones","ELEC-003","Electronics",3999,21,6,"AudioMart"]
    ];
    set(KEYS.products,sample.map(([name,sku,category,price,quantity,minStock,supplier],i)=>({
      id:uid("PRD"),name,sku,category,description:`Professional ${name} for business and office use.`,
      supplier,price,quantity,minStock,createdAt:nowISO(),updatedAt:nowISO(),createdBy:"Admin User"
    })));
  }
  if(!localStorage.getItem(KEYS.history)) set(KEYS.history,[]);
  if(!localStorage.getItem(KEYS.notifications)) set(KEYS.notifications,[]);
  if(!localStorage.getItem(KEYS.settings)) set(KEYS.settings,{currency:"₹",threshold:10});
}
seedData();

function statusOf(p){
  if(Number(p.quantity)===0) return "Out of Stock";
  if(Number(p.quantity)<=Number(p.minStock)) return "Low Stock";
  return "In Stock";
}
function statusBadge(status){
  const cls=status==="In Stock"?"status-in":status==="Low Stock"?"status-low":"status-out";
  return `<span class="status-badge ${cls}">${escapeHTML(status)}</span>`;
}
function avatarLetters(name="User"){
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase() || "U";
}
function showToast(message,type="success"){
  const el=document.createElement("div"); el.className=`toast ${type}`; el.textContent=message;
  $("toastContainer").appendChild(el); setTimeout(()=>el.remove(),3200);
}
function openModal(html){ $("modalContent").innerHTML=html; $("modalOverlay").classList.remove("hidden"); }
function closeModal(){ $("modalOverlay").classList.add("hidden"); $("modalContent").innerHTML=""; }

function showAuth(mode="login"){
  $("authScreen").classList.remove("hidden"); $("appScreen").classList.add("hidden");
  $("loginPanel").classList.toggle("hidden",mode!=="login"); $("signupPanel").classList.toggle("hidden",mode!=="signup");
}
function showApp(){
  const user=currentUser();
  if(!user){showAuth();return}
  $("authScreen").classList.add("hidden");$("appScreen").classList.remove("hidden");
  $("sidebarUserName").textContent=user.name;$("sidebarUserEmail").textContent=user.email;
  $("topUserName").textContent=user.name.split(" ")[0];
  $("welcomeName").textContent=user.name.split(" ")[0];
  $("sidebarAvatar").textContent=avatarLetters(user.name);$("topAvatar").textContent=avatarLetters(user.name);
  loadSettingsForms(); renderAll();
}

function navigate(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  $(`page-${page}`).classList.add("active-page");
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const titles={dashboard:"Dashboard",inventory:"Inventory",stock:"Stock Management",categories:"Categories",reports:"Reports",settings:"Settings"};
  $("pageTitle").textContent=titles[page]||"Dashboard";
  if(window.innerWidth<=800) $("sidebar").classList.remove("open");
  renderAll();
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
document.querySelectorAll("[data-page-jump]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.pageJump)));

function stats(){
  const ps=products(), totalQty=ps.reduce((a,p)=>a+Number(p.quantity),0);
  return {
    totalProducts:ps.length,totalCategories:categories().length,totalStock:totalQty,
    low:ps.filter(p=>statusOf(p)==="Low Stock").length,
    out:ps.filter(p=>statusOf(p)==="Out of Stock").length,
    value:ps.reduce((a,p)=>a+Number(p.price)*Number(p.quantity),0)
  };
}
function statCard(icon,label,value,extra=""){
  return `<div class="stat-card"><div class="stat-top"><span class="stat-icon">${icon}</span>${extra?`<span class="stat-trend">${extra}</span>`:""}</div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;
}
function renderStats(target="statsGrid"){
  const s=stats();
  $(target).innerHTML=[
    statCard("▣","Total Products",s.totalProducts),
    statCard("◈","Categories",s.totalCategories),
    statCard("↕","Total Stock",s.totalStock.toLocaleString("en-IN")),
    statCard("₹","Inventory Value",money(s.value))
  ].join("");
}
function renderDashboard(){
  renderStats();
  const ps=products(), cats=categories();
  const total=ps.reduce((a,p)=>a+p.quantity,0)||1;
  $("categoryOverview").innerHTML=cats.length?cats.map(c=>{
    const q=ps.filter(p=>p.category===c).reduce((a,p)=>a+Number(p.quantity),0);
    return `<div><div class="category-line-head"><span>${escapeHTML(c)}</span><strong>${q.toLocaleString("en-IN")} units</strong></div><div class="progress"><i style="width:${Math.min(100,q/total*100)}%"></i></div></div>`
  }).join(""):`<p class="muted">No categories available.</p>`;
  const alerts=ps.filter(p=>statusOf(p)!=="In Stock").sort((a,b)=>a.quantity-b.quantity).slice(0,5);
  $("dashboardAlerts").innerHTML=alerts.length?alerts.map(p=>`<div class="alert-item"><div class="alert-product"><strong>${escapeHTML(p.name)}</strong><small>${p.quantity} units remaining</small></div>${statusBadge(statusOf(p))}</div>`).join(""):`<div class="empty-state muted">✓ All products have healthy stock levels.</div>`;
  const h=history().slice(0,7);
  $("recentActivity").innerHTML=h.length?h.map(x=>`<tr><td><strong>${escapeHTML(x.productName||"—")}</strong></td><td>${escapeHTML(x.type)}</td><td>${x.quantity??"—"}</td><td>${fmtDate(x.date)}</td><td>${escapeHTML(x.userName||"System")}</td></tr>`).join(""):`<tr><td colspan="5" class="muted">No activity yet.</td></tr>`;
}
function fillCategoryFilters(){
  const current=$("categoryFilter").value;
  $("categoryFilter").innerHTML=`<option value="">All Categories</option>`+categories().map(c=>`<option ${c===current?"selected":""}>${escapeHTML(c)}</option>`).join("");
}
function renderInventory(){
  fillCategoryFilters();
  let ps=[...products()];
  const q=($("inventorySearch").value||"").toLowerCase();
  const cat=$("categoryFilter").value,status=$("statusFilter").value,sort=$("sortFilter").value;
  ps=ps.filter(p=>!q||[p.name,p.id,p.sku,p.category,p.supplier].some(v=>String(v).toLowerCase().includes(q)));
  ps=ps.filter(p=>!cat||p.category===cat).filter(p=>!status||statusOf(p)===status);
  const [field,dir]=sort.split("-");
  ps.sort((a,b)=>{
    let av,bv;
    if(field==="updated"){av=new Date(a.updatedAt);bv=new Date(b.updatedAt)}
    else if(field==="price"){av=a.price;bv=b.price}
    else if(field==="qty"){av=a.quantity;bv=b.quantity}
    else {av=a.name.toLowerCase();bv=b.name.toLowerCase()}
    if(av<bv)return dir==="asc"?-1:1;if(av>bv)return dir==="asc"?1:-1;return 0;
  });
  $("inventoryTable").innerHTML=ps.length?ps.map(p=>`<tr>
    <td><div class="product-cell"><div class="product-icon">${escapeHTML(p.name[0]||"P")}</div><div><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.supplier)}</small></div></div></td>
    <td>${escapeHTML(p.sku)}</td><td>${escapeHTML(p.category)}</td><td>${money(p.price)}</td><td><strong>${p.quantity}</strong></td>
    <td>${statusBadge(statusOf(p))}</td><td>${fmtDate(p.updatedAt)}</td>
    <td><div class="action-group"><button class="table-action" data-action="view" data-id="${p.id}">View</button><button class="table-action" data-action="edit" data-id="${p.id}">Edit</button><button class="table-action delete" data-action="delete" data-id="${p.id}">Delete</button></div></td>
  </tr>`).join(""):`<tr><td colspan="8" class="muted">No products found.</td></tr>`;
}
function renderStock(){
  const current=$("stockProduct").value;
  $("stockProduct").innerHTML=products().map(p=>`<option value="${p.id}" ${p.id===current?"selected":""}>${escapeHTML(p.name)} — ${p.quantity} units</option>`).join("");
  updateStockPreview();
  const s=stats();
  $("stockSummary").innerHTML=[
    ["Total Units",s.totalStock.toLocaleString("en-IN")],
    ["Healthy Stock",products().filter(p=>statusOf(p)==="In Stock").length],
    ["Low Stock",s.low],["Out of Stock",s.out]
  ].map(x=>`<div class="summary-row"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("");
  $("historyTable").innerHTML=history().length?history().map(x=>`<tr><td>${fmtDate(x.date)}</td><td>${escapeHTML(x.productName)}</td><td>${escapeHTML(x.type)}</td><td>${x.quantity}</td><td>${x.previous}</td><td>${x.newStock}</td><td>${escapeHTML(x.userName)}</td><td>${escapeHTML(x.note||"—")}</td></tr>`).join(""):`<tr><td colspan="8" class="muted">No stock movements recorded.</td></tr>`;
}
function updateStockPreview(){
  const p=products().find(x=>x.id===$("stockProduct").value), qty=Number($("stockQuantity").value||0), type=$("stockType").value;
  if(!p){$("stockPreview").innerHTML="Select a product.";return}
  const next=type==="add"?p.quantity+qty:p.quantity-qty;
  $("stockPreview").innerHTML=`<strong>${escapeHTML(p.name)}</strong> · Current: <strong>${p.quantity}</strong> → New: <strong>${next}</strong> · Status: ${statusBadge(next===0?"Out of Stock":next<=p.minStock?"Low Stock":"In Stock")}`;
}
function renderCategories(){
  const ps=products();
  $("categoriesTable").innerHTML=categories().map(c=>{
    const list=ps.filter(p=>p.category===c),q=list.reduce((a,p)=>a+p.quantity,0),v=list.reduce((a,p)=>a+p.quantity*p.price,0);
    return `<tr><td><strong>${escapeHTML(c)}</strong></td><td>${list.length}</td><td>${q}</td><td>${money(v)}</td><td><div class="action-group"><button class="table-action" data-cat-action="edit" data-cat="${escapeHTML(c)}">Edit</button><button class="table-action delete" data-cat-action="delete" data-cat="${escapeHTML(c)}">Delete</button></div></td></tr>`
  }).join("");
}
function renderReports(){
  const s=stats(); renderStats("reportStats");
  const ps=products(), cats=categories();
  const catData=cats.map(c=>({name:c,value:ps.filter(p=>p.category===c).reduce((a,p)=>a+p.quantity,0)})).sort((a,b)=>b.value-a.value);
  const max=Math.max(...catData.map(x=>x.value),1);
  $("barChart").innerHTML=catData.length?catData.map(x=>`<div class="bar-row"><span>${escapeHTML(x.name)}</span><div class="bar-track"><i style="width:${x.value/max*100}%"></i></div><strong>${x.value}</strong></div>`).join(""):`<p class="muted">No data available.</p>`;
  const valData=cats.map(c=>({name:c,value:ps.filter(p=>p.category===c).reduce((a,p)=>a+p.quantity*p.price,0)})).filter(x=>x.value>0);
  const totalVal=valData.reduce((a,x)=>a+x.value,0)||1;
  const palette=["#4f46e5","#22c55e","#f59e0b","#ef4444","#06b6d4","#8b5cf6"];
  let cursor=0,segments=[];
  valData.forEach((x,i)=>{const end=cursor+x.value/totalVal*100;segments.push(`${palette[i%palette.length]} ${cursor}% ${end}%`);cursor=end});
  $("donutChart").style.background=`conic-gradient(${segments.join(",")||"#e5e7eb 0 100%"})`;
  $("donutLegend").innerHTML=valData.map((x,i)=>`<div class="legend-item"><i class="legend-dot" style="background:${palette[i%palette.length]}"></i><span>${escapeHTML(x.name)}</span><strong>${Math.round(x.value/totalVal*100)}%</strong></div>`).join("")||`<span class="muted">No inventory value data.</span>`;
  const productsValue=ps.map(p=>({name:p.name,value:p.quantity*p.price})).sort((a,b)=>b.value-a.value).slice(0,8), maxV=Math.max(...productsValue.map(x=>x.value),1);
  $("valueChart").innerHTML=productsValue.map(x=>`<div class="h-row"><span title="${escapeHTML(x.name)}">${escapeHTML(x.name.slice(0,22))}</span><div class="h-track"><i style="width:${x.value/maxV*100}%"></i></div><strong>${money(x.value)}</strong></div>`).join("")||`<p class="muted">No data available.</p>`;
}
function loadSettingsForms(){
  const u=currentUser(),s=getSettings();
  $("profileName").value=u?.name||"";$("profileEmail").value=u?.email||"";
  $("currencySetting").value=s.currency;$("thresholdSetting").value=s.threshold;
}
function renderNotifications(){
  const n=notifications();
  $("notificationList").innerHTML=n.length?n.slice(0,10).map(x=>`<div class="notification-item"><strong>${escapeHTML(x.message)}</strong><small>${fmtDate(x.date)}</small></div>`).join(""):`<p class="muted">No notifications.</p>`;
  $("notificationDot").classList.toggle("hidden",n.length===0);
}
function renderAll(){
  renderDashboard();renderInventory();renderStock();renderCategories();renderReports();renderNotifications();
}

function productForm(product=null){
  const isEdit=!!product;
  const cats=categories();
  openModal(`<div class="modal-header"><div><p class="eyebrow">${isEdit?"EDIT PRODUCT":"NEW PRODUCT"}</p><h2>${isEdit?"Edit Product":"Add Product"}</h2><p class="muted">${isEdit?"Update product information.":"Add a new item to your inventory."}</p></div><button class="close-btn" id="closeModal">×</button></div>
  <form id="productForm">
    <div class="form-grid">
      <label>Product Name<input id="pName" value="${escapeHTML(product?.name||"")}" required></label>
      <label>SKU<input id="pSku" value="${escapeHTML(product?.sku||"")}" required></label>
      <label>Category<select id="pCategory" required>${cats.map(c=>`<option ${c===product?.category?"selected":""}>${escapeHTML(c)}</option>`).join("")}</select></label>
      <label>Supplier<input id="pSupplier" value="${escapeHTML(product?.supplier||"")}" required></label>
      <label>Price<input id="pPrice" type="number" min="0.01" step="0.01" value="${product?.price??""}" required></label>
      <label>Quantity<input id="pQuantity" type="number" min="0" value="${product?.quantity??0}" required></label>
      <label>Minimum Stock Level<input id="pMinStock" type="number" min="0" value="${product?.minStock??getSettings().threshold}" required></label>
    </div>
    <label>Description<textarea id="pDescription" rows="3" placeholder="Product description...">${escapeHTML(product?.description||"")}</textarea></label>
    <div class="modal-actions"><button type="button" class="secondary-btn" id="cancelModal">Cancel</button><button class="primary-btn" type="submit">${isEdit?"Save Changes":"Add Product"}</button></div>
  </form>`);
  $("closeModal").onclick=closeModal;$("cancelModal").onclick=closeModal;
  $("productForm").onsubmit=e=>{
    e.preventDefault();
    const ps=products(), name=$("pName").value.trim(),sku=$("pSku").value.trim(),old=product;
    if(ps.some(p=>p.sku.toLowerCase()===sku.toLowerCase()&&p.id!==old?.id)){showToast("This SKU already exists.","error");return}
    const user=currentUser(),data={name,sku,category:$("pCategory").value,supplier:$("pSupplier").value.trim(),price:Number($("pPrice").value),quantity:Number($("pQuantity").value),minStock:Number($("pMinStock").value),description:$("pDescription").value.trim(),updatedAt:nowISO()};
    if(old){
      const i=ps.findIndex(p=>p.id===old.id);ps[i]={...old,...data};setProducts(ps);
      addHistory({id:uid("H"),date:nowISO(),productName:name,type:"Product Updated",quantity:data.quantity,previous:old.quantity,newStock:data.quantity,userName:user.name,note:"Product details updated"});
      addNotification(`${name} was updated.`);showToast("Product updated successfully.");
    }else{
      const p={...data,id:uid("PRD"),createdAt:nowISO(),createdBy:user.name};ps.unshift(p);setProducts(ps);
      addHistory({id:uid("H"),date:nowISO(),productName:name,type:"Product Created",quantity:data.quantity,previous:0,newStock:data.quantity,userName:user.name,note:"New product added"});
      addNotification(`${name} was added to inventory.`);showToast("Product added successfully.");
    }
    closeModal();renderAll();
  };
}
function viewProduct(id){
  const p=products().find(x=>x.id===id);if(!p)return;
  const h=history().filter(x=>x.productName===p.name).slice(0,8);
  openModal(`<div class="modal-header"><div><p class="eyebrow">PRODUCT DETAILS</p><h2>${escapeHTML(p.name)}</h2><p class="muted">${escapeHTML(p.sku)}</p></div><button class="close-btn" id="closeModal">×</button></div>
  <div class="detail-grid">
    <div class="detail-box"><small>Category</small><strong>${escapeHTML(p.category)}</strong></div><div class="detail-box"><small>Supplier</small><strong>${escapeHTML(p.supplier)}</strong></div>
    <div class="detail-box"><small>Price</small><strong>${money(p.price)}</strong></div><div class="detail-box"><small>Current Stock</small><strong>${p.quantity}</strong></div>
    <div class="detail-box"><small>Minimum Stock</small><strong>${p.minStock}</strong></div><div class="detail-box"><small>Status</small>${statusBadge(statusOf(p))}</div>
    <div class="detail-box"><small>Created</small><strong>${fmtDate(p.createdAt)}</strong></div><div class="detail-box"><small>Last Updated</small><strong>${fmtDate(p.updatedAt)}</strong></div>
  </div>
  <div class="card" style="margin-top:18px;margin-bottom:0;padding:14px"><h3>Description</h3><p class="muted">${escapeHTML(p.description||"No description provided.")}</p></div>
  <div style="margin-top:18px"><h3>Recent Stock History</h3>${h.length?h.map(x=>`<div class="alert-item"><div><strong>${escapeHTML(x.type)}</strong><small>${fmtDate(x.date)}</small></div><strong>${x.newStock} units</strong></div>`).join(""):`<p class="muted">No history for this product.</p>`}</div>`);
  $("closeModal").onclick=closeModal;
}
function confirmDeleteProduct(id){
  const p=products().find(x=>x.id===id);if(!p)return;
  openModal(`<div class="modal-header"><div><p class="eyebrow">CONFIRM ACTION</p><h2>Delete product?</h2><p class="muted">This will permanently remove <strong>${escapeHTML(p.name)}</strong> from the inventory.</p></div><button class="close-btn" id="closeModal">×</button></div><div class="modal-actions"><button class="secondary-btn" id="cancelModal">Cancel</button><button class="danger-btn" id="confirmDelete">Delete Product</button></div>`);
  $("closeModal").onclick=closeModal;$("cancelModal").onclick=closeModal;
  $("confirmDelete").onclick=()=>{
    const ps=products().filter(x=>x.id!==id);setProducts(ps);
    const user=currentUser();addHistory({id:uid("H"),date:nowISO(),productName:p.name,type:"Product Deleted",quantity:p.quantity,previous:p.quantity,newStock:0,userName:user.name,note:"Product deleted"});
    addNotification(`${p.name} was deleted.`,"warning");showToast("Product deleted.");closeModal();renderAll();
  };
}
function categoryModal(oldName=null){
  const editing=oldName!==null;
  openModal(`<div class="modal-header"><div><p class="eyebrow">CATEGORY</p><h2>${editing?"Edit Category":"Add Category"}</h2></div><button class="close-btn" id="closeModal">×</button></div>
  <form id="categoryForm"><label>Category Name<input id="catName" value="${escapeHTML(oldName||"")}" required></label><div class="modal-actions"><button type="button" class="secondary-btn" id="cancelModal">Cancel</button><button class="primary-btn">${editing?"Save Changes":"Add Category"}</button></div></form>`);
  $("closeModal").onclick=closeModal;$("cancelModal").onclick=closeModal;
  $("categoryForm").onsubmit=e=>{
    e.preventDefault();const name=$("catName").value.trim(),cs=categories();
    if(!name){return}if(cs.some(c=>c.toLowerCase()===name.toLowerCase()&&c!==oldName)){showToast("Category already exists.","error");return}
    if(editing){const i=cs.indexOf(oldName);cs[i]=name;setCategories(cs);setProducts(products().map(p=>p.category===oldName?{...p,category:name,updatedAt:nowISO()}:p));showToast("Category updated.");}
    else{cs.push(name);setCategories(cs);showToast("Category added.");addNotification(`Category ${name} was created.`)}
    closeModal();renderAll();
  };
}
function deleteCategory(name){
  const used=products().some(p=>p.category===name);
  if(used){showToast("Cannot delete a category with assigned products.","error");return}
  const cs=categories().filter(c=>c!==name);setCategories(cs);showToast("Category deleted.");renderAll();
}

$("loginForm").onsubmit=e=>{
  e.preventDefault();const email=$("loginEmail").value.trim().toLowerCase(),password=$("loginPassword").value;
  const u=users().find(x=>x.email===email&&x.password===password);
  if(!u){showToast("Invalid email or password.","error");return}
  localStorage.setItem(KEYS.session,u.email);showApp();showToast("Welcome back, "+u.name.split(" ")[0]+"!");
};
$("signupForm").onsubmit=e=>{
  e.preventDefault();const name=$("signupName").value.trim(),email=$("signupEmail").value.trim().toLowerCase(),pass=$("signupPassword").value,confirm=$("signupConfirm").value;
  if(pass.length<6){showToast("Password must be at least 6 characters.","error");return}
  if(pass!==confirm){showToast("Passwords do not match.","error");return}
  if(users().some(u=>u.email===email)){showToast("An account with this email already exists.","error");return}
  const us=users();us.push({id:uid("USR"),name,email,password:pass,createdAt:nowISO()});set(KEYS.users,us);
  $("signupForm").reset();showAuth("login");$("loginEmail").value=email;showToast("Account created. Please sign in.");
};
$("showSignupFromLogin").onclick=()=>showAuth("signup");$("showLoginFromSignup").onclick=()=>showAuth("login");
document.querySelectorAll(".password-toggle").forEach(b=>b.onclick=()=>{const i=$(b.dataset.target);i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"Show":"Hide"});

function logout(){
  localStorage.removeItem(KEYS.session);showAuth("login");showToast("You have been logged out.");navigate("dashboard");
}
$("logoutBtn").onclick=logout;$("settingsLogoutBtn").onclick=logout;
$("dashboardAddBtn").onclick=()=>productForm();$("addProductBtn").onclick=()=>productForm();$("addCategoryBtn").onclick=()=>categoryModal();
$("modalOverlay").addEventListener("click",e=>{if(e.target===$("modalOverlay"))closeModal()});
["inventorySearch","categoryFilter","statusFilter","sortFilter"].forEach(id=>$(id).addEventListener("input",renderInventory));
$("globalSearch").addEventListener("input",()=>{if($("globalSearch").value.trim()){navigate("inventory");$("inventorySearch").value=$("globalSearch").value;renderInventory()}});
$("inventoryTable").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;const id=b.dataset.id;
  if(b.dataset.action==="view")viewProduct(id);if(b.dataset.action==="edit")productForm(products().find(p=>p.id===id));if(b.dataset.action==="delete")confirmDeleteProduct(id);
});
$("categoriesTable").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;const n=b.dataset.cat;
  if(b.dataset.catAction==="edit")categoryModal(n);if(b.dataset.catAction==="delete")deleteCategory(n);
});
$("stockProduct").addEventListener("change",updateStockPreview);$("stockType").addEventListener("change",updateStockPreview);$("stockQuantity").addEventListener("input",updateStockPreview);
$("stockForm").onsubmit=e=>{
  e.preventDefault();const ps=products(),p=ps.find(x=>x.id===$("stockProduct").value),qty=Number($("stockQuantity").value),type=$("stockType").value,user=currentUser();
  if(!p||qty<1){showToast("Enter a valid stock quantity.","error");return}
  if(type==="remove"&&qty>p.quantity){showToast("Insufficient stock available.","error");return}
  const previous=p.quantity;p.quantity=type==="add"?p.quantity+qty:p.quantity-qty;p.updatedAt=nowISO();setProducts(ps);
  addHistory({id:uid("H"),date:nowISO(),productName:p.name,type:type==="add"?"Stock Added":"Stock Removed",quantity:qty,previous,newStock:p.quantity,userName:user.name,note:$("stockNote").value.trim()});
  addNotification(`${type==="add"?"Added":"Removed"} ${qty} units ${type==="add"?"to":"from"} ${p.name}.`,type==="add"?"info":"warning");
  showToast(`Stock ${type==="add"?"added":"removed"} successfully.`);$("stockForm").reset();renderAll();
};
$("exportCsvBtn").onclick=()=>exportCSV(products(),"inventory-report.csv");
$("exportHistoryBtn").onclick=()=>exportCSV(history(),"stock-history.csv");
function exportCSV(data,file){
  if(!data.length){showToast("Nothing to export.","warning");return}
  const keys=[...new Set(data.flatMap(o=>Object.keys(o)))];
  const lines=[keys.join(","),...data.map(o=>keys.map(k=>`"${String(o[k]??"").replaceAll('"','""')}"`).join(","))];
  const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=file;a.click();URL.revokeObjectURL(a.href);showToast("CSV exported successfully.");
}
$("printReportBtn").onclick=()=>window.print();
$("profileForm").onsubmit=e=>{
  e.preventDefault();const us=users(),u=currentUser(),i=us.findIndex(x=>x.id===u.id),newEmail=$("profileEmail").value.trim().toLowerCase();
  if(us.some(x=>x.email===newEmail&&x.id!==u.id)){showToast("That email is already in use.","error");return}
  us[i]={...us[i],name:$("profileName").value.trim(),email:newEmail};set(KEYS.users,us);localStorage.setItem(KEYS.session,newEmail);showApp();showToast("Profile saved.");
};
$("settingsForm").onsubmit=e=>{e.preventDefault();set(KEYS.settings,{currency:$("currencySetting").value,threshold:Number($("thresholdSetting").value)});renderAll();showToast("Settings saved.")};
$("passwordForm").onsubmit=e=>{
  e.preventDefault();const us=users(),u=currentUser(),i=us.findIndex(x=>x.id===u.id);
  if(u.password!==$("currentPassword").value){showToast("Current password is incorrect.","error");return}
  if($("newPassword").value!==$("confirmPassword").value){showToast("New passwords do not match.","error");return}
  if($("newPassword").value.length<6){showToast("New password must be at least 6 characters.","error");return}
  us[i].password=$("newPassword").value;set(KEYS.users,us);$("passwordForm").reset();showToast("Password changed successfully.");
};
$("notificationBtn").onclick=()=>{$("notificationPanel").classList.toggle("hidden");renderNotifications()};
$("clearNotifications").onclick=()=>{set(KEYS.notifications,[]);renderNotifications();showToast("Notifications cleared.")};
$("profileBtn").onclick=()=>navigate("settings");
$("menuToggle").onclick=()=>$("sidebar").classList.toggle("open");

window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
window.addEventListener("load",()=>{
  if(localStorage.getItem(KEYS.session)&&currentUser())showApp();else showAuth("login");
  renderNotifications();
});
