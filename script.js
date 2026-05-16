let allProducts = [];
let cart = {};
let currentPage = 'home';

// ==========================================
// 2. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Detect current page
    detectCurrentPage();
    
    // Initialize based on current page
    initializePage();
    
    // Update cart count on all pages
    updateCartCount();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
    
    // Initialize smooth scrolling
    initSmoothScroll();
});

// Detect which page we're on
function detectCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('products')) {
        currentPage = 'products';
    } else if (path.includes('cart')) {
        currentPage = 'cart';
    } else if (path.includes('checkout')) {
        currentPage = 'checkout';
    } else {
        currentPage = 'home';
    }
}

// Initialize page-specific functionality
function initializePage() {
    switch(currentPage) {
        case 'products':
            initProductsPage();
            break;
        case 'cart':
            initCartPage();
            break;
        case 'checkout':
            initCheckoutPage();
            break;
        case 'home':
            initHomePage();
            break;
    }
}

// ==========================================
// 3. NAVBAR FUNCTIONALITY
// ==========================================

// Navbar scroll effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Only prevent default if it's not just "#"
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ==========================================
// 4. CART MANAGEMENT
// ==========================================

// Load cart from session storage
function loadCart() {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error loading cart:', error);
            cart = {};
        }
    }
    return cart;
}

// Save cart to session storage
function saveCart() {
    try {
        sessionStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

// Update cart count badge
function updateCartCount() {
    loadCart();
    const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const cartCountElement = document.getElementById('cart-count');
    
    if (cartCountElement) {
        cartCountElement.textContent = count;
        
        // Add animation
        cartCountElement.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartCountElement.style.transform = 'scale(1)';
        }, 200);
    }
}

// Add item to cart
async function addToCart(productId, productName) {
    try {
        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Update local cart
            loadCart();
            if (cart[productId]) {
                cart[productId]++;
            } else {
                cart[productId] = 1;
            }
            saveCart();
            updateCartCount();
            
            showNotification(`${productName} added to cart!`, 'success');
            
            // Add visual feedback to button
            const buttons = document.querySelectorAll(`[onclick*="addToCart(${productId}"]`);
            buttons.forEach(button => {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check me-2"></i>Added!';
                button.disabled = true;
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 1500);
            });
        } else {
            showNotification(data.error || 'Failed to add to cart', 'danger');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('An error occurred. Please try again.', 'danger');
    }
}

// Update quantity in cart
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const product = allProducts.find(p => p.id == productId);
    
    if (product && newQuantity > product.stock) {
        showNotification(`Only ${product.stock} items available in stock`, 'warning');
        return;
    }

    loadCart();
    cart[productId] = newQuantity;
    saveCart();
    
    if (currentPage === 'cart') {
        displayCart();
    }
    
    updateCartCount();
}

// Remove item from cart
function removeFromCart(productId) {
    const product = allProducts.find(p => p.id == productId);
    const productName = product ? product.name : 'Item';
    
    loadCart();
    delete cart[productId];
    saveCart();
    
    if (currentPage === 'cart') {
        displayCart();
    }
    
    updateCartCount();
    showNotification(`${productName} removed from cart`, 'info');
}

// Clear entire cart
function clearCart() {
    cart = {};
    saveCart();
    updateCartCount();
    
    if (currentPage === 'cart') {
        displayCart();
    }
}

// ==========================================
// 5. HOME PAGE FUNCTIONALITY
// ==========================================

function initHomePage() {
    console.log('Home page initialized');
    
    // Add parallax effect to hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }
    
    // Animate stats on scroll
    animateStatsOnScroll();
}

// Animate stats when they come into view
function animateStatsOnScroll() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                animateValue(target, 0, parseInt(finalValue), 2000);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// Animate number counting
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// ==========================================
// 6. PRODUCTS PAGE FUNCTIONALITY
// ==========================================

function initProductsPage() {
    console.log('Products page initialized');
    loadProducts();
    
    // Initialize search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
        
        // Add debounced search on input
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length > 2 || this.value.length === 0) {
                    searchProducts();
                }
            }, 500);
        });
    }
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch('/products');
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showError();
    }
}

