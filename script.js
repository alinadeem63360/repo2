
// PRODUCT DATA
const PRODUCTS = [
  {
    id: 1,
    name: 'Silk Wrap Blouse',
    category: 'clothing',
    price: 220,
    oldPrice: null,
    emoji: '👘',
    tag: 'new',
    desc: 'Luxury handcrafted silk wrap blouse.'
  },
  {
    id: 2,
    name: 'Wool Overcoat',
    category: 'clothing',
    price: 580,
    oldPrice: 720,
    emoji: '🧥',
    tag: 'sale',
    desc: 'Premium Italian wool overcoat.'
  },
  {
    id: 3,
    name: 'Leather Tote',
    category: 'accessories',
    price: 460,
    oldPrice: 540,
    emoji: '👜',
    tag: 'sale',
    desc: 'Full grain leather tote bag.'
  },
  {
    id: 4,
    name: 'Gold Cuff',
    category: 'accessories',
    price: 275,
    oldPrice: null,
    emoji: '📿',
    tag: 'new',
    desc: 'Minimal sculpted gold cuff.'
  },
  {
    id: 5,
    name: 'Ceramic Vase',
    category: 'home',
    price: 88,
    oldPrice: null,
    emoji: '🏺',
    tag: null,
    desc: 'Modern handmade ceramic vase.'
  },
  {
    id: 6,
    name: 'Soy Candle Set',
    category: 'home',
    price: 65,
    oldPrice: null,
    emoji: '🕯️',
    tag: 'new',
    desc: 'Luxury scented soy candles.'
  }
];

// STATE
let cart = JSON.parse(localStorage.getItem('luxe_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('luxe_wishlist')) || [];

let currentFilter = 'all';
let currentSort = 'default';

// INIT
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateBadges();
});

