// ─── PRODUCT DATA ─────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1, name: 'Silk Wrap Blouse', category: 'clothing',
    price: 220, oldPrice: null, emoji: '👘',
    tag: 'new', sizes: ['XS','S','M','L','XL'],
    desc: 'Hand-finished in a Florence atelier, this silk wrap blouse drapes effortlessly over the body. Crafted from 100% Mulberry silk with mother-of-pearl buttons.'
  },
  {
    id: 2, name: 'Wool Overcoat', category: 'clothing',
    price: 580, oldPrice: 720, emoji: '🧥',
    tag: 'sale', sizes: ['XS','S','M','L','XL','XXL'],
    desc: 'A structured overcoat in double-faced Italian wool. Notch lapels, slit pockets, and a single vent for ease of movement. Fully lined in silk crepe.'
  },
  {
    id: 3, name: 'Linen Trousers', category: 'clothing',
    price: 185, oldPrice: null, emoji: '👖',
    tag: null, sizes: ['XS','S','M','L','XL'],
    desc: 'Wide-leg trousers in stone-washed Belgian linen. An elasticated waist ensures effortless comfort without sacrificing elegance.'
  },
  {
    id: 4, name: 'Cashmere Knit', category: 'clothing',
    price: 310, oldPrice: null, emoji: '🧶',
    tag: 'new', sizes: ['S','M','L'],
    desc: 'A two-ply cashmere rollneck, knitted in the Scottish Highlands. Relaxed fit with ribbed cuffs and hem. Available in four seasonal tones.'
  },
  {
    id: 5, name: 'Leather Tote', category: 'accessories',
    price: 460, oldPrice: 540, emoji: '👜',
    tag: 'sale', sizes: null,
    desc: 'Full-grain vegetable-tanned leather tote with a natural patina. Unlined interior with a zip pocket and brass hardware. Develops character with use.'
  },
  {
    id: 6, name: 'Silk Scarf', category: 'accessories',
    price: 145, oldPrice: null, emoji: '🧣',
    tag: null, sizes: null,
    desc: 'A generous 90×90cm twill silk scarf, hand-rolled at the edges. Features a watercolour botanical print exclusive to LUXE.'
  },
  {
    id: 7, name: 'Straw Hat', category: 'accessories',
    price: 95, oldPrice: null, emoji: '👒',
    tag: 'new', sizes: ['S/M','L/XL'],
    desc: 'Handwoven in Ecuador from toquilla straw. A classic Fedora shape with a grosgrain ribbon band. Lightweight, packable, iconic.'
  },
  {
    id: 8, name: 'Gold Cuff', category: 'accessories',
    price: 275, oldPrice: null, emoji: '📿',
    tag: null, sizes: null,
    desc: 'A sculptural cuff cast in 18k gold-plated brass. The organic form references tidal pooling — each piece slightly unique from the casting.'
  },
  {
    id: 9, name: 'Linen Throw', category: 'home',
    price: 155, oldPrice: 190, emoji: '🛋️',
    tag: 'sale', sizes: null,
    desc: 'A generously sized throw woven from stonewashed linen in a natural herringbone. Pre-washed for immediate softness, only improves over time.'
  },
  {
    id: 10, name: 'Ceramic Vase', category: 'home',
    price: 88, oldPrice: null, emoji: '🏺',
    tag: null, sizes: null,
    desc: 'Hand-thrown stoneware vase with a reactive ash glaze. Each piece is unique — the glaze shifts from ash-grey to warm amber depending on the light.'
  },
  {
    id: 11, name: 'Soy Candle Set', category: 'home',
    price: 65, oldPrice: null, emoji: '🕯️',
    tag: 'new', sizes: null,
    desc: 'A trio of hand-poured soy candles in hand-blown glass vessels. Fragrances: Fig & Cedar, White Tea, and Vetiver & Moss. 45-hour burn time each.'
  },
  {
    id: 12, name: 'Merino Pillow', category: 'home',
    price: 120, oldPrice: null, emoji: '🛏️',
    tag: null, sizes: null,
    desc: 'A 50×50cm cushion cover in superfine Merino wool with a concealed zip. The subtly textured weave adds warmth and depth to any interior.'
  },
];

// ─── STATE ────────────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('luxe_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('luxe_wish') || '[]');
let currentFilter = 'all';
let currentSort = 'default';
let filteredProducts = [...PRODUCTS];
let currentModal = null;

// ─── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateBadges();
  setupScrollHeader();
  animateOnScroll();
});

