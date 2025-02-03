// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    initFormValidation();
    initScrollAnimations();
    initErrorHandling();
});

// Mobile Menu Functionality
const initMobileMenu = () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    if (!hamburger || !navMenu) return;

    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            toggleMenu();
        }
    });

    // Close menu when clicking nav links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
};

// Smooth Scrolling
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 70;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// Error Handling
const initErrorHandling = () => {
    // Handle all link clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        // Handle internal links
        if (link.getAttribute('href')?.startsWith('#')) {
            return; // Let smooth scroll handle these
        }

    // Handle "Learn More" links specifically
        if (link.classList.contains('learn-more')) {
            e.preventDefault();
            showNotification('Feature details coming soon!', 'info');
            return;
        }

        // Handle external links
        if (link.getAttribute('href')?.startsWith('http') || 
            link.getAttribute('href')?.startsWith('https')) {
            e.preventDefault();
            try {
                window.open(link.href, '_blank')?.focus();
            } catch (error) {
                showNotification('Unable to open link. Please try again.', 'error');
            }
            return;
        }

        // Handle relative links or empty/invalid hrefs
        if (!link.href || link.href === '#' || link.href === 'javascript:void(0)') {
            e.preventDefault();
            showNotification('This feature is coming soon!', 'info');
            return;
        }
    });

    // Handle 404 errors for images
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            this.src = 'images/fallback.jpg'; // Add a fallback image path
            this.alt = 'Image not available';
            this.classList.add('image-error');
        };
    });

    // Handle general window errors
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.error('Error: ', msg, 'URL: ', url, 'Line: ', lineNo);
        showNotification('Something went wrong. Please try again.', 'error');
        return false;
    };

    // Handle network errors
    window.addEventListener('offline', () => {
        showNotification('You are offline. Please check your connection.', 'error');
    });

    window.addEventListener('online', () => {
        showNotification('You are back online!', 'success');
    });
};

// Form Validation
const initFormValidation = () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const showError = (input, message) => {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message') || 
                        document.createElement('div');
        
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        if (!formGroup.querySelector('.error-message')) {
            formGroup.appendChild(errorDiv);
        }
        
        input.classList.add('error');
    };

    const removeError = (input) => {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('error');
    };

    const validateInput = (input) => {
        const value = input.value.trim();
        
        switch(input.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    showError(input, 'Please enter a valid email address');
                    return false;
                }
                break;
            case 'text':
                if (value.length < 2) {
                    showError(input, 'Must be at least 2 characters');
                    return false;
                }
                break;
            default:
                if (input.tagName.toLowerCase() === 'textarea') {
                    if (value.length < 10) {
                        showError(input, 'Message must be at least 10 characters');
                        return false;
                    }
                }
                break;
        }
        
        removeError(input);
        return true;
    };

    // Real-time validation
    form.querySelectorAll('input, textarea').forEach(input => {
        ['input', 'blur'].forEach(eventType => {
            input.addEventListener(eventType, () => validateInput(input));
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            showNotification('Message sent successfully!', 'success');
            form.reset();
            
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.innerHTML = originalText;
        }
    });
};

// Scroll Animations
const initScrollAnimations = () => {
    const cards = document.querySelectorAll('.feature-card');
    if (!cards.length) return;
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        observer.observe(card);
    });
};

// Notification System
const showNotification = (message, type = 'success') => {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon;
    switch(type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            break;
        case 'info':
            icon = 'fa-info-circle';
            break;
        default:
            icon = 'fa-bell';
    }

    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <p>${message}</p>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
};