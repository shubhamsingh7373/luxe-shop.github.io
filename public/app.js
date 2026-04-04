// ===== LUXE SHOP — Frontend Application =====
const API = '';
const CURRENCY = '₹';
function fmt(n) { return CURRENCY + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
let currentUser = null;
let currentPage = 'home';

// ===== PAGE LOAD ANIMATION =====
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    setTimeout(() => {
      preloader.remove();
      document.body.classList.add('animate-entrance');
    }, 600);
  } else {
    document.body.classList.add('animate-entrance');
  }
});

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    currentUser = JSON.parse(user);
    updateCartBadge();
  }
  updateUserMenu();
  navigate('home');

  // Header scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('mainHeader').classList.toggle('scrolled', window.scrollY > 50);
  });
});

// ===== API Helper =====
async function api(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// ===== Navigation =====
function navigate(page, params = {}) {
  currentPage = page;
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const main = document.getElementById('mainContent');
  main.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  switch (page) {
    case 'home': renderHome(); break;
    case 'shop': renderShop(params); break;
    case 'categories': renderCategories(); break;
    case 'deals': renderShop({ featured: '1' }); break;
    case 'product': renderProduct(params.slug); break;
    case 'cart': renderCart(); break;
    case 'checkout': renderCheckout(); break;
    case 'wishlist': renderWishlist(); break;
    case 'orders': renderOrders(); break;
    case 'admin': renderAdmin(); break;
    default: renderHome();
  }
}

// ===== HOME PAGE =====
async function renderHome() {
  try {
    const [featured, cats] = await Promise.all([
      api('/api/products?featured=1&limit=8'),
      api('/api/categories')
    ]);
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <section class="hero fade-in">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <div class="hero-badge"><i class="fas fa-sparkles"></i> New Collection 2026</div>
              <h1>Discover <span class="highlight">Premium</span> Products for Your Lifestyle</h1>
              <p class="hero-desc">Curated collections of the finest electronics, fashion, and home essentials. Experience shopping like never before.</p>
              <div class="hero-actions">
                <button class="btn btn-primary" onclick="navigate('shop')"><i class="fas fa-shopping-bag"></i> Shop Now</button>
                <button class="btn btn-secondary" onclick="navigate('categories')"><i class="fas fa-th-large"></i> Browse Categories</button>
              </div>
              <div class="hero-stats">
                <div class="hero-stat"><h3>20+</h3><p>Premium Products</p></div>
                <div class="hero-stat"><h3>6</h3><p>Categories</p></div>
                <div class="hero-stat"><h3>4.8★</h3><p>Avg Rating</p></div>
              </div>
            </div>
            <div class="hero-visual">
              <div class="hero-image-wrapper">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600" alt="LUXE Shop">
                <div class="hero-float-card card-1">
                  <div class="float-card-label">Trending</div>
                  <div class="float-card-value">🔥 50% Off</div>
                </div>
                <div class="hero-float-card card-2">
                  <div class="float-card-label">Rating</div>
                  <div class="float-card-value"><i class="fas fa-star"></i> 4.9/5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-header">
            <div class="subtitle"><i class="fas fa-fire"></i> Featured Products</div>
            <h2>Trending Right Now</h2>
            <p>Handpicked products that our customers love</p>
          </div>
          <div class="products-grid">${featured.products.map(p => productCard(p)).join('')}</div>
          <div style="text-align:center;margin-top:40px">
            <button class="btn btn-outline" onclick="navigate('shop')">View All Products <i class="fas fa-arrow-right"></i></button>
          </div>
        </div>
      </section>

      <section class="section" style="background:var(--bg-secondary)">
        <div class="container">
          <div class="section-header">
            <div class="subtitle"><i class="fas fa-th-large"></i> Categories</div>
            <h2>Shop by Category</h2>
          </div>
          <div class="categories-grid">${cats.map(c => `
            <div class="category-card" onclick="navigate('shop', {category:'${c.slug}'})">
              <img src="${c.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}" alt="${c.name}" loading="lazy">
              <div class="category-overlay">
                <h3>${c.name}</h3>
                <p>${c.product_count} Products</p>
              </div>
            </div>`).join('')}</div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-header">
            <div class="subtitle"><i class="fas fa-shield-alt"></i> Why Choose Us</div>
            <h2>The LUXE Difference</h2>
          </div>
          <div class="features-grid">
            <div class="feature-card"><div class="feature-icon"><i class="fas fa-truck"></i></div><h3>Free Shipping</h3><p>On all orders over ₹4,999</p></div>
            <div class="feature-card"><div class="feature-icon"><i class="fas fa-undo"></i></div><h3>Easy Returns</h3><p>30-day return policy</p></div>
            <div class="feature-card"><div class="feature-icon"><i class="fas fa-lock"></i></div><h3>Secure Checkout</h3><p>SSL encrypted payments</p></div>
            <div class="feature-card"><div class="feature-icon"><i class="fas fa-headset"></i></div><h3>24/7 Support</h3><p>Always here to help<br>Order Details: 9709775024</p></div>
          </div>
        </div>
      </section>`;
  } catch (err) { showError(err.message); }
}

// ===== PRODUCT CARD =====
function productCard(p) {
  const discount = p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
  const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
  return `
    <div class="product-card" onclick="navigate('product', {slug:'${p.slug}'})">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-badges">
          ${discount > 0 ? `<span class="product-badge sale">-${discount}%</span>` : ''}
          ${p.featured ? `<span class="product-badge hot">Hot</span>` : ''}
        </div>
        <div class="product-actions-overlay">
          <button onclick="event.stopPropagation();addToCart(${p.id})" title="Add to Cart"><i class="fas fa-shopping-bag"></i></button>
          <button onclick="event.stopPropagation();toggleWishlist(${p.id})" title="Wishlist"><i class="fas fa-heart"></i></button>
          <button onclick="event.stopPropagation();navigate('product',{slug:'${p.slug}'})" title="View"><i class="fas fa-eye"></i></button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category_name || ''}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating"><span class="stars">${stars}</span><span class="count">(${p.review_count})</span></div>
        <div class="product-price">
          <span class="current">${fmt(p.price)}</span>
          ${p.compare_price > p.price ? `<span class="original">${fmt(p.compare_price)}</span>` : ''}
          ${discount > 0 ? `<span class="discount">Save ${discount}%</span>` : ''}
        </div>
      </div>
    </div>`;
}

// ===== SHOP PAGE =====
async function renderShop(params = {}) {
  try {
    const cats = await api('/api/categories');
    const query = new URLSearchParams({ limit: 12, ...params }).toString();
    const data = await api(`/api/products?${query}`);
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="section fade-in"><div class="container">
        <div class="shop-header">
          <div><h1>${params.featured === '1' ? '🔥 Hot Deals' : params.category ? cats.find(c=>c.slug===params.category)?.name || 'Shop' : 'All Products'}</h1>
          <span class="results-count">${data.pagination.total} products found</span></div>
          <select class="sort-select" onchange="navigate('shop',{...${JSON.stringify(params)}, sort:this.value.split('-')[0], order:this.value.split('-')[1]})">
            <option value="">Sort By</option><option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option><option value="rating-desc">Top Rated</option>
            <option value="created_at-desc">Newest</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px">
          <button class="btn btn-sm ${!params.category ? 'btn-primary' : 'btn-secondary'}" onclick="navigate('shop')">All</button>
          ${cats.map(c => `<button class="btn btn-sm ${params.category===c.slug ? 'btn-primary' : 'btn-secondary'}" onclick="navigate('shop',{category:'${c.slug}'})">${c.name}</button>`).join('')}
        </div>
        ${data.products.length ? `
          <div class="products-grid">${data.products.map(p => productCard(p)).join('')}</div>
          ${data.pagination.pages > 1 ? `<div class="pagination">${Array.from({length: data.pagination.pages}, (_, i) => `<button class="${i+1 === data.pagination.page ? 'active' : ''}" onclick="navigate('shop',{...${JSON.stringify(params)}, page:${i+1}})">${i+1}</button>`).join('')}</div>` : ''}
        ` : '<div class="empty-state"><i class="fas fa-search"></i><h3>No products found</h3><p>Try adjusting your filters</p></div>'}
      </div></div>`;
  } catch (err) { showError(err.message); }
}