// Display products in grid
function displayProducts(products) {
    const container = document.getElementById('products-container');
    const countElement = document.getElementById('product-count');
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="no-products">
                    <i class="fas fa-box-open fa-5x text-muted mb-4"></i>
                    <h3>No products found</h3>
                    <p class="text-muted">Try adjusting your search criteria</p>
                    <button class="btn btn-primary mt-3" onclick="clearSearch()">
                        <i class="fas fa-redo me-2"></i>Clear Search
                    </button>
                </div>
            </div>
        `;
        if (countElement) {
            countElement.textContent = '0 products found';
        }
        return;
    }

    if (countElement) {
        countElement.textContent = `${products.length} product${products.length !== 1 ? 's' : ''} found`;
    }

    container.innerHTML = products.map(product => `
        <div class="col-md-6 col-lg-4 col-xl-3 fade-in">
            <div class="product-card">
                <img src="https://via.placeholder.com/300x250/667eea/ffffff?text=${encodeURIComponent(product.name)}" 
                     alt="${escapeHtml(product.name)}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/300x250/cccccc/ffffff?text=No+Image'">
                <div class="product-body">
                    <h5 class="product-title" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h5>
                    <p class="product-description" title="${escapeHtml(product.description)}">${escapeHtml(product.description)}</p>
                    <div class="product-footer">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="product-price">$${product.price.toFixed(2)}</span>
                            <span class="badge ${getStockBadgeClass(product.stock)} stock-badge">
                                ${getStockText(product.stock)}
                            </span>
                        </div>
                        <button class="btn btn-primary btn-add-cart" 
                                onclick="addToCart(${product.id}, '${escapeHtml(product.name)}')"
                                ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus me-2"></i>${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Get stock badge CSS class
function getStockBadgeClass(stock) {
    if (stock === 0) return 'bg-danger';
    if (stock <= 5) return 'bg-warning';
    return 'bg-success';
}

// Get stock text
function getStockText(stock) {
    if (stock === 0) return 'Out of stock';
    if (stock <= 5) return `Only ${stock} left`;
    return `${stock} in stock`;
}

// Search products
async function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    
    if (!query) {
        displayProducts(allProducts);
        return;
    }

    try {
        const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        displayProducts(results);
    } catch (error) {
        console.error('Error searching products:', error);
        showNotification('Error searching products', 'danger');
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        displayProducts(allProducts);
    }
}

// Show error state
function showError() {
    const container = document.getElementById('products-container');
    if (container) {
        container.innerHTML = `
            <div class="col-12">
                <div class="no-products">
                    <i class="fas fa-exclamation-triangle fa-5x text-danger mb-4"></i>
                    <h3>Error Loading Products</h3>
                    <p class="text-muted">Please try again later</p>
                    <button class="btn btn-primary mt-3" onclick="loadProducts()">
                        <i class="fas fa-redo me-2"></i>Retry
                    </button>
                </div>
            </div>
        `;
    }
}

// ==========================================
// 7. CART PAGE FUNCTIONALITY
// ==========================================

function initCartPage() {
    console.log('Cart page initialized');
    loadProducts().then(() => {
        displayCart();
    });
}

// Display cart items
function displayCart() {
    const container = document.getElementById('cart-items-container');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!container) return;
    
    loadCart();

    if (Object.keys(cart).length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p class="text-muted mb-4">Add some products to get started!</p>
                <a href="/products" class="btn btn-primary btn-lg">
                    <i class="fas fa-shopping-bag me-2"></i>Browse Products
                </a>
            </div>
        `;
        if (checkoutBtn) {
            checkoutBtn.style.display = 'none';
        }
        updateCartSummary(0);
        return;
    }

    if (checkoutBtn) {
        checkoutBtn.style.display = 'block';
    }

    let html = '';
    let subtotal = 0;

    Object.entries(cart).forEach(([productId, quantity]) => {
        const product = allProducts.find(p => p.id == productId);
        if (product) {
            const itemTotal = product.price * quantity;
            subtotal += itemTotal;

            html += `
                <div class="cart-item">
                    <img src="https://via.placeholder.com/100/667eea/ffffff?text=${encodeURIComponent(product.name.substring(0, 2))}" 
                         alt="${escapeHtml(product.name)}" 
                         class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${escapeHtml(product.name)}</div>
                        <div class="text-muted small mb-2">${escapeHtml(product.description)}</div>
                        <div class="cart-item-price">$${product.price.toFixed(2)}</div>
                    </div>
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${productId}, ${quantity - 1})" 
                                title="Decrease quantity">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${productId}, ${quantity + 1})" 
                                title="Increase quantity"
                                ${quantity >= product.stock ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="ms-4">
                        <strong>$${itemTotal.toFixed(2)}</strong>
                    </div>
                    <div class="ms-3">
                        <i class="fas fa-trash-alt fa-lg remove-btn" 
                           onclick="removeFromCart(${productId})" 
                           title="Remove from cart"></i>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
    updateCartSummary(subtotal);
}