// ─── SCROLL HEADER ────────────────────────────────────────────────
function setupScrollHeader() {
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });
}

// ─── SCROLL ANIMATIONS ────────────────────────────────────────────
function animateOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.cat-card, .newsletter-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ─── RENDER PRODUCTS ──────────────────────────────────────────────
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');

  const items = getFiltered();
  grid.innerHTML = '';

  if (items.length === 0) {
    empty.style.display = 'flex';
    empty.style.flexDirection = 'column';
    empty.style.alignItems = 'center';
    return;
  }
  empty.style.display = 'none';

  items.forEach((p, i) => {
    const inWish = wishlist.includes(p.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <div class="product-img-wrap" onclick="openModal(${p.id})">
        ${p.tag ? `<div class="product-tag ${p.tag}">${p.tag}</div>` : ''}
        <div class="product-img-placeholder">${p.emoji}</div>
        <div class="product-actions">
          <button class="action-btn add-cart" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
          <button class="action-btn add-wish ${inWish ? 'wished' : ''}" onclick="event.stopPropagation(); toggleWishlistItem(${p.id}, this)" title="Wishlist">
            ${inWish ? '♥' : '♡'}
          </button>
        </div>
      </div>
      <div class="product-info" onclick="openModal(${p.id})">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price-row">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          ${p.oldPrice ? `<span class="product-price-old">$${p.oldPrice.toFixed(2)}</span>` : ''}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function getFiltered() {
  let items = currentFilter === 'all'
    ? [...PRODUCTS]
    : PRODUCTS.filter(p => p.category === currentFilter);

  if (document.getElementById('search-input') &&
      document.getElementById('search-input').value.trim()) {
    const q = document.getElementById('search-input').value.trim().toLowerCase();
    items = items.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  }

  switch (currentSort) {
    case 'price-asc':  items.sort((a, b) => a.price - b.price); break;
    case 'price-desc': items.sort((a, b) => b.price - a.price); break;
    case 'name':       items.sort((a, b) => a.name.localeCompare(b.name)); break;
  }

  return items;
}

// ─── FILTER & SORT ────────────────────────────────────────────────
function filterProducts(cat) {
  currentFilter = cat;
  const titles = { all: 'All Products', clothing: 'Clothing', accessories: 'Accessories', home: 'Home' };
  document.getElementById('section-title').textContent = titles[cat];

  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === cat || (cat === 'all' && btn.textContent === 'All'));
  });

  renderProducts();
  scrollToProducts();
}

function sortProducts(val) {
  currentSort = val;
  renderProducts();
}

function searchProducts() {
  renderProducts();
}

// ─── CART ─────────────────────────────────────────────────────────
function addToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  updateBadges();
  renderCartItems();
  showToast('Added to cart ✓');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateBadges();
  renderCartItems();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  saveCart();
  updateBadges();
  renderCartItems();
}

function renderCartItems() {
  const el = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  if (cart.length === 0) {
    el.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
    totalEl.textContent = '$0.00';
    return;
  }

  let total = 0;
  el.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    total += p.price * item.qty;
    return `
      <div class="cart-item">
        <div class="cart-item-emoji">${p.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">$${(p.price * item.qty).toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${p.id}, +1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${p.id})">×</button>
        </div>
      </div>
    `;
  }).join('');

  totalEl.textContent = '$' + total.toFixed(2);
}

function saveCart() {
  localStorage.setItem('luxe_cart', JSON.stringify(cart));
}

// ─── WISHLIST ─────────────────────────────────────────────────────
function toggleWishlistItem(id, btn) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(x => x !== id);
    if (btn) { btn.textContent = '♡'; btn.classList.remove('wished'); }
    showToast('Removed from wishlist');
  } else {
    wishlist.push(id);
    if (btn) { btn.textContent = '♥'; btn.classList.add('wished'); }
    showToast('Saved to wishlist ♥');
  }
  localStorage.setItem('luxe_wish', JSON.stringify(wishlist));
  updateBadges();
  renderWishlistItems();
}

function renderWishlistItems() {
  const el = document.getElementById('wishlist-items');
  if (wishlist.length === 0) {
    el.innerHTML = '<div class="empty-cart">Your wishlist is empty.</div>';
    return;
  }
  el.innerHTML = wishlist.map(id => {
    const p = PRODUCTS.find(x => x.id === id);
    return `
      <div class="cart-item">
        <div class="cart-item-emoji">${p.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">$${p.price.toFixed(2)}</div>
        </div>
        <button class="action-btn add-cart" style="font-size:10px;padding:8px 12px;white-space:nowrap" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="remove-btn" onclick="toggleWishlistItem(${p.id})">×</button>
      </div>
    `;
  }).join('');
}

