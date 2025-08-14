// Afiya Couture Storefront (lightweight)
const products = [
  {id:'kaliana', name:'Kaliana Vest', price: 459000, badge:'Baru', img:'assets/look1.jpg'},
  {id:'carine', name:'Carine Vest', price: 489000, badge:'Favorit', img:'assets/look2.jpg'},
  {id:'narnia', name:'Narnia Set', price: 559000, badge:'Limited', img:'assets/look3.jpg'},
];
const rupiah = n => 'Rp' + n.toLocaleString('id-ID');

document.getElementById('year').textContent = new Date().getFullYear();
const toTop = document.getElementById('toTop') || document.querySelector('.to-top');
window.addEventListener('scroll', () => { if(toTop) toTop.style.display = window.scrollY > 500 ? 'grid' : 'none'; });
if(toTop) toTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

// music
const audio = document.getElementById('backsound');
const musicBtn = document.getElementById('musicToggle');
let musicOn = false;
musicBtn.addEventListener('click', async () => {
  try{
    if(musicOn){ audio.pause(); musicBtn.textContent = '♪'; }
    else { await audio.play(); musicBtn.textContent = '♫'; }
    musicOn = !musicOn;
  }catch(e){ alert('Browser memblokir autoplay. Klik sekali lagi untuk memulai musik.'); }
});

// slider
const slider = document.getElementById('slider');
const slides = slider.querySelector('.slides');
const slideCount = slides.children.length;
let index = 0;
const dots = document.getElementById('dots');
for(let i=0;i<slideCount;i++){
  const d=document.createElement('button'); if(i===0) d.classList.add('active');
  d.addEventListener('click',()=>go(i)); dots.appendChild(d);
}
function go(i){
  index = (i+slideCount)%slideCount;
  slides.style.transform = `translateX(-${index*100}%)`;
  [...dots.children].forEach((el,idx)=>el.classList.toggle('active', idx===index));
}
document.getElementById('prev').onclick=()=>go(index-1);
document.getElementById('next').onclick=()=>go(index+1);
setInterval(()=>go(index+1), 5000);

// render products
const grid = document.getElementById('productGrid');
grid.innerHTML = products.map(p => `
  <article class="card" data-id="${p.id}">
    <span class="badge">${p.badge}</span>
    <div class="img-wrap"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <div class="content">
      <h4>${p.name}</h4>
      <div class="small">Afiya Couture</div>
      <div class="price">${rupiah(p.price)}</div>
      <div class="actions">
        <button class="btn add">Tambah</button>
        <button class="icon-btn wish" title="Wishlist">❤</button>
      </div>
    </div>
  </article>
`).join('');

// wishlist
grid.addEventListener('click', e => {
  if(e.target.classList.contains('wish')) e.target.classList.toggle('active');
});

// cart
const cartDrawer = document.getElementById('cartDrawer');
const openCart = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const backdrop = document.getElementById('backdrop');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const subtotalEl = document.getElementById('subtotal');

let cart = JSON.parse(localStorage.getItem('cart-afiya')||'[]');
function saveCart(){ localStorage.setItem('cart-afiya', JSON.stringify(cart)); }
function refreshCart(){
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}" width="60" height="80">
      <div>
        <div><strong>${item.name}</strong></div>
        <div class="small">${rupiah(item.price)}</div>
        <div class="qty">
          <button class="dec">-</button>
          <span>${item.qty}</span>
          <button class="inc">+</button>
          <button class="remove" style="margin-left:8px">Hapus</button>
        </div>
      </div>
      <div><strong>${rupiah(item.price*item.qty)}</strong></div>
    </div>
  `).join('') || '<p class="small">Keranjang masih kosong.</p>';
  const count = cart.reduce((a,b)=>a+b.qty,0);
  const total = cart.reduce((a,b)=>a+b.qty*b.price,0);
  cartCountEl.textContent = count;
  subtotalEl.textContent = rupiah(total);
}
refreshCart();

openCart.addEventListener('click', () => { cartDrawer.classList.add('open'); backdrop.classList.add('show'); });
closeCart.addEventListener('click', () => { cartDrawer.classList.remove('open'); backdrop.classList.remove('show'); });
backdrop.addEventListener('click', () => { cartDrawer.classList.remove('open'); backdrop.classList.remove('show'); });

grid.addEventListener('click', e => {
  if(e.target.classList.contains('add')){
    const id = e.target.closest('.card').dataset.id;
    const p = products.find(x=>x.id===id);
    const existing = cart.find(x=>x.id===id);
    if(existing) existing.qty += 1;
    else cart.push({id:p.id, name:p.name, price:p.price, img:p.img, qty:1});
    saveCart(); refreshCart();
    cartDrawer.classList.add('open'); backdrop.classList.add('show');
  }
});

cartItemsEl.addEventListener('click', e => {
  const wrap = e.target.closest('.cart-item'); if(!wrap) return;
  const id = wrap.dataset.id;
  if(e.target.classList.contains('inc')){ cart.find(x=>x.id===id).qty += 1; }
  else if(e.target.classList.contains('dec')){
    const it = cart.find(x=>x.id===id); it.qty -= 1; if(it.qty<=0) cart = cart.filter(x=>x.id!==id);
  }else if(e.target.classList.contains('remove')){ cart = cart.filter(x=>x.id!==id); }
  saveCart(); refreshCart();
});

// checkout
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');

checkoutBtn.addEventListener('click', () => {
  if(cart.length===0){ alert('Keranjang masih kosong.'); return; }
  checkoutModal.classList.add('show');
});
closeCheckout.addEventListener('click', () => checkoutModal.classList.remove('show'));

checkoutForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(checkoutForm).entries());
  const order = {
    items: cart,
    subtotal: cart.reduce((a,b)=>a+b.qty*b.price,0),
    ...data, date: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(order,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'order-afiya.json'; a.click();
  URL.revokeObjectURL(url);
  alert('Terima kasih! Pesanan demo kamu tersimpan sebagai file JSON.');
  cart = []; saveCart(); refreshCart();
  checkoutModal.classList.remove('show'); cartDrawer.classList.remove('open'); backdrop.classList.remove('show');
});