// PRODUCTS
function renderProducts() {

  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');

  let products = [...PRODUCTS];

  // filter
  if(currentFilter !== 'all'){
    products = products.filter(
      p => p.category === currentFilter
    );
  }

  // search
  const query = document
    .getElementById('search-input')
    .value
    .trim()
    .toLowerCase();

  if(query){
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  // sort
  switch(currentSort){

    case 'price-asc':
      products.sort((a,b)=>a.price-b.price);
      break;

    case 'price-desc':
      products.sort((a,b)=>b.price-a.price);
      break;

    case 'name':
      products.sort((a,b)=>
        a.name.localeCompare(b.name)
      );
      break;
  }

  grid.innerHTML = '';

  if(products.length === 0){
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  products.forEach(product => {

    const wished = wishlist.includes(product.id);

    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <div class="product-img-wrap">

        ${product.tag
          ? `<div class="product-tag ${product.tag}">
              ${product.tag}
            </div>`
          : ''
        }

        <div class="product-img-placeholder">
          ${product.emoji}
        </div>

        <div class="product-actions">

          <button
            class="action-btn add-cart"
            onclick="addToCart(${product.id})"
          >
            Add to Cart
          </button>

          <button
            class="action-btn add-wish"
            onclick="toggleWishlistItem(${product.id})"
          >
            ${wished ? '♥' : '♡'}
          </button>

        </div>

      </div>

      <div
        class="product-info"
        onclick="openModal(${product.id})"
      >

        <div class="product-category">
          ${product.category}
        </div>

        <div class="product-name">
          ${product.name}
        </div>

        <div class="product-price-row">

          <div class="product-price">
            $${product.price}
          </div>

          ${
            product.oldPrice
            ? `<div class="product-price-old">
                $${product.oldPrice}
              </div>`
            : ''
          }

        </div>

      </div>
    `;

    grid.appendChild(card);

  });

}

// FILTER
function filterProducts(category, btn){

  currentFilter = category;

  const titles = {
    all:'All Products',
    clothing:'Clothing',
    accessories:'Accessories',
    home:'Home'
  };

  document.getElementById('section-title')
    .textContent = titles[category];

  document
    .querySelectorAll('.nav-link')
    .forEach(link => link.classList.remove('active'));

  if(btn){
    btn.classList.add('active');
  }

  renderProducts();

  scrollToProducts();

}

// SORT
function sortProducts(value){
  currentSort = value;
  renderProducts();
}

// SEARCH
function searchProducts(){
  renderProducts();
}

// CART
function addToCart(id){

  const existing = cart.find(item => item.id === id);

  if(existing){
    existing.qty++;
  }else{
    cart.push({
      id,
      qty:1
    });
  }

  saveCart();

  renderCartItems();

  updateBadges();

  showToast('Added to cart');

}

function removeFromCart(id){

  cart = cart.filter(item => item.id !== id);

  saveCart();

  renderCartItems();

  updateBadges();

}

function changeQty(id, amount){

  const item = cart.find(i => i.id === id);

  if(!item) return;

  item.qty += amount;

  if(item.qty <= 0){
    removeFromCart(id);
    return;
  }

  saveCart();

  renderCartItems();

  updateBadges();

}

function renderCartItems(){

  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  if(cart.length === 0){

    container.innerHTML = `
      <div class="empty-state">
        Your cart is empty.
      </div>
    `;

    totalEl.textContent = '$0.00';

    return;

  }

  let total = 0;

  container.innerHTML = cart.map(item => {

    const product = PRODUCTS.find(p => p.id === item.id);

    total += product.price * item.qty;

    return `
      <div class="cart-item">

        <div class="cart-item-emoji">
          ${product.emoji}
        </div>

        <div class="cart-item-info">

          <div class="cart-item-name">
            ${product.name}
          </div>

          <div>
            $${product.price}
          </div>

        </div>

        <div class="cart-item-controls">

          <button
            class="qty-btn"
            onclick="changeQty(${product.id}, -1)"
          >
            -
          </button>

          <span>${item.qty}</span>

          <button
            class="qty-btn"
            onclick="changeQty(${product.id}, 1)"
          >
            +
          </button>

        </div>

      </div>
    `;

  }).join('');

  totalEl.textContent = '$' + total.toFixed(2);

}

// WISHLIST
function toggleWishlistItem(id){

  if(wishlist.includes(id)){

    wishlist = wishlist.filter(x => x !== id);

    showToast('Removed from wishlist');

  }else{

    wishlist.push(id);

    showToast('Added to wishlist');

  }

  localStorage.setItem(
    'luxe_wishlist',
    JSON.stringify(wishlist)
  );

  updateBadges();

  renderWishlistItems();

  renderProducts();

}

function renderWishlistItems(){

  const container = document.getElementById('wishlist-items');

  if(wishlist.length === 0){

    container.innerHTML = `
      <div class="empty-state">
        Wishlist is empty.
      </div>
    `;

    return;

  }

  container.innerHTML = wishlist.map(id => {

    const product = PRODUCTS.find(p => p.id === id);

    return `
      <div class="cart-item">

        <div class="cart-item-emoji">
          ${product.emoji}
        </div>

        <div class="cart-item-info">

          <div class="cart-item-name">
            ${product.name}
          </div>

          <div>
            $${product.price}
          </div>

        </div>

      </div>
    `;

  }).join('');

}

// BADGES
function updateBadges(){

  const cartCount = cart.reduce(
    (sum,item)=>sum + item.qty,
    0
  );

  const wishlistCount = wishlist.length;

  const cartBadge =
    document.getElementById('cart-badge');

  const wishlistBadge =
    document.getElementById('wishlist-badge');

  cartBadge.textContent = cartCount;
  wishlistBadge.textContent = wishlistCount;

  cartBadge.classList.toggle(
    'visible',
    cartCount > 0
  );

  wishlistBadge.classList.toggle(
    'visible',
    wishlistCount > 0
  );

}

// SAVE
function saveCart(){
  localStorage.setItem(
    'luxe_cart',
    JSON.stringify(cart)
  );
}

// SIDEBARS
function toggleCart(){

  const sidebar =
    document.getElementById('cart-sidebar');

  const overlay =
    document.getElementById('overlay');

  const wishlistSidebar =
    document.getElementById('wishlist-sidebar');

  wishlistSidebar.classList.remove('open');

  sidebar.classList.toggle('open');

  overlay.classList.toggle(
    'visible',
    sidebar.classList.contains('open')
  );

  renderCartItems();

}

function toggleWishlist(){

  const sidebar =
    document.getElementById('wishlist-sidebar');

  const overlay =
    document.getElementById('overlay');

  const cartSidebar =
    document.getElementById('cart-sidebar');

  cartSidebar.classList.remove('open');

  sidebar.classList.toggle('open');

  overlay.classList.toggle(
    'visible',
    sidebar.classList.contains('open')
  );

  renderWishlistItems();

}

function closeAll(){

  document
    .querySelectorAll('.sidebar')
    .forEach(sidebar =>
      sidebar.classList.remove('open')
    );

  document
    .getElementById('overlay')
    .classList.remove('visible');

}

// SEARCH TOGGLE
function toggleSearch(){

  document
    .getElementById('search-wrapper')
    .classList.toggle('open');

}

// MOBILE MENU
function toggleMobileMenu(){

  document
    .getElementById('mobile-nav')
    .classList.toggle('open');

}

// MODAL
function openModal(id){

  const product = PRODUCTS.find(p => p.id === id);

  const body = document.getElementById('modal-body');

  body.innerHTML = `
    <div class="modal-body">

      <div class="modal-img-wrap">
        ${product.emoji}
      </div>

      <div class="modal-info">

        <div class="modal-category">
          ${product.category}
        </div>

        <h2 class="modal-name">
          ${product.name}
        </h2>

        <div class="modal-price">
          $${product.price}
        </div>

        <p class="modal-desc">
          ${product.desc}
        </p>

        <div class="modal-actions">

          <button
            class="modal-add-cart"
            onclick="addToCart(${product.id})"
          >
            Add to Cart
          </button>

          <button
            class="modal-wish-btn"
            onclick="toggleWishlistItem(${product.id})"
          >
            ♥
          </button>

        </div>

      </div>

    </div>
  `;

  document
    .getElementById('modal-overlay')
    .classList.add('visible');

  document
    .getElementById('product-modal')
    .classList.add('open');

}

function closeModal(){

  document
    .getElementById('modal-overlay')
    .classList.remove('visible');

  document
    .getElementById('product-modal')
    .classList.remove('open');

}

// NEWSLETTER
function subscribeNewsletter(){

  const input =
    document.getElementById('email-input');

  const message =
    document.getElementById('newsletter-msg');

  const email = input.value.trim();

  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if(!valid){

    message.textContent =
      'Please enter a valid email address';

    return;

  }

  message.textContent =
    'Successfully subscribed ✓';

  input.value = '';

}

// CHECKOUT
function checkout(){

  if(cart.length === 0){

    showToast('Cart is empty');

    return;

  }

  showToast('Order placed successfully ✓');

  cart = [];

  saveCart();

  renderCartItems();

  updateBadges();

  closeAll();

}

// TOAST
let toastTimer;

function showToast(message){

  const toast =
    document.getElementById('toast');

  toast.textContent = message;

  toast.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove('show');

  }, 2400);

}

// UTILS
function scrollToTop(){

  window.scrollTo({
    top:0,
    behavior:'smooth'
  });

}

function scrollToProducts(){

  document
    .getElementById('products')
    .scrollIntoView({
      behavior:'smooth'
    });

}

// ESC
document.addEventListener('keydown', e => {

  if(e.key === 'Escape'){

    closeModal();

    closeAll();

  }

});