// ===== PRODUCT DETAIL =====
async function renderProduct(slug) {
  try {
    const p = await api(`/api/products/${slug}`);
    const discount = p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
    const stockClass = p.stock > 10 ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-of-stock';
    const stockText = p.stock > 10 ? 'In Stock' : p.stock > 0 ? `Only ${p.stock} left` : 'Out of Stock';
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="product-detail fade-in"><div class="container">
        <div class="detail-grid">
          <div class="detail-image"><img src="${p.image}" alt="${p.name}"></div>
          <div class="detail-info">
            <div class="product-category">${p.category_name || ''}</div>
            <h1>${p.name}</h1>
            <div class="detail-rating">
              <span class="stars" style="color:var(--gold)">${'★'.repeat(Math.floor(p.rating))}${p.rating%1>=0.5?'½':''}</span>
              <span class="count">${p.rating} (${p.review_count} reviews)</span>
            </div>
            <div class="detail-price">
              <span class="current">${fmt(p.price)}</span>
              ${p.compare_price > p.price ? `<span class="original">${fmt(p.compare_price)}</span><span class="save">Save ${discount}%</span>` : ''}
            </div>
            <p class="detail-desc">${p.description}</p>
            <div class="detail-actions">
              <button class="btn btn-primary" onclick="addToCart(${p.id})" ${p.stock===0?'disabled':''}><i class="fas fa-shopping-bag"></i> Add to Cart</button>
              <button class="btn btn-secondary" onclick="toggleWishlist(${p.id})" title="Wishlist"><i class="fas fa-heart"></i></button>
              <button class="btn btn-outline" onclick="toggle360View()"><i class="fas fa-sync-alt"></i> 360° View</button>
            </div>
            <div class="detail-meta">
              <div class="meta-item"><i class="fas fa-box"></i> Availability: <span class="stock-badge ${stockClass}">${stockText}</span></div>
              <div class="meta-item"><i class="fas fa-truck"></i> Free shipping on orders over ₹4,999</div>
              <div class="meta-item"><i class="fas fa-undo"></i> 30-day easy returns</div>
            </div>
          </div>
        </div>

        ${p.related && p.related.length ? `
          <div class="section" style="padding-top:60px">
            <div class="section-header"><h2>You May Also Like</h2></div>
            <div class="products-grid">${p.related.map(r => productCard(r)).join('')}</div>
          </div>` : ''}

        <div class="reviews-section">
          <h2>Customer Reviews (${p.reviews?.length || 0})</h2>
          ${currentUser ? `
            <div style="margin-bottom:24px">
              <div class="form-group"><label>Your Rating</label>
                <div id="ratingStars" style="font-size:1.5rem;color:var(--text-muted);cursor:pointer">${[1,2,3,4,5].map(i => `<span onclick="setRating(${i})" onmouseover="hoverRating(${i})" onmouseout="resetRating()">★</span>`).join('')}</div>
                <input type="hidden" id="reviewRating" value="0">
              </div>
              <div class="form-group"><textarea id="reviewComment" placeholder="Share your experience..." rows="3" style="width:100%;padding:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);outline:none;resize:vertical"></textarea></div>
              <button class="btn btn-primary btn-sm" onclick="submitReview(${p.id})">Submit Review</button>
            </div>` : '<p style="margin-bottom:20px;color:var(--text-muted)"><a href="#" onclick="openModal(\'authModal\')" style="color:var(--accent-light)">Sign in</a> to leave a review</p>'}
          ${(p.reviews || []).map(r => `
            <div class="review-card">
              <div class="review-header"><span class="review-user">${r.user_name}</span><span class="review-date">${new Date(r.created_at).toLocaleDateString()}</span></div>
              <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
              ${r.comment ? `<p class="review-text">${r.comment}</p>` : ''}
            </div>`).join('') || '<p style="color:var(--text-muted)">No reviews yet. Be the first!</p>'}
        </div>
      </div></div>`;
  } catch (err) { showError(err.message); }
}

let selectedRating = 0;
function setRating(n) { selectedRating = n; document.getElementById('reviewRating').value = n; updateStars(n); }
function hoverRating(n) { updateStars(n); }
function resetRating() { updateStars(selectedRating); }
function updateStars(n) {
  const stars = document.getElementById('ratingStars');
  if (!stars) return;
  [...stars.children].forEach((s, i) => s.style.color = i < n ? 'var(--gold)' : 'var(--text-muted)');
}
async function submitReview(productId) {
  const rating = parseInt(document.getElementById('reviewRating').value);
  const comment = document.getElementById('reviewComment').value;
  if (!rating) return showToast('Please select a rating', 'error');
  try {
    await api(`/api/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify({ rating, comment }) });
    showToast('Review submitted!', 'success');
    const slug = location.hash.split('/').pop();
    renderProduct(document.querySelector('.detail-info h1')?.textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-'));
  } catch (err) { showToast(err.message, 'error'); }
}

