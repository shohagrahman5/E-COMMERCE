
(function () {
  'use strict';

  
  let productsCache = [];
  let usersCache = [];
  let ordersCache = [];
  let reviewsCache = [];

  function page(name) { return location.pathname.toLowerCase().endsWith(name.toLowerCase()); }
  function money(value) { return '৳' + Number(value || 0).toLocaleString('en-BD'); }
  function esc(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]); }
  function toast(message) {
    let box = document.getElementById('app-toast');
    if (!box) { box=document.createElement('div'); box.id='app-toast'; box.style.cssText='position:fixed;right:20px;bottom:20px;z-index:99999;background:#222;color:#fff;padding:12px 18px;border-radius:8px;box-shadow:0 5px 20px #0004;font:14px Arial,sans-serif;max-width:320px;'; document.body.appendChild(box); }
    box.textContent=message; box.style.opacity='1'; clearTimeout(window.__sajaboToast); window.__sajaboToast=setTimeout(()=>box.style.opacity='0',2500);
  }
  async function api(path, options={}) {
    const res=await fetch(path, options);
    let data={}; try { data=await res.json(); } catch(e) {}
    if(!res.ok) throw new Error(data.error || 'Server error');
    return data;
  }
  function post(path, data) {
    return api(path, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body:new URLSearchParams(data) });
  }
  async function loadData() {
    try {
      [productsCache, usersCache, ordersCache, reviewsCache] = await Promise.all([
        api('api/products.php'), api('api/users.php'), api('api/orders.php'), api('api/reviews.php')
      ]);
    } catch(e) { console.error(e); toast('Start Sajabo.java and make sure MySQL is running.'); }
  }
  function getCurrentUser() { try { return JSON.parse(localStorage.getItem('sajabo_current_user') || 'null'); } catch(e) { return null; } }
  function setCurrentUser(u) { localStorage.setItem('sajabo_current_user', JSON.stringify(u)); }
  function clearCurrentUser() { localStorage.removeItem('sajabo_current_user'); }

  function toggleMenu() { const sidebar=document.getElementById('sidebar'); if(sidebar) sidebar.classList.toggle('open'); }
  window.toggleMenu=toggleMenu;

  function orderProduct(product, price, quantityId) {
    const input=document.getElementById(quantityId); let quantity=Number(input && input.value); if(!Number.isFinite(quantity)||quantity<1)quantity=1; quantity=Math.min(10,Math.floor(quantity));
    location.href='orderdetail.html?product='+encodeURIComponent(product)+'&price='+encodeURIComponent(price)+'&quantity='+quantity;
  }
  window.orderProduct=orderProduct;

  function initSearch() {
    const input=document.querySelector('.search'); if(!input)return;
    input.addEventListener('input',function(){const q=input.value.trim().toLowerCase();document.querySelectorAll('[data-product-card]').forEach(card=>card.style.display=card.textContent.toLowerCase().includes(q)?'':'none');});
  }

  function initCategoryFilter() {
    if(!page('catagory.html'))return; const select=document.getElementById('categoryFilter'); if(!select)return;
    select.addEventListener('change',function(){const value=select.value;document.querySelectorAll('[data-product-card]').forEach(card=>{card.style.display=(value==='all'||card.dataset.category===value)?'':'none';});});
  }

  async function initRegister() {
    if(!page('useraccount.html'))return; const form=document.querySelector('form'); if(!form)return;
    form.addEventListener('submit',async function(e){e.preventDefault();const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim().toLowerCase(),phone=document.getElementById('phone').value.trim(),password=document.getElementById('password').value;if(!name||!email||!phone||!password)return toast('Please fill in all fields.');if(password.length<4)return toast('Password must be at least 4 characters.');try{const r=await post('api/register.php',{name,email,phone,password});setCurrentUser(r.user);toast('Account created successfully.');setTimeout(()=>location.href='userpage.html',500);}catch(err){toast(err.message);}});
  }

  async function initUserLogin() {
    if(!(page('user.html')||page('login.html')))return; const form=document.querySelector('form');if(!form)return;
    form.addEventListener('submit',async function(e){e.preventDefault();const email=document.getElementById('email').value.trim().toLowerCase(),password=document.getElementById('password').value;try{const r=await post('api/login.php',{email,password});setCurrentUser(r.user);toast('Login successful.');setTimeout(()=>location.href='userpage.html',300);}catch(err){toast(err.message);}});
  }

  function initAdminLogin() {
    if(!page('admin.html'))return; const form=document.querySelector('form');if(!form)return;
    form.addEventListener('submit',async function(e){e.preventDefault();const email=document.getElementById('email').value.trim().toLowerCase(),password=document.getElementById('password').value;try{await post('api/admin-login.php',{email,password});sessionStorage.setItem('sajabo_admin','1');location.href='admindeshbord.html';}catch(err){toast(err.message);}});
  }

  
  function initAdminForgot() {
    if (!page('admin-forgot.html')) return;
    const stepEmail = document.getElementById('step-email'),
      stepReset = document.getElementById('step-reset'),
      stepDone = document.getElementById('step-done'),
      emailInput = document.getElementById('forgot-email'),
      emailError = document.getElementById('step-email-error'),
      findBtn = document.getElementById('find-account-btn'),
      questionLabel = document.getElementById('security-question-label'),
      answerInput = document.getElementById('security-answer'),
      newPasswordInput = document.getElementById('new-password'),
      confirmPasswordInput = document.getElementById('confirm-password'),
      resetError = document.getElementById('step-reset-error'),
      resetBtn = document.getElementById('reset-password-btn'),
      loginBtn = document.getElementById('go-to-login-btn');
    if (!stepEmail || !stepReset || !stepDone) return;

    function showStep(step) {
      [stepEmail, stepReset, stepDone].forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    }

    let verifiedEmail = '';

    findBtn.onclick = async function () {
      const email = emailInput.value.trim().toLowerCase();
      emailError.textContent = '';
      if (!email) { emailError.textContent = 'Enter the admin email.'; return; }
      try {
        const r = await api('api/admin-forgot.php?email=' + encodeURIComponent(email));
        verifiedEmail = email;
        questionLabel.textContent = 'Security Question: ' + r.question;
        answerInput.value = ''; newPasswordInput.value = ''; confirmPasswordInput.value = ''; resetError.textContent = '';
        showStep(stepReset);
      } catch (err) { emailError.textContent = err.message; }
    };

    resetBtn.onclick = async function () {
      const answer = answerInput.value.trim(),
        newPassword = newPasswordInput.value,
        confirmPassword = confirmPasswordInput.value;
      resetError.textContent = '';
      if (!answer || !newPassword) { resetError.textContent = 'Please fill in all fields.'; return; }
      if (newPassword !== confirmPassword) { resetError.textContent = 'Passwords do not match.'; return; }
      try {
        await post('api/admin-reset-password.php', { email: verifiedEmail, answer, new_password: newPassword });
        showStep(stepDone);
      } catch (err) { resetError.textContent = err.message; }
    };

    if (loginBtn) loginBtn.onclick = function () { location.href = 'admin.html'; };
  }

  async function initOrder() {
    if(!page('orderdetail.html'))return; const params=new URLSearchParams(location.search),product=params.get('product')||'',price=Number(params.get('price'))||0,q=document.getElementById('quantity'),productInput=document.getElementById('product'),priceInput=document.getElementById('price'),totalInput=document.getElementById('total'),form=document.querySelector('form');
    if(!q||!productInput||!priceInput||!totalInput||!form)return;if(!product||price<=0){toast('Invalid product. Please select a product again.');setTimeout(()=>location.href='projectHOME.html',800);return;}
    productInput.value=product;priceInput.value=money(price);q.value=Math.min(10,Math.max(1,Number(params.get('quantity'))||1));
    function calculateTotal(){q.value=Math.min(10,Math.max(1,Number(q.value)||1));totalInput.value=money(price*Number(q.value));} window.calculateTotal=calculateTotal;q.addEventListener('input',calculateTotal);q.addEventListener('change',calculateTotal);calculateTotal();
    const current=getCurrentUser();if(current){const name=form.querySelector('[name="name"]'),email=form.querySelector('[name="email"]'),phone=form.querySelector('[name="phone"]');if(name)name.value=current.name||'';if(email)email.value=current.email||'';if(phone)phone.value=current.phone||'';}
    async function placeOrder(fields, extra) {
      const payload = Object.assign({}, fields, extra || {});
      const r = await post('api/order.php', payload);
      setCurrentUser({ name: fields.name, email: fields.email, phone: fields.phone });
      alert('Order placed successfully!\nOrder ID: ' + r.id + '\nTotal: ' + money(fields.total) + (r.transactionId ? '\nTransaction ID: ' + r.transactionId : ''));
      location.href = 'userpage.html';
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const data = new FormData(form),
        name = String(data.get('name') || '').trim(),
        email = String(data.get('email') || '').trim().toLowerCase(),
        phone = String(data.get('phone') || '').trim(),
        address = String(data.get('address') || '').trim(),
        payment = String(data.get('payment') || 'Cash on Delivery'),
        quantity = Number(q.value),
        total = price * quantity;
      if (!name || !email || !phone || !address) return toast('Please complete all customer information.');
      const fields = { name, email, phone, address, product, price, quantity, total, payment };

      if (payment === 'bKash') {
        openBkashGateway(total, async (transactionId) => {
          try {
            await placeOrder(fields, { transaction_id: transactionId });
          } catch (err) { toast(err.message); }
        });
        return;
      }

      try { await placeOrder(fields); } catch (err) { toast(err.message); }
    });
  }

 
  function openBkashGateway(amount, onSuccess) {
    const overlay = document.getElementById('bkash-overlay');
    if (!overlay) { toast('bKash gateway unavailable.'); return; }

    const stepPhone = document.getElementById('bkash-step-phone'),
      stepPin = document.getElementById('bkash-step-pin'),
      stepProcessing = document.getElementById('bkash-step-processing'),
      stepSuccess = document.getElementById('bkash-step-success'),
      phoneInput = document.getElementById('bkash-phone'),
      pinInput = document.getElementById('bkash-pin'),
      phoneError = document.getElementById('bkash-phone-error'),
      pinError = document.getElementById('bkash-pin-error'),
      closeBtn = document.getElementById('bkash-close'),
      phoneNextBtn = document.getElementById('bkash-phone-next'),
      pinConfirmBtn = document.getElementById('bkash-pin-confirm'),
      doneBtn = document.getElementById('bkash-done');

    function showStep(step) {
      [stepPhone, stepPin, stepProcessing, stepSuccess].forEach(s => { if (s) s.style.display = 'none'; });
      if (step) step.style.display = 'block';
    }
    function reset() {
      phoneInput.value = ''; pinInput.value = '';
      phoneError.textContent = ''; pinError.textContent = '';
      showStep(stepPhone);
    }
    function close() {
      overlay.style.display = 'none';
      closeBtn.onclick = phoneNextBtn.onclick = pinConfirmBtn.onclick = doneBtn.onclick = null;
    }

    document.getElementById('bkash-amount-1').textContent = money(amount);
    document.getElementById('bkash-amount-2').textContent = money(amount);
    document.getElementById('bkash-amount-3').textContent = money(amount);
    reset();
    overlay.style.display = 'flex';

    closeBtn.onclick = close;

    phoneNextBtn.onclick = function () {
      const phone = phoneInput.value.trim();
      if (!/^01[3-9]\d{8}$/.test(phone)) { phoneError.textContent = 'Enter a valid 11-digit bKash number.'; return; }
      phoneError.textContent = '';
      document.getElementById('bkash-phone-display').textContent = phone;
      showStep(stepPin);
    };

    pinConfirmBtn.onclick = async function () {
      const phone = phoneInput.value.trim(), pin = pinInput.value.trim();
      if (!/^\d{4,5}$/.test(pin)) { pinError.textContent = 'PIN must be 4-5 digits.'; return; }
      pinError.textContent = '';
      showStep(stepProcessing);
      try {
        const r = await post('api/bkash-payment.php', { phone, pin, amount });
        setTimeout(function () {
          document.getElementById('bkash-trxid').textContent = r.transactionId;
          showStep(stepSuccess);
        }, 700);
      } catch (err) {
        showStep(stepPin);
        pinError.textContent = err.message;
      }
    };

    doneBtn.onclick = function () {
      const trxId = document.getElementById('bkash-trxid').textContent;
      close();
      onSuccess(trxId);
    };
  }

  async function initReview() {
    if(!page('review.html'))return;const form=document.querySelector('form');if(form)form.addEventListener('submit',async function(e){e.preventDefault();const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim(),rating=Number(document.getElementById('rating').value),text=document.getElementById('review').value.trim();if(!name||!email||!text)return toast('Please complete the review form.');try{await post('api/review.php',{name,email,rating,text,date:new Date().toLocaleDateString('en-GB')});form.reset();await loadData();renderReviews();toast('Review submitted successfully.');}catch(err){toast(err.message);}});renderReviews();
  }
  function renderReviews(){const heading=[...document.querySelectorAll('h2')].find(h=>h.textContent.trim()==='Customer Reviews');if(!heading)return;let box=document.getElementById('dynamic-reviews');if(!box){box=document.createElement('div');box.id='dynamic-reviews';heading.insertAdjacentElement('afterend',box);}const reviews=reviewsCache.filter(r=>r.approved!==false);box.innerHTML=reviews.length?reviews.map(r=>`<div class="review"><h3>${'⭐'.repeat(Number(r.rating)||1)} ${esc(r.name)}</h3><p>${esc(r.text)}</p><small>${esc(r.date||'')}</small></div><hr>`).join(''):'<p>No new approved reviews yet.</p>';}

  async function initUserPage(){if(!page('userpage.html'))return;const user=getCurrentUser();if(!user){location.href='user.html';return;}const info=document.querySelector('.user-information');if(info){info.innerHTML=`<h2>My Information</h2><p><b>Name:</b> ${esc(user.name)}</p><p><b>Email:</b> ${esc(user.email)}</p><p><b>Phone:</b> ${esc(user.phone||'Not provided')}</p><button id="edit-user">Edit Information</button>`;document.getElementById('edit-user').onclick=()=>location.href='useraccount.html';}const box=document.querySelector('.orders');if(box){const orders=ordersCache.filter(o=>o.email===user.email);box.innerHTML='<h2>My Orders</h2>'+(orders.length?orders.map(o=>`<div class="order"><h3>${esc(o.id)}</h3><p><b>Product:</b> ${esc(o.product)} × ${o.quantity}</p><p><b>Total:</b> ${money(o.total)}</p><p><b>Payment:</b> ${esc(o.payment)}${o.paymentStatus?' ('+esc(o.paymentStatus)+')':''}</p>${o.transactionId?`<p><b>Transaction ID:</b> ${esc(o.transactionId)}</p>`:''}<p><b>Address:</b> ${esc(o.address)}</p><p><b>Order Date:</b> ${esc(o.date)}</p><p><b>Status:</b> <span>${esc(o.status)}</span></p></div>`).join(''):'<p>No orders yet. Go to the home page to order a product.</p>');}const logout=document.getElementById('logout-user');if(logout)logout.onclick=function(){clearCurrentUser();location.href='projectHOME.html';};}

  async function initAdminDashboard(){if(!page('admindeshbord.html'))return;if(sessionStorage.getItem('sajabo_admin')!=='1'){location.href='admin.html';return;}renderAdminOrders();renderAdminCustomers();renderAdminProducts();renderAdminReviews();const form=document.getElementById('product-form');if(form){form.addEventListener('submit',async function(e){e.preventDefault();const editIdInput=document.getElementById('edit-product-id'),editId=editIdInput?editIdInput.value:'',name=document.getElementById('product-name').value.trim(),price=Number(document.getElementById('price').value),category=document.getElementById('category').value,description=document.getElementById('description').value.trim(),imageInput=document.getElementById('product-image');if(!name||!Number.isFinite(price)||price<=0)return toast('Enter a valid product name and price.');const existing=productsCache.find(p=>String(p.id)===String(editId));const save=async image=>{try{await post('api/product-save.php',{id:editId,name,price,category,description,image:image||''});await loadData();form.reset();if(editIdInput)editIdInput.value='';setProductFormMode(false);renderAdminProducts();toast(editId?'Product updated successfully.':'Product added successfully.');}catch(err){toast(err.message);}};const file=imageInput&&imageInput.files&&imageInput.files[0];if(file){const reader=new FileReader();reader.onload=()=>save(reader.result);reader.readAsDataURL(file);}else save(existing?existing.image:'bulb.jpg');});const cancel=document.getElementById('cancel-product-edit');if(cancel)cancel.onclick=function(){form.reset();const editIdInput=document.getElementById('edit-product-id');if(editIdInput)editIdInput.value='';setProductFormMode(false);};}const logout=document.getElementById('admin-logout');if(logout)logout.onclick=function(){sessionStorage.removeItem('sajabo_admin');location.href='projectHOME.html';};}

  function renderAdminOrders(){const table=document.querySelector('#orders table');if(!table)return;const statuses=['Pending','Processing','On the way','Delivered','Cancelled'];const orders=ordersCache;table.innerHTML=`<tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Total</th><th>Payment</th><th>Status</th><th>Action</th></tr>`+(orders.length?orders.map(o=>`<tr><td>${esc(o.id)}</td><td>${esc(o.name)}<br><small>${esc(o.email)}</small></td><td>${esc(o.product)} × ${o.quantity}</td><td>${money(o.total)}</td><td>${esc(o.payment)}<br><small>${esc(o.paymentStatus||'Unpaid')}${o.transactionId?' · '+esc(o.transactionId):''}</small></td><td><select data-status="${esc(o.id)}">${statuses.map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></td><td><button data-save-order="${esc(o.id)}">Save</button></td></tr>`).join(''):'<tr><td colspan="7">No orders yet.</td></tr>');table.querySelectorAll('[data-save-order]').forEach(button=>button.onclick=async function(){const id=button.dataset.saveOrder,select=table.querySelector(`[data-status="${CSS.escape(id)}"]`);if(!select)return;try{await post('api/order-status.php',{id,status:select.value});await loadData();renderAdminOrders();toast('Order status updated.');}catch(err){toast(err.message);}});}
  function renderAdminCustomers(){const table=document.querySelector('#customers table');if(!table)return;const list=usersCache;table.innerHTML='<tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Total Orders</th></tr>'+(list.length?list.map((u,i)=>`<tr><td>${String(i+1).padStart(3,'0')}</td><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td>${u.count||0}</td></tr>`).join(''):'<tr><td colspan="5">No customers yet.</td></tr>');}
  function setProductFormMode(editing){const title=document.getElementById('product-form-title'),submit=document.querySelector('#product-form button[type="submit"]'),cancel=document.getElementById('cancel-product-edit');if(title)title.textContent=editing?'Edit Product':'Add Product';if(submit)submit.textContent=editing?'Update Product':'Save Product';if(cancel)cancel.style.display=editing?'inline-block':'none';}
  function editAdminProduct(id){const product=productsCache.find(p=>String(p.id)===String(id));if(!product)return toast('Product not found.');const form=document.getElementById('product-form');if(!form)return;const idInput=document.getElementById('edit-product-id');document.getElementById('product-name').value=product.name||'';document.getElementById('price').value=product.price||'';document.getElementById('category').value=product.category||'Chandeliers';document.getElementById('description').value=product.description||'';if(idInput)idInput.value=product.id;const imageInput=document.getElementById('product-image');if(imageInput)imageInput.value='';setProductFormMode(true);form.scrollIntoView({behavior:'smooth',block:'start'});}
  window.editAdminProduct=editAdminProduct;
  function renderAdminProducts(){const table=document.querySelector('#products table');if(!table)return;table.innerHTML='<tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Action</th></tr>'+productsCache.map(p=>`<tr><td><img src="${esc(p.image)}" width="70" height="70" style="object-fit:cover" alt="${esc(p.name)}"></td><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td><button type="button" data-edit-product="${p.id}">Edit</button> <button type="button" data-delete-product="${p.id}">Delete</button></td></tr>`).join('');table.querySelectorAll('[data-edit-product]').forEach(b=>b.onclick=()=>editAdminProduct(b.dataset.editProduct));table.querySelectorAll('[data-delete-product]').forEach(b=>b.onclick=async function(){const id=Number(b.dataset.deleteProduct);if(!confirm('Delete this product?'))return;try{await post('api/product-delete.php',{id});await loadData();const editId=document.getElementById('edit-product-id');if(editId&&String(editId.value)===String(id)){document.getElementById('product-form').reset();editId.value='';setProductFormMode(false);}renderAdminProducts();toast('Product deleted.');}catch(err){toast(err.message);}});}
  async function renderAdminReviews(){const section=document.querySelector('#reviews');if(!section)return;section.querySelectorAll('.dynamic-review').forEach(x=>x.remove());reviewsCache.forEach(r=>{const div=document.createElement('div');div.className='review dynamic-review';div.innerHTML=`<h3>${'⭐'.repeat(Number(r.rating)||1)} ${esc(r.name)}</h3><p>"${esc(r.text)}"</p><button data-review-action="approve">Approve</button> <button data-review-action="reject">Reject</button>`;div.querySelector('[data-review-action="approve"]').onclick=async()=>{try{await post('api/review-action.php',{id:r.id,action:'approve'});await loadData();renderAdminReviews();toast('Review approved.');}catch(err){toast(err.message);}};div.querySelector('[data-review-action="reject"]').onclick=async()=>{try{await post('api/review-action.php',{id:r.id,action:'reject'});await loadData();renderAdminReviews();toast('Review rejected.');}catch(err){toast(err.message);}};section.appendChild(div);});}

  function initHomeProducts(){
    if(!page('projectHOME.html'))return;
    const body=document.getElementById('home-products-body');
    if(!body)return;
    if(!productsCache.length){body.innerHTML='<tr><td align="center">No products available yet.</td></tr>';return;}
    let rows='';
    for(let i=0;i<productsCache.length;i+=2){
      const pair=productsCache.slice(i,i+2);
      rows+='<tr>'+pair.map(p=>{
        const qtyId='home-qty-'+p.id;
        return `<td align="center" data-product-card data-category="${esc(p.category||'')}">`
          +`<img src="${esc(p.image||'bulb.jpg')}" width="250">`
          +`<h2>${esc(p.name)}</h2>`
          +`<h3>${money(p.price)}</h3>`
          +`<button onclick="orderProduct('${esc(p.name).replace(/'/g,"\\'")}', ${Number(p.price)||0}, '${qtyId}')">Order</button>`
          +`</td>`;
      }).join('')+'</tr>';
    }
    body.innerHTML=rows;
  }

  async function init(){initSearch();initCategoryFilter();initAdminLogin();initAdminForgot();await loadData();initHomeProducts();await initRegister();await initUserLogin();await initOrder();await initReview();await initUserPage();await initAdminDashboard();}
  document.addEventListener('DOMContentLoaded',init);
})();