// Update cart summary
function updateCartSummary(subtotal) {
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// ==========================================
// 8. CHECKOUT PAGE FUNCTIONALITY
// ==========================================

function initCheckoutPage() {
    console.log('Checkout page initialized');
    
    loadProducts().then(() => {
        loadCart();
        
        // Check if cart is empty
        if (Object.keys(cart).length === 0) {
            window.location.href = '/cart';
            return;
        }
        
        displayOrderSummary();
        initCheckoutForm();
    });
}

// Display order summary
function displayOrderSummary() {
    const itemsContainer = document.getElementById('order-items');
    if (!itemsContainer) return;
    
    let subtotal = 0;
    let html = '';

    Object.entries(cart).forEach(([productId, quantity]) => {
        const product = allProducts.find(p => p.id == productId);
        if (product) {
            const itemTotal = product.price * quantity;
            subtotal += itemTotal;

            html += `
                <div class="order-item">
                    <div class="order-item-name">
                        ${escapeHtml(product.name)} × ${quantity}
                    </div>
                    <div>$${itemTotal.toFixed(2)}</div>
                </div>
            `;
        }
    });

    itemsContainer.innerHTML = html;

    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTax = document.getElementById('summary-tax');
    const summaryTotal = document.getElementById('summary-total');

    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (summaryTax) summaryTax.textContent = `$${tax.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `$${total.toFixed(2)}`;
}

// Initialize checkout form
function initCheckoutForm() {
    const form = document.getElementById('orderForm');
    if (!form) return;
    
    form.addEventListener('submit', handleCheckout);
    
    // Add real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Validate form field
function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
        field.classList.add('is-invalid');
        return false;
    } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        return true;
    }
}

// Handle checkout form submission
async function handleCheckout(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    // Disable submit button
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;

    const fullAddress = `${address}, ${city}, ${state} ${zip}`;
    const fullName = `${firstName} ${lastName}`;

    try {
        const response = await fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: fullName,
                address: fullAddress,
                phone: phone
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Clear cart
            clearCart();

            // Show success message
            document.getElementById('checkout-form').style.display = 'none';
            const successMessage = document.getElementById('success-message');
            successMessage.classList.add('show');
            
            document.getElementById('order-id').textContent = `#${data.order.order_id}`;
            document.getElementById('order-total').textContent = `$${data.order.total.toFixed(2)}`;

            // Update step indicator
            document.querySelectorAll('.step').forEach(step => {
                step.classList.add('completed');
            });

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Confetti effect (optional)
            showConfetti();
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            showNotification(data.error || 'Checkout failed. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showNotification('An error occurred during checkout', 'danger');
    }
}

// Select payment method
function selectPayment(element) {
    document.querySelectorAll('.payment-method').forEach(pm => {
        pm.classList.remove('selected');
    });
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
}

// Show confetti effect (simple version)
function showConfetti() {
    // Create simple confetti effect with emojis
    const confettiCount = 50;
    const confettiChars = ['🎉', '🎊', '✨', '🎈', '🎁'];
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.textContent = confettiChars[Math.floor(Math.random() * confettiChars.length)];
            confetti.style.cssText = `
                position: fixed;
                top: -50px;
                left: ${Math.random() * 100}%;
                font-size: ${Math.random() * 20 + 20}px;
                z-index: 9999;
                pointer-events: none;
                animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }
}

// Add confetti animation to CSS dynamically
if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// 9. NOTIFICATION SYSTEM
// ==========================================

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.toast-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show toast-notification shadow-lg`;
    
    const iconMap = {
        success: 'fa-check-circle',
        danger: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${iconMap[type] || 'fa-info-circle'} me-2"></i>
        <span>${escapeHtml(message)}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ==========================================
// 10. UTILITY FUNCTIONS
// ==========================================

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ==========================================
// 11. ERROR HANDLING
// ==========================================

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    // You can add error reporting here
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // You can add error reporting here
});

// ==========================================
// 12. PERFORMANCE OPTIMIZATION
// ==========================================

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ==========================================
// 13. ACCESSIBILITY ENHANCEMENTS
// ==========================================

// Add keyboard navigation for cart items
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modals or notifications
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        });
    }
});

// ==========================================
// 14. THEME TOGGLE (OPTIONAL)
// ==========================================

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// ==========================================
// 15. EXPORT FOR CONSOLE DEBUGGING
// ==========================================

// Make functions available in console for debugging
window.shopHub = {
    cart,
    allProducts,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadProducts,
    searchProducts,
    showNotification
};

console.log('ShopHub E-Commerce initialized. Access debugging functions via window.shopHub');