// ===== CATEGORIES PAGE =====
async function renderCategories() {
  try {
    const cats = await api('/api/categories');
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="section fade-in"><div class="container">
        <div class="section-header"><div class="subtitle"><i class="fas fa-th-large"></i> Browse</div><h2>All Categories</h2></div>
        <div class="categories-grid">${cats.map(c => `
          <div class="category-card" onclick="navigate('shop',{category:'${c.slug}'})">
            <img src="${c.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}" alt="${c.name}" loading="lazy">
            <div class="category-overlay"><h3>${c.name}</h3><p>${c.product_count} Products</p></div>
          </div>`).join('')}</div>
      </div></div>`;
  } catch (err) { showError(err.message); }
}

// ===== CART =====
async function renderCart() {
  if (!currentUser) { openModal('authModal'); return navigate('home'); }
  try {
    const cart = await api('/api/cart');
    const main = document.getElementById('mainContent');
    if (!cart.items.length) {
      main.innerHTML = `<div class="cart-page fade-in"><div class="container"><div class="empty-state"><i class="fas fa-shopping-bag"></i><h3>Your cart is empty</h3><p>Discover amazing products and add them to your cart</p><button class="btn btn-primary" onclick="navigate('shop')">Start Shopping</button></div></div></div>`;
      return;
    }
    const shipping = cart.total >= 4999 ? 0 : 499;
    const finalTotal = cart.total + shipping;
    main.innerHTML = `
      <div class="cart-page fade-in"><div class="container">
        <h1><i class="fas fa-shopping-bag"></i> Shopping Cart (${cart.count})</h1>
        <div class="cart-layout">
          <div class="cart-items">${cart.items.map(item => `
            <div class="cart-item">
              <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
              <div class="cart-item-info">
                <h3>${item.name}</h3>
                <div class="price">${fmt(item.price)}</div>
              </div>
              <div class="qty-controls">
                <button onclick="updateCartQty(${item.id}, ${item.quantity - 1})"><i class="fas fa-minus"></i></button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQty(${item.id}, ${item.quantity + 1})"><i class="fas fa-plus"></i></button>
              </div>
              <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fas fa-trash-alt"></i></button>
            </div>`).join('')}</div>
          <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-row"><span class="label">Subtotal</span><span>${fmt(cart.total)}</span></div>
            <div class="summary-row"><span class="label">Shipping</span><span>${shipping === 0 ? '<span style="color:var(--success)">FREE</span>' : fmt(shipping)}</span></div>
            ${shipping > 0 ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">Add ${fmt(4999-cart.total)} more for free shipping</p>` : ''}
            <div class="summary-row total"><span>Total</span><span>${fmt(finalTotal)}</span></div>
            <button class="btn btn-primary btn-full" style="margin-top:20px" onclick="navigate('checkout')"><i class="fas fa-lock"></i> Proceed to Checkout</button>
          </div>
        </div>
      </div></div>`;
  } catch (err) { showError(err.message); }
}

async function addToCart(productId) {
  if (!currentUser) { openModal('authModal'); return; }
  try {
    await api('/api/cart', { method: 'POST', body: JSON.stringify({ product_id: productId }) });
    showToast('Added to cart!', 'success');
    updateCartBadge();
  } catch (err) { showToast(err.message, 'error'); }
}
async function updateCartQty(id, qty) {
  try {
    if (qty < 1) { await api(`/api/cart/${id}`, { method: 'DELETE' }); }
    else { await api(`/api/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity: qty }) }); }
    renderCart(); updateCartBadge();
  } catch (err) { showToast(err.message, 'error'); }
}
async function removeFromCart(id) {
  try { await api(`/api/cart/${id}`, { method: 'DELETE' }); renderCart(); updateCartBadge(); showToast('Removed from cart', 'info'); }
  catch (err) { showToast(err.message, 'error'); }
}
async function updateCartBadge() {
  if (!currentUser) return;
  try {
    const cart = await api('/api/cart');
    const badge = document.getElementById('cartBadge');
    if (cart.count > 0) { badge.textContent = cart.count; badge.style.display = 'flex'; }
    else { badge.style.display = 'none'; }
  } catch {}
}