// ─── BADGES ───────────────────────────────────────────────────────
function updateBadges() {
  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);
  const wishCount = wishlist.length;

  const cartBadge = document.getElementById('cart-badge');
  const wishBadge = document.getElementById('wishlist-badge');

  cartBadge.textContent = cartCount;
  wishBadge.textContent = wishCount;
  cartBadge.classList.toggle('visible', cartCount > 0);
  wishBadge.classList.toggle('visible', wishCount > 0);
}

// ─── TOGGLES ──────────────────────────────────────────────────────
function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const wishSidebar = document.getElementById('wishlist-sidebar');
  const overlay = document.getElementById('overlay');
  const isOpen = sidebar.classList.contains('open');

  wishSidebar.classList.remove('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('visible', !isOpen);

  if (!isOpen) renderCartItems();
}

function toggleWishlist() {
  const sidebar = document.getElementById('wishlist-sidebar');
  const cartSidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('overlay');
  const isOpen = sidebar.classList.contains('open');

  cartSidebar.classList.remove('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('visible', !isOpen);

  if (!isOpen) renderWishlistItems();
}

function toggleSearch() {
  const bar = document.getElementById('search-bar');
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) {
    setTimeout(() => document.getElementById('search-input').focus(), 50);
  } else {
    document.getElementById('search-input').value = '';
    renderProducts();
  }
}

function closeAll() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('wishlist-sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('visible');
}

// ─── PRODUCT MODAL ────────────────────────────────────────────────
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  currentModal = p;

  const body = document.getElementById('modal-body');
  const inWish = wishlist.includes(p.id);

  body.innerHTML = `
    <div class="modal-img-wrap">${p.emoji}</div>
    <div class="modal-info">
      <div class="modal-category">${p.category}</div>
      <h2 class="modal-name">${p.name}</h2>
      <div class="modal-price">
        $${p.price.toFixed(2)}
        ${p.oldPrice ? `<span class="modal-price-old">$${p.oldPrice.toFixed(2)}</span>` : ''}
      </div>
      <p class="modal-desc">${p.desc}</p>
      ${p.sizes ? `
      <div class="modal-sizes">
        <label>Select Size</label>
        <div class="size-options">
          ${p.sizes.map(s => `<button class="size-btn" onclick="selectSize(this)">${s}</button>`).join('')}
        </div>
      </div>` : ''}
      <div class="modal-actions">
        <button class="modal-add-cart" onclick="addToCart(${p.id}); closeModal()">Add to Cart</button>
        <button class="modal-wish-btn" onclick="toggleWishlistItem(${p.id}, null); updateModalWish(this, ${p.id})">${inWish ? '♥' : '♡'}</button>
      </div>
    </div>
  `;

  document.getElementById('modal-overlay').classList.add('visible');
  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('visible');
  document.getElementById('product-modal').classList.remove('open');
  document.body.style.overflow = '';
  currentModal = null;
  renderProducts(); // refresh wish states on cards
}

function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function updateModalWish(btn, id) {
  btn.textContent = wishlist.includes(id) ? '♥' : '♡';
}

// ─── NEWSLETTER ───────────────────────────────────────────────────
function subscribeNewsletter() {
  const input = document.getElementById('email-input');
  const msg   = document.getElementById('newsletter-msg');
  const val   = input.value.trim();

  if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    msg.style.color = 'var(--red)';
    msg.textContent = 'Please enter a valid email address.';
    return;
  }

  msg.style.color = 'var(--accent2)';
  msg.textContent = '✓ Thank you! You\'re on the list.';
  input.value = '';
  setTimeout(() => msg.textContent = '', 4000);
}

// ─── CHECKOUT ─────────────────────────────────────────────────────
function checkout() {
  if (cart.length === 0) {
    showToast('Your cart is empty');
    return;
  }
  const total = cart.reduce((sum, i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return sum + p.price * i.qty;
  }, 0);

  closeAll();
  showToast(`Order placed! Total: $${total.toFixed(2)} ✓`);
  cart = [];
  saveCart();
  updateBadges();
  renderCartItems();
}

// ─── TOAST ────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ─── UTILS ────────────────────────────────────────────────────────
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToProducts() {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Keyboard: Escape closes
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('product-modal').classList.contains('open')) closeModal();
    else closeAll();
  }
});