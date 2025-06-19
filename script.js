// Shopping Cart functionality
class ShoppingCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("cart")) || [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateCartCount();
    this.bindFAQEvents();
    this.bindFormEvents();
  }

  bindEvents() {
    // Mobile menu toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const menuClose = document.querySelector(".menu-close");
    const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");

    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        mobileMenuOverlay.classList.toggle("active");
        document.body.classList.toggle("no-scroll");
      });
    }

    if (menuClose) {
      menuClose.addEventListener("click", () => {
        this.closeMobileMenu();
      });
    }

    // Close mobile menu when clicking on overlay
    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener("click", (e) => {
        if (e.target === mobileMenuOverlay) {
          this.closeMobileMenu();
        }
      });
    }

    // Cart toggle
    const cartToggle = document.getElementById("cart-toggle");
    const cartClose = document.getElementById("cart-close");
    const cartOverlay = document.getElementById("cart-overlay");

    if (cartToggle) {
      cartToggle.addEventListener("click", () => {
        this.openCart();
      });
    }

    if (cartClose) {
      cartClose.addEventListener("click", () => {
        this.closeCart();
      });
    }

    // Close cart when clicking on overlay
    if (cartOverlay) {
      cartOverlay.addEventListener("click", (e) => {
        if (e.target === cartOverlay) {
          this.closeCart();
        }
      });
    }

    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const productElement = button.closest("[data-product]");
        if (productElement) {
          const productData = JSON.parse(productElement.dataset.product);
          this.addToCart(productData);
        }
      });
    });

    // Category cards navigation
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "catalog.html";
      });
    });

    // Continue shopping links
    const continueShoppingLinks =
      document.querySelectorAll(".continue-shopping");
    continueShoppingLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.closeCart();
        if (link.getAttribute("href") === "catalog.html") {
          window.location.href = "catalog.html";
        }
      });
    });

    // Newsletter form
    const newsletterForm = document.querySelector(".newsletter-form");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        this.showNotification(
          "Дякуємо за підписку! Перевірте свою електронну пошту.",
          "success"
        );
        newsletterForm.reset();
      });
    }

    // Keyboard events
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeMobileMenu();
        this.closeCart();
      }
    });

    // Filters functionality (for catalog page)
    this.bindFilterEvents();
  }

  bindFilterEvents() {
    // Filter checkboxes
    const filterCheckboxes = document.querySelectorAll(
      '.filter-option input[type="checkbox"], .color-filter input[type="checkbox"]'
    );
    filterCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.applyFilters();
      });
    });

    // Price range slider
    const priceSlider = document.querySelector(".price-slider");
    if (priceSlider) {
      priceSlider.addEventListener("input", () => {
        this.updatePriceDisplay();
        this.applyFilters();
      });
    }

    // Sort dropdown
    const sortSelect = document.querySelector(".sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        this.sortProducts();
      });
    }

    // Reset filters
    const resetButton = document.querySelector(".filters-reset");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        this.resetFilters();
      });
    }
  }

  bindFAQEvents() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      question.addEventListener("click", () => {
        // Close other open items
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("active");
          }
        });

        // Toggle current item
        item.classList.toggle("active");
      });
    });
  }

  bindFormEvents() {
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Validate required fields
        if (!data.name || !data.email || !data.message || !data.privacy) {
          this.showNotification(
            "Будь ласка, заповніть всі обов'язкові поля та погодьтеся з політикою конфіденційності.",
            "error"
          );
          return;
        }

        // Simulate form submission
        this.showNotification(
          "Ваше повідомлення відправлено! Ми зв'яжемося з вами найближчим часом.",
          "success"
        );
        // contactForm.reset();
      });
    }
  }

  applyFilters() {
    const products = document.querySelectorAll(".product-card");
    const categoryFilters = Array.from(
      document.querySelectorAll('input[name="category"]:checked')
    ).map((cb) => cb.value);
    const sizeFilters = Array.from(
      document.querySelectorAll('input[name="size"]:checked')
    ).map((cb) => cb.value);
    const colorFilters = Array.from(
      document.querySelectorAll('input[name="color"]:checked')
    ).map((cb) => cb.value);
    const priceSlider = document.querySelector(".price-slider");
    const maxPrice = priceSlider ? parseInt(priceSlider.value) : 1000;

    let visibleCount = 0;

    products.forEach((product) => {
      const productData = JSON.parse(product.dataset.product);
      let shouldShow = true;

      // Category filter
      if (
        categoryFilters.length > 0 &&
        !categoryFilters.includes(productData.category)
      ) {
        shouldShow = false;
      }

      // Size filter
      if (sizeFilters.length > 0 && productData.sizes) {
        const hasMatchingSize = sizeFilters.some((size) =>
          productData.sizes.includes(size)
        );
        if (!hasMatchingSize) {
          shouldShow = false;
        }
      }

      // Color filter
      if (colorFilters.length > 0 && productData.colors) {
        const hasMatchingColor = colorFilters.some((color) => {
          const colorMap = {
            black: "Чорний",
            white: "Білий",
            gray: "Сірий",
            blue: "Синій",
          };
          return productData.colors.includes(colorMap[color]);
        });
        if (!hasMatchingColor) {
          shouldShow = false;
        }
      }

      // Price filter
      if (productData.price > maxPrice) {
        shouldShow = false;
      }

      product.style.display = shouldShow ? "block" : "none";
      if (shouldShow) visibleCount++;
    });

    // Update products count
    const productsCount = document.querySelector(".products-count strong");
    if (productsCount) {
      productsCount.textContent = visibleCount;
    }
  }

  updatePriceDisplay() {
    const priceSlider = document.querySelector(".price-slider");
    const priceValues = document.querySelector(".price-values");
    if (priceSlider && priceValues) {
      const maxPrice = priceSlider.value;
      priceValues.innerHTML = `<span>100 ₴</span><span>${maxPrice} ₴</span>`;
    }
  }

  sortProducts() {
    const sortSelect = document.querySelector(".sort-select");
    const productsGrid = document.querySelector(".products-grid");
    if (!sortSelect || !productsGrid) return;

    const products = Array.from(productsGrid.querySelectorAll(".product-card"));
    const sortValue = sortSelect.value;

    products.sort((a, b) => {
      const dataA = JSON.parse(a.dataset.product);
      const dataB = JSON.parse(b.dataset.product);

      switch (sortValue) {
        case "price-low":
          return dataA.price - dataB.price;
        case "price-high":
          return dataB.price - dataA.price;
        case "name":
          return dataA.name.localeCompare(dataB.name);
        default:
          return 0;
      }
    });

    // Re-append sorted products
    products.forEach((product) => {
      productsGrid.appendChild(product);
    });
  }

  resetFilters() {
    // Reset all checkboxes
    const checkboxes = document.querySelectorAll(
      '.filter-option input[type="checkbox"], .color-filter input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });

    // Reset price slider
    const priceSlider = document.querySelector(".price-slider");
    if (priceSlider) {
      priceSlider.value = priceSlider.max;
      this.updatePriceDisplay();
    }

    // Reset sort
    const sortSelect = document.querySelector(".sort-select");
    if (sortSelect) {
      sortSelect.value = "default";
    }

    // Show all products
    const products = document.querySelectorAll(".product-card");
    products.forEach((product) => {
      product.style.display = "block";
    });

    // Update count
    const productsCount = document.querySelector(".products-count strong");
    if (productsCount) {
      productsCount.textContent = products.length;
    }
  }

  closeMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");

    if (menuToggle) menuToggle.classList.remove("active");
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  openCart() {
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartOverlay) {
      cartOverlay.classList.add("active");
      document.body.classList.add("no-scroll");
      this.renderCart();
    }
  }

  closeCart() {
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartOverlay) {
      cartOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }
  }

  addToCart(product) {
    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        ...product,
        quantity: 1,
      });
    }

    this.saveCart();
    this.updateCartCount();
    this.showAddToCartFeedback();

    // Auto-open cart after adding item
    setTimeout(() => {
      this.openCart();
    }, 500);
  }

  removeFromCart(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
    this.renderCart();
  }

  updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const item = this.items.find((item) => item.id === productId);
    if (item) {
      item.quantity = newQuantity;
      this.saveCart();
      this.updateCartCount();
      this.renderCart();
    }
  }

  updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? "flex" : "none";
    }
  }

  calculateTotal() {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.items));
  }

  renderCart() {
    const cartEmpty = document.getElementById("cart-empty");
    const cartItems = document.getElementById("cart-items");
    const cartFooter = document.getElementById("cart-footer");
    const totalPrice = document.getElementById("total-price");

    if (this.items.length === 0) {
      if (cartEmpty) cartEmpty.style.display = "flex";
      if (cartItems) cartItems.style.display = "none";
      if (cartFooter) cartFooter.style.display = "none";
    } else {
      if (cartEmpty) cartEmpty.style.display = "none";
      if (cartItems) cartItems.style.display = "flex";
      if (cartFooter) cartFooter.style.display = "block";

      // Render cart items
      if (cartItems) {
        cartItems.innerHTML = this.items
          .map(
            (item) => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${item.price} ₴</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="cart.updateQuantity(${
                                  item.id
                                }, ${item.quantity - 1})">-</button>
                                <span class="quantity-display">${
                                  item.quantity
                                }</span>
                                <button class="quantity-btn" onclick="cart.updateQuantity(${
                                  item.id
                                }, ${item.quantity + 1})">+</button>
                            </div>
                            <button class="remove-item" onclick="cart.removeFromCart(${
                              item.id
                            })" title="Видалити товар">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `
          )
          .join("");
      }

      // Update total
      if (totalPrice) {
        totalPrice.textContent = `${this.calculateTotal()} ₴`;
      }
    }

    // Bind checkout button
    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        this.showNotification(
          "Функція оформлення замовлення буде доступна незабаром!",
          "info"
        );
      };
    }
  }

  showAddToCartFeedback() {
    this.showNotification("Товар додано до кошика!", "success");
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 25px;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            max-width: 300px;
        `;

    // Set colors based on type
    switch (type) {
      case "success":
        notification.style.background =
          "linear-gradient(135deg, #28a745, #20c997)";
        notification.style.color = "white";
        break;
      case "error":
        notification.style.background =
          "linear-gradient(135deg, #dc3545, #c82333)";
        notification.style.color = "white";
        break;
      case "info":
      default:
        notification.style.background =
          "linear-gradient(135deg, #007bff, #0056b3)";
        notification.style.color = "white";
        break;
    }

    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize cart when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.cart = new ShoppingCart();

  // Initialize price display on catalog page
  if (document.querySelector(".price-slider")) {
    window.cart.updatePriceDisplay();
  }
});

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (header) {
    if (window.scrollY > 100) {
      header.style.background = "rgba(0, 0, 0, 0.98)";
    } else {
      header.style.background = "rgba(0, 0, 0, 0.95)";
    }
  }
});

// Add loading animation for images
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img");

  images.forEach((img) => {
    img.addEventListener("load", () => {
      img.style.opacity = "1";
    });

    if (img.complete) {
      img.style.opacity = "1";
    }
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(
    ".feature-card, .category-card, .product-card, .value-card, .team-member, .contact-method"
  );

  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.8s ease-out";
    observer.observe(el);
  });
});

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCartCount();
        this.bindFAQEvents();
        this.bindFormEvents();
    }

    bindEvents() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const menuClose = document.querySelector('.menu-close');
        const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                mobileMenuOverlay.classList.toggle('active');
                document.body.classList.toggle('no-scroll');
            });
        }

        if (menuClose) {
            menuClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Close mobile menu when clicking on overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === mobileMenuOverlay) {
                    this.closeMobileMenu();
                }
            });
        }

        // Cart toggle
        const cartToggle = document.getElementById('cart-toggle');
        const cartClose = document.getElementById('cart-close');
        const cartOverlay = document.getElementById('cart-overlay');

        if (cartToggle) {
            cartToggle.addEventListener('click', () => {
                this.openCart();
            });
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => {
                this.closeCart();
            });
        }

        // Close cart when clicking on overlay
        if (cartOverlay) {
            cartOverlay.addEventListener('click', (e) => {
                if (e.target === cartOverlay) {
                    this.closeCart();
                }
            });
        }

        // Add to cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productElement = button.closest('[data-product]');
                if (productElement) {
                    const productData = JSON.parse(productElement.dataset.product);
                    this.addToCart(productData);
                }
            });
        });

        // Category cards navigation
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'catalog.html';
            });
        });

        // Continue shopping links
        const continueShoppingLinks = document.querySelectorAll('.continue-shopping');
        continueShoppingLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCart();
                if (link.getAttribute('href') === 'catalog.html') {
                    window.location.href = 'catalog.html';
                }
            });
        });

        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                this.showNotification('Дякуємо за підписку! Перевірте свою електронну пошту.', 'success');
                newsletterForm.reset();
            });
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                this.closeCart();
            }
        });

        // Filters functionality (for catalog page)
        this.bindFilterEvents();
    }

    bindFilterEvents() {
        // Filter checkboxes
        const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"], .color-filter input[type="checkbox"]');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // Price range slider
        const priceSlider = document.querySelector('.price-slider');
        if (priceSlider) {
            priceSlider.addEventListener('input', () => {
                this.updatePriceDisplay();
                this.applyFilters();
            });
        }

        // Sort dropdown
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortProducts();
            });
        }

        // Reset filters
        const resetButton = document.querySelector('.filters-reset');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }

    bindFAQEvents() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                // Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        });
    }

    bindFormEvents() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData);
                
                // Validate required fields
                if (!data.name || !data.email || !data.message || !data.privacy) {
                    this.showNotification('Будь ласка, заповніть всі обов\'язкові поля та погодьтеся з політикою конфіденційності.', 'error');
                    return;
                }
                
                // Simulate form submission
                this.showNotification('Ваше повідомлення відправлено! Ми зв\'яжемося з вами найближчим часом.', 'success');
                contactForm.reset();
            });
        }
    }

    applyFilters() {
        const products = document.querySelectorAll('.product-card');
        const categoryFilters = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
        const sizeFilters = Array.from(document.querySelectorAll('input[name="size"]:checked')).map(cb => cb.value);
        const colorFilters = Array.from(document.querySelectorAll('input[name="color"]:checked')).map(cb => cb.value);
        const priceSlider = document.querySelector('.price-slider');
        const maxPrice = priceSlider ? parseInt(priceSlider.value) : 1000;

        let visibleCount = 0;

        products.forEach(product => {
            const productData = JSON.parse(product.dataset.product);
            let shouldShow = true;

            // Category filter
            if (categoryFilters.length > 0 && !categoryFilters.includes(productData.category)) {
                shouldShow = false;
            }

            // Size filter
            if (sizeFilters.length > 0 && productData.sizes) {
                const hasMatchingSize = sizeFilters.some(size => productData.sizes.includes(size));
                if (!hasMatchingSize) {
                    shouldShow = false;
                }
            }

            // Color filter
            if (colorFilters.length > 0 && productData.colors) {
                const hasMatchingColor = colorFilters.some(color => {
                    const colorMap = {
                        'black': 'Чорний',
                        'white': 'Білий',
                        'gray': 'Сірий',
                        'blue': 'Синій'
                    };
                    return productData.colors.includes(colorMap[color]);
                });
                if (!hasMatchingColor) {
                    shouldShow = false;
                }
            }

            // Price filter
            if (productData.price > maxPrice) {
                shouldShow = false;
            }

            product.style.display = shouldShow ? 'block' : 'none';
            if (shouldShow) visibleCount++;
        });

        // Update products count
        const productsCount = document.querySelector('.products-count strong');
        if (productsCount) {
            productsCount.textContent = visibleCount;
        }
    }

    updatePriceDisplay() {
        const priceSlider = document.querySelector('.price-slider');
        const priceValues = document.querySelector('.price-values');
        if (priceSlider && priceValues) {
            const maxPrice = priceSlider.value;
            priceValues.innerHTML = `<span>100 ₴</span><span>${maxPrice} ₴</span>`;
        }
    }

    sortProducts() {
        const sortSelect = document.querySelector('.sort-select');
        const productsGrid = document.querySelector('.products-grid');
        if (!sortSelect || !productsGrid) return;

        const products = Array.from(productsGrid.querySelectorAll('.product-card'));
        const sortValue = sortSelect.value;

        products.sort((a, b) => {
            const dataA = JSON.parse(a.dataset.product);
            const dataB = JSON.parse(b.dataset.product);

            switch (sortValue) {
                case 'price-low':
                    return dataA.price - dataB.price;
                case 'price-high':
                    return dataB.price - dataA.price;
                case 'name':
                    return dataA.name.localeCompare(dataB.name);
                default:
                    return 0;
            }
        });

        // Re-append sorted products
        products.forEach(product => {
            productsGrid.appendChild(product);
        });
    }

    resetFilters() {
        // Reset all checkboxes
        const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"], .color-filter input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset price slider
        const priceSlider = document.querySelector('.price-slider');
        if (priceSlider) {
            priceSlider.value = priceSlider.max;
            this.updatePriceDisplay();
        }

        // Reset sort
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.value = 'default';
        }

        // Show all products
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            product.style.display = 'block';
        });

        // Update count
        const productsCount = document.querySelector('.products-count strong');
        if (productsCount) {
            productsCount.textContent = products.length;
        }
    }

    closeMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
        
        if (menuToggle) menuToggle.classList.remove('active');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    openCart() {
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartOverlay) {
            cartOverlay.classList.add('active');
            document.body.classList.add('no-scroll');
            this.renderCart();
        }
    }

    closeCart() {
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartOverlay) {
            cartOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }

    addToCart(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddToCartFeedback();
        
        // Auto-open cart after adding item
        setTimeout(() => {
            this.openCart();
        }, 500);
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartCount();
            this.renderCart();
        }
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    calculateTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    renderCart() {
        const cartEmpty = document.getElementById('cart-empty');
        const cartItems = document.getElementById('cart-items');
        const cartFooter = document.getElementById('cart-footer');
        const totalPrice = document.getElementById('total-price');

        if (this.items.length === 0) {
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (cartItems) cartItems.style.display = 'none';
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            if (cartEmpty) cartEmpty.style.display = 'none';
            if (cartItems) cartItems.style.display = 'flex';
            if (cartFooter) cartFooter.style.display = 'block';

            // Render cart items
            if (cartItems) {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${item.price} ₴</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                            <button class="remove-item" onclick="cart.removeFromCart(${item.id})" title="Видалити товар">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('');
            }

            // Update total
            if (totalPrice) {
                totalPrice.textContent = `${this.calculateTotal()} ₴`;
            }
        }

        // Bind checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.onclick = () => {
                if (this.items.length === 0) {
                    this.showNotification('Додайте товари до кошика перед оформленням замовлення', 'error');
                    return;
                }
                window.location.href = 'checkout.html';
            };
        }
    }

    showAddToCartFeedback() {
        this.showNotification('Товар додано до кошика!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 25px;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            max-width: 300px;
        `;

        // Set colors based on type
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                notification.style.color = 'white';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
                notification.style.color = 'white';
                break;
            case 'info':
            default:
                notification.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
                notification.style.color = 'white';
                break;
        }

        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    
    // Initialize price display on catalog page
    if (document.querySelector('.price-slider')) {
        window.cart.updatePriceDisplay();
    }
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(0, 0, 0, 0.98)';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
        }
    }
});

// Add loading animation for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
        
        if (img.complete) {
            img.style.opacity = '1';
        }
    });
});



// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .category-card, .product-card, .value-card, .team-member, .contact-method');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact-form");
  function handleSendForm(event) {
    event.preventDefault();
    let formData = new FormData(form);
    fetch("https://formsubmit.co/ajax/pavlikkarina90@gmail.com", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Форма успішно відправлена!");
      })
      .catch((error) => alert("Помилка при відправці"));
  }
  form.addEventListener("submit", handleSendForm);
});