// ===== CHECKOUT =====
async function renderCheckout() {
  if (!currentUser) { openModal('authModal'); return navigate('home'); }
  try {
    const cart = await api('/api/cart');
    if (!cart.items.length) { navigate('cart'); return; }
    const shipping = cart.total >= 4999 ? 0 : 499;
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="cart-page fade-in"><div class="container">
        <h1><i class="fas fa-lock"></i> Secure Checkout</h1>
        <div class="cart-layout">
          <div class="checkout-form">
            <h3 style="margin-bottom:16px">Shipping Address</h3>
            <div class="form-row"><div class="form-group"><label>First Name</label><input id="shipFirst" required placeholder="John"></div><div class="form-group"><label>Last Name</label><input id="shipLast" required placeholder="Doe"></div></div>
            <div class="form-group"><label>Street Address</label><input id="shipAddress" required placeholder="123 Main St"></div>
            <div class="form-row"><div class="form-group"><label>City</label><input id="shipCity" required placeholder="Mumbai"></div><div class="form-group"><label>PIN Code</label><input id="shipZip" required placeholder="400001"></div></div>
            <div class="form-group"><label>Country</label><input id="shipCountry" value="India"></div>
            <h3 style="margin:24px 0 16px">Payment Method</h3>
            <div class="form-group"><label>Card Number</label><input placeholder="•••• •••• •••• ••••" maxlength="19"></div>
            <div class="form-row"><div class="form-group"><label>Expiry</label><input placeholder="MM/YY"></div><div class="form-group"><label>CVV</label><input placeholder="•••" maxlength="4"></div></div>
          </div>
          <div class="cart-summary">
            <h3>Order Summary</h3>
            ${cart.items.map(i => `<div class="summary-row"><span class="label">${i.name} × ${i.quantity}</span><span>${fmt(i.price*i.quantity)}</span></div>`).join('')}
            <div class="summary-row"><span class="label">Shipping</span><span>${shipping===0?'<span style="color:var(--success)">FREE</span>':fmt(shipping)}</span></div>
            <div class="summary-row total"><span>Total</span><span>${fmt(cart.total+shipping)}</span></div>
            <button class="btn btn-primary btn-full" style="margin-top:20px" onclick="placeOrder()"><i class="fas fa-check"></i> Place Order — ${fmt(cart.total+shipping)}</button>
          </div>
        </div>
      </div></div>`;
  } catch (err) { showError(err.message); }
}

async function placeOrder() {
  const addr = {
    name: `${document.getElementById('shipFirst')?.value || ''} ${document.getElementById('shipLast')?.value || ''}`.trim(),
    address: document.getElementById('shipAddress')?.value || '',
    city: document.getElementById('shipCity')?.value || '',
    zip: document.getElementById('shipZip')?.value || '',
    country: document.getElementById('shipCountry')?.value || 'India'
  };
  if (!addr.name || !addr.address || !addr.city) return showToast('Please fill in shipping address', 'error');
  try {
    const res = await api('/api/orders', { method: 'POST', body: JSON.stringify({ shipping_address: addr }) });
    showToast('🎉 Order placed successfully!', 'success');
    updateCartBadge();
    navigate('orders');
  } catch (err) { showToast(err.message, 'error'); }
}

// ===== WISHLIST =====
async function renderWishlist() {
  if (!currentUser) { openModal('authModal'); return navigate('home'); }
  try {
    const items = await api('/api/wishlist');
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="section fade-in"><div class="container">
        <div class="section-header"><h2><i class="fas fa-heart"></i> My Wishlist</h2></div>
        ${items.length ? `<div class="products-grid">${items.map(i => `
          <div class="product-card" onclick="navigate('product',{slug:'${i.slug}'})">
            <div class="product-image"><img src="${i.image}" alt="${i.name}" loading="lazy">
              <div class="product-actions-overlay">
                <button onclick="event.stopPropagation();addToCart(${i.product_id})" title="Add to Cart"><i class="fas fa-shopping-bag"></i></button>
                <button onclick="event.stopPropagation();toggleWishlist(${i.product_id})" title="Remove"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <div class="product-info">
              <div class="product-name">${i.name}</div>
              <div class="product-price"><span class="current">${fmt(i.price)}</span></div>
            </div>
          </div>`).join('')}</div>`
        : '<div class="empty-state"><i class="fas fa-heart"></i><h3>Wishlist is empty</h3><p>Save items you love for later</p><button class="btn btn-primary" onclick="navigate(\'shop\')">Discover Products</button></div>'}
      </div></div>`;
  } catch (err) { showError(err.message); }
}

async function toggleWishlist(productId) {
  if (!currentUser) { openModal('authModal'); return; }
  try {
    const res = await api(`/api/wishlist/check/${productId}`);
    if (res.in_wishlist) {
      await api(`/api/wishlist/${productId}`, { method: 'DELETE' });
      showToast('Removed from wishlist', 'info');
    } else {
      await api('/api/wishlist', { method: 'POST', body: JSON.stringify({ product_id: productId }) });
      showToast('Added to wishlist!', 'success');
    }
  } catch (err) { showToast(err.message, 'error'); }
}

// ===== ORDERS =====
async function renderOrders() {
  if (!currentUser) { openModal('authModal'); return navigate('home'); }
  try {
    const orders = await api('/api/orders');
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="section fade-in"><div class="container">
        <div class="section-header"><h2><i class="fas fa-box"></i> My Orders</h2></div>
        ${orders.length ? orders.map(o => `
          <div class="order-card">
            <div class="order-header">
              <span class="order-id">Order #${o.id}</span>
              <span class="order-status ${o.status}">${o.status}</span>
            </div>
            <div class="order-items">${o.items.map(i => `<div class="order-item-thumb"><img src="${i.image}" alt="${i.name}"></div>`).join('')}</div>
            <div class="order-footer">
              <span class="order-date">${new Date(o.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span>
              <span class="order-total">${fmt(o.total)}</span>
            </div>
          </div>`).join('')
        : '<div class="empty-state"><i class="fas fa-box-open"></i><h3>No orders yet</h3><p>Your order history will appear here</p><button class="btn btn-primary" onclick="navigate(\'shop\')">Start Shopping</button></div>'}
      </div></div>`;
  } catch (err) { showError(err.message); }
}

// ===== ADMIN =====
let adminTab = 'overview';

function buildAdminOverview(stats) {
  var html = '<div class="admin-grid">';
  html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-box"></i></div><div class="stat-value">'+stats.totalProducts+'</div><div class="stat-label">Products</div></div>';
  html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-shopping-cart"></i></div><div class="stat-value">'+stats.totalOrders+'</div><div class="stat-label">Orders</div></div>';
  html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-value">'+stats.totalUsers+'</div><div class="stat-label">Customers</div></div>';
  html += '<div class="stat-card"><div class="stat-icon"><i class="fas fa-rupee-sign"></i></div><div class="stat-value">'+fmt(stats.totalRevenue)+'</div><div class="stat-label">Revenue</div></div>';
  html += '</div>';
  html += '<h3 style="margin-bottom:16px;">Recent Orders</h3>';
  if (stats.recentOrders.length) {
    stats.recentOrders.forEach(function(o) {
      html += '<div class="order-card"><div class="order-header"><span class="order-id">Order #'+o.id+' — '+o.user_name+'</span><span class="order-status '+o.status+'">'+o.status+'</span></div><div class="order-footer"><span class="order-date">'+new Date(o.created_at).toLocaleDateString()+'</span><span class="order-total">'+fmt(o.total)+'</span></div></div>';
    });
  } else { html += '<p style="color:var(--text-muted)">No orders yet</p>'; }
  return html;
}

function buildAdminProducts(allProducts) {
  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h3><i class="fas fa-box"></i> All Products ('+allProducts.pagination.total+')</h3><button class="btn btn-primary btn-sm" onclick="showAddProductForm()"><i class="fas fa-plus"></i> Add Product</button></div>';
  html += '<div id="addProductArea"></div>';
  html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:2px solid var(--border);text-align:left"><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Image</th><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Product</th><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Price</th><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Stock</th><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Rating</th><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Actions</th></tr></thead><tbody>';
  allProducts.products.forEach(function(p) {
    var sc = p.stock > 10 ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-of-stock';
    html += '<tr style="border-bottom:1px solid var(--border)"><td style="padding:10px 8px"><img src="'+p.image+'" style="width:50px;height:50px;border-radius:8px;object-fit:cover"></td><td style="padding:10px 8px"><div style="font-weight:600">'+p.name+'</div><div style="font-size:0.75rem;color:var(--text-muted)">'+(p.category_name||'')+'</div></td><td style="padding:10px 8px;font-weight:600">'+fmt(p.price)+'</td><td style="padding:10px 8px"><span class="stock-badge '+sc+'">'+p.stock+'</span></td><td style="padding:10px 8px"><span style="color:var(--gold)">★</span> '+p.rating+'</td><td style="padding:10px 8px"><button class="btn btn-sm" style="color:var(--danger);padding:6px 10px" onclick="deleteProduct('+p.id+')"><i class="fas fa-trash-alt"></i></button></td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function buildAdminOrders(allOrders) {
  var html = '<h3 style="margin-bottom:20px"><i class="fas fa-shopping-cart"></i> All Orders ('+allOrders.length+')</h3>';
  if (allOrders.length) {
    allOrders.forEach(function(o) {
      var opts = ['pending','processing','shipped','delivered','cancelled'].map(function(s) {
        return '<option value="'+s+'" '+(o.status===s?'selected':'')+'>'+s.charAt(0).toUpperCase()+s.slice(1)+'</option>';
      }).join('');
      var items = o.items.map(function(i) {
        return '<div style="display:flex;align-items:center;gap:8px;padding:4px 10px;background:var(--bg-secondary);border-radius:6px;font-size:0.8rem"><img src="'+i.image+'" style="width:30px;height:30px;border-radius:4px;object-fit:cover"><span>'+i.name+' × '+i.quantity+'</span><span style="color:var(--accent-light);font-weight:600">'+fmt(i.price*i.quantity)+'</span></div>';
      }).join('');
      html += '<div class="order-card"><div class="order-header"><div><span class="order-id">Order #'+o.id+'</span><span style="color:var(--text-muted);font-size:0.85rem;margin-left:10px">'+o.user_name+' ('+o.user_email+')</span></div><div style="display:flex;align-items:center;gap:10px"><select style="padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:0.8rem" onchange="updateOrderStatus('+o.id+', this.value)">'+opts+'</select><span class="order-status '+o.status+'">'+o.status+'</span></div></div><div class="order-items" style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">'+items+'</div><div class="order-footer"><span class="order-date"><i class="fas fa-calendar"></i> '+new Date(o.created_at).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})+'</span><span class="order-total">'+fmt(o.total)+'</span></div></div>';
    });
  } else { html += '<div class="empty-state"><i class="fas fa-box-open"></i><h3>No orders yet</h3></div>'; }
  return html;
}

async function renderAdmin() {
  if (!currentUser || currentUser.role !== 'admin') { showToast('Admin access required', 'error'); return navigate('home'); }
  try {
    const stats = await api('/api/admin/stats');
    const allProducts = await api('/api/products?limit=100');
    const allOrders = await api('/api/orders/admin/all');
    const main = document.getElementById('mainContent');

    var tabsHtml = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:30px">';
    tabsHtml += '<button class="btn btn-sm '+(adminTab==='overview'?'btn-primary':'btn-secondary')+'" onclick="adminTab=\'overview\';renderAdmin()"><i class="fas fa-chart-bar"></i> Overview</button>';
    tabsHtml += '<button class="btn btn-sm '+(adminTab==='products'?'btn-primary':'btn-secondary')+'" onclick="adminTab=\'products\';renderAdmin()"><i class="fas fa-box"></i> Products</button>';
    tabsHtml += '<button class="btn btn-sm '+(adminTab==='orders'?'btn-primary':'btn-secondary')+'" onclick="adminTab=\'orders\';renderAdmin()"><i class="fas fa-shopping-cart"></i> Orders</button>';
    tabsHtml += '<button class="btn btn-sm '+(adminTab==='users'?'btn-primary':'btn-secondary')+'" onclick="adminTab=\'users\';renderAdmin()"><i class="fas fa-users"></i> Users</button>';
    tabsHtml += '</div>';

    var content = '';
    if (adminTab === 'overview') content = buildAdminOverview(stats);
    else if (adminTab === 'products') content = buildAdminProducts(allProducts);
    else if (adminTab === 'orders') content = buildAdminOrders(allOrders);
    else if (adminTab === 'users') content = '<h3 style="margin-bottom:20px"><i class="fas fa-users"></i> Registered Users</h3><div id="usersTable"><div class="loading"><div class="spinner"></div></div></div>';

    main.innerHTML = '<div class="section fade-in"><div class="container"><div class="section-header"><div class="subtitle"><i class="fas fa-shield-alt"></i> Admin Panel</div><h2>Dashboard</h2><p>Welcome back, '+currentUser.name+'</p></div>'+tabsHtml+content+'</div></div>';

    if (adminTab === 'users') loadAdminUsers();
  } catch (err) { showError(err.message); }
}

async function loadAdminUsers() {
  try {
    const res = await fetch('/api/admin/users', {headers:{'Authorization':'Bearer '+localStorage.getItem('token')}});
    const users = await res.json();
    var html = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:2px solid var(--border);text-align:left"><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">ID</th><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Name</th><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Email</th><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Role</th><th style="padding:12px 8px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase">Joined</th></tr></thead><tbody>';
    users.forEach(function(u) {
      var badge = u.role === 'admin' ? 'background:rgba(124,58,237,0.15);color:var(--accent-light)' : 'background:rgba(16,185,129,0.15);color:var(--success)';
      html += '<tr style="border-bottom:1px solid var(--border)"><td style="padding:10px 8px">#'+u.id+'</td><td style="padding:10px 8px;font-weight:600">'+u.name+'</td><td style="padding:10px 8px;color:var(--text-secondary)">'+u.email+'</td><td style="padding:10px 8px"><span style="padding:3px 10px;border-radius:50px;font-size:0.75rem;font-weight:600;'+badge+'">'+u.role+'</span></td><td style="padding:10px 8px;font-size:0.85rem;color:var(--text-muted)">'+new Date(u.created_at).toLocaleDateString()+'</td></tr>';
    });
    html += '</tbody></table></div>';
    document.getElementById('usersTable').innerHTML = html;
  } catch(e) { document.getElementById('usersTable').innerHTML = '<p style="color:var(--danger)">'+e.message+'</p>'; }
}

function showAddProductForm() {
  var area = document.getElementById('addProductArea');
  if (area.innerHTML) { area.innerHTML = ''; return; }
  area.innerHTML = '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:24px;margin-bottom:24px"><h4 style="margin-bottom:16px"><i class="fas fa-plus"></i> Add New Product</h4><div class="form-row"><div class="form-group"><label>Product Name</label><input id="apName" placeholder="e.g. Wireless Earbuds"></div><div class="form-group"><label>Price (₹)</label><input id="apPrice" type="number" placeholder="e.g. 4999"></div></div><div class="form-row"><div class="form-group"><label>Compare Price (₹)</label><input id="apCompare" type="number" placeholder="e.g. 6999"></div><div class="form-group"><label>Stock</label><input id="apStock" type="number" placeholder="e.g. 50"></div></div><div class="form-row"><div class="form-group"><label>Category ID (1-6)</label><input id="apCategory" type="number" placeholder="e.g. 1"></div><div class="form-group"><label>Image URL</label><input id="apImage" placeholder="https://..."></div></div><div class="form-group"><label>Description</label><textarea id="apDesc" rows="3" style="width:100%;padding:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);resize:vertical" placeholder="Product description..."></textarea></div><div style="display:flex;gap:10px"><button class="btn btn-primary btn-sm" onclick="addProduct()"><i class="fas fa-check"></i> Add Product</button><button class="btn btn-secondary btn-sm" onclick="document.getElementById(\'addProductArea\').innerHTML=\'\'">Cancel</button></div></div>';
}

async function addProduct() {
  const data = {
    name: document.getElementById('apName').value,
    price: parseFloat(document.getElementById('apPrice').value),
    compare_price: parseFloat(document.getElementById('apCompare').value) || 0,
    stock: parseInt(document.getElementById('apStock').value) || 0,
    category_id: parseInt(document.getElementById('apCategory').value) || 1,
    image: document.getElementById('apImage').value || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    description: document.getElementById('apDesc').value || ''
  };
  if (!data.name || !data.price) return showToast('Name and price are required', 'error');
  try {
    await api('/api/products', { method: 'POST', body: JSON.stringify(data) });
    showToast('Product added!', 'success');
    renderAdmin();
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try { await api('/api/products/' + id, { method: 'DELETE' }); showToast('Product deleted', 'info'); renderAdmin(); }
  catch (err) { showToast(err.message, 'error'); }
}

async function updateOrderStatus(orderId, status) {
  try { await api('/api/orders/' + orderId + '/status', { method: 'PUT', body: JSON.stringify({ status }) }); showToast('Order #' + orderId + ' → ' + status, 'success'); renderAdmin(); }
  catch (err) { showToast(err.message, 'error'); }
}

// ===== AUTH =====
function updateUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  if (currentUser) {
    dropdown.innerHTML = `
      <div style="padding:12px 14px;border-bottom:1px solid var(--border)">
        <div style="font-weight:700">${currentUser.name}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">${currentUser.email}</div>
      </div>
      <a href="#" onclick="navigate('orders');closeDropdown()"><i class="fas fa-box"></i> My Orders</a>
      <a href="#" onclick="navigate('wishlist');closeDropdown()"><i class="fas fa-heart"></i> Wishlist</a>
      ${currentUser.role === 'admin' ? '<a href="#" onclick="navigate(\'admin\');closeDropdown()"><i class="fas fa-shield-alt"></i> Admin Dashboard</a>' : ''}
      <div class="dropdown-divider"></div>
      <button onclick="logout()"><i class="fas fa-sign-out-alt"></i> Sign Out</button>`;
  } else {
    dropdown.innerHTML = `
      <a href="#" onclick="openModal('authModal');closeDropdown()"><i class="fas fa-sign-in-alt"></i> Sign In</a>
      <a href="#" onclick="openModal('authModal');switchAuthTab('register');closeDropdown()"><i class="fas fa-user-plus"></i> Create Account</a>`;
  }
}

let _forgotEmail = '';

function switchAuthTab(tab) {
  // Show/hide the normal tab buttons
  const tabsBar = document.querySelector('.auth-tabs');
  tabsBar.style.display = (tab === 'forgot' || tab === 'reset') ? 'none' : '';

  // Highlight active tab
  const tabs = document.querySelectorAll('.auth-tab');
  if (tabs[0]) tabs[0].classList.toggle('active', tab === 'login');
  if (tabs[1]) tabs[1].classList.toggle('active', tab === 'register');

  // Show/hide forms
  document.getElementById('loginForm').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('forgotForm').style.display   = tab === 'forgot'   ? 'block' : 'none';
  document.getElementById('resetForm').style.display    = tab === 'reset'    ? 'block' : 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: document.getElementById('loginEmail').value, password: document.getElementById('loginPassword').value })
    });
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    currentUser = res.user;
    updateUserMenu(); updateCartBadge();
    closeModal('authModal');
    showToast(`Welcome back, ${res.user.name}!`, 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function handleRegister(e) {
  e.preventDefault();
  try {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value
      })
    });
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    currentUser = res.user;
    updateUserMenu(); updateCartBadge();
    closeModal('authModal');
    showToast('Account created! Welcome!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function handleForgotRequest() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) return showToast('Please enter your email', 'error');
  const btn = document.querySelector('#forgotForm .btn-primary');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  try {
    const res = await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
    _forgotEmail = email;
    // Auto-fill the token for convenience (in production this would go via email)
    document.getElementById('resetToken').value = res.token;
    showToast(`Hi ${res.name}! Your reset code is ready.`, 'success');
    switchAuthTab('reset');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Code';
  }
}

async function handleResetPassword() {
  const token       = document.getElementById('resetToken').value.trim();
  const newPass     = document.getElementById('resetNewPassword').value;
  const confirmPass = document.getElementById('resetConfirmPassword').value;
  if (!token)     return showToast('Please enter the reset code', 'error');
  if (!newPass)   return showToast('Please enter a new password', 'error');
  if (newPass !== confirmPass) return showToast('Passwords do not match', 'error');
  if (newPass.length < 6)     return showToast('Password must be at least 6 characters', 'error');
  const btn = document.querySelector('#resetForm .btn-primary');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
  try {
    await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: _forgotEmail, token, newPassword: newPass })
    });
    showToast('Password reset successfully! Please sign in.', 'success');
    document.getElementById('resetToken').value = '';
    document.getElementById('resetNewPassword').value = '';
    document.getElementById('resetConfirmPassword').value = '';
    document.getElementById('forgotEmail').value = '';
    _forgotEmail = '';
    switchAuthTab('login');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-check-circle"></i> Reset Password';
  }
}


function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  updateUserMenu();
  document.getElementById('cartBadge').style.display = 'none';
  closeDropdown();
  showToast('Signed out successfully', 'info');
  navigate('home');
}

// ===== UI HELPERS =====
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function toggleUserMenu() { document.getElementById('userDropdown').classList.toggle('active'); }
function closeDropdown() { document.getElementById('userDropdown').classList.remove('active'); }
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('active');
  document.getElementById('mobileOverlay').classList.toggle('active');
}
function toggleSearch() {
  document.getElementById('searchBox').classList.toggle('active');
  if (document.getElementById('searchBox').classList.contains('active')) document.getElementById('searchInput').focus();
}
function handleSearch(e) { if (e.key === 'Enter') performSearch(); }
function performSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (q) { navigate('shop', { search: q }); toggleSearch(); }
}
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function showToast(message, type = 'info') {
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]}"></i><p>${message}</p>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function showError(msg) {
  document.getElementById('mainContent').innerHTML = `<div class="section"><div class="container"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Oops!</h3><p>${msg}</p><button class="btn btn-primary" onclick="navigate('home')">Go Home</button></div></div></div>`;
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu')) closeDropdown();
});

// ===== 360 DEGREE VIEW =====
function toggle360View() {
  const img = document.querySelector('.detail-image img');
  if (img) {
    img.classList.toggle('view-360-active');
    if (img.classList.contains('view-360-active')) {
      showToast('360° View Enabled', 'success');
    }
  }
}

// ===== TRANSLATE RESET =====
function clearTranslation() {
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname + ';';
  location.reload();
}

// ===== NEWSLETTER SUBSCRIPTION =====
async function handleNewsletter(e) {
  e.preventDefault();
  const input = document.getElementById('newsletterInput');
  const email = input.value;
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Successfully subscribed! Welcome!', 'success');
      input.value = '';
    } else {
      showToast(data.error || 'Failed to subscribe', 'error');
    }
  } catch(err) {
    showToast('Network error', 'error');
  }
}
