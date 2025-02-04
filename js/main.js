// App Class - Main Application Logic
class App {
    #retryAttempts = 3;
    #retryDelay = 1000;
    #formState;
    #validators;

    constructor() {
        this.#validators = new Map();
        this.initializeApp();
    }

    async initializeApp() {
        try {
            await this.#handleOperation(
                () => {
                    this.#initMobileMenu();
                    this.#initSmoothScroll();
                    this.#initFormValidation();
                    this.#initScrollAnimations();
                    this.#initGlobalEventHandlers();
                },
                'Failed to initialize app'
            );
        } catch (error) {
            console.error('App initialization failed:', error);
        }
    }

    // Error Handling
    async #handleOperation(operation, errorMessage, fallback = null) {
        let attempts = 0;
        while (attempts < this.#retryAttempts) {
            try {
                return await operation();
            } catch (error) {
                attempts++;
                console.error(`${errorMessage}: ${error.message}`);
                if (attempts === this.#retryAttempts) {
                    this.#showNotification(errorMessage, 'error');
                    return fallback?.();
                }
                await new Promise(resolve => setTimeout(resolve, this.#retryDelay));
            }
        }
    }

    // Mobile Menu
    #initMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const body = document.body;

        if (!hamburger || !navMenu) return;

        const toggleMenu = () => {
            hamburger?.classList.toggle('active');
            navMenu?.classList.toggle('active');
            body.style.overflow = navMenu?.classList.contains('active') ? 'hidden' : '';
        };

        hamburger.addEventListener('click', toggleMenu);

        // Global click handler for menu
        document.addEventListener('click', (e) => {
            if (navMenu?.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !hamburger.contains(e.target)) {
                toggleMenu();
            }
        });

        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    // Smooth Scrolling
    #initSmoothScroll() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') {
                this.#showNotification('Section coming soon!', 'info');
                return;
            }

            const target = document.querySelector(targetId);
            if (!target) {
                this.#showNotification('Section not found', 'error');
                return;
            }

            const headerOffset = 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    }

    // Form Validation
    #initFormValidation() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        this.#formState = new Map();
        
        const validateInput = (input) => {
            const value = input.value.trim();
            const inputType = input.type;
            const validators = this.#validators.get(inputType) ?? this.#getDefaultValidators(inputType);
            
            return validators.every(validator => {
                const { isValid, message } = validator(value);
                if (!isValid) {
                    this.#showInputError(input, message);
                    return false;
                }
                return true;
            });
        };

        // Real-time validation
        form.querySelectorAll('input, textarea').forEach(input => {
            ['input', 'blur'].forEach(eventType => {
                input.addEventListener(eventType, () => {
                    this.#formState.set(input.id, input.value);
                    validateInput(input);
                });
            });
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const isValid = await this.#handleOperation(
                async () => {
                    const inputs = [...form.elements];
                    const results = await Promise.all(
                        inputs.map(input => validateInput(input))
                    );
                    return results.every(Boolean);
                },
                'Form validation failed'
            );

            if (!isValid) return;

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.classList.add('loading');

            try {
                await this.#simulateFormSubmission();
                this.#showNotification('Message sent successfully!', 'success');
                form.reset();
                this.#formState.clear();
            } catch (error) {
                this.#showNotification(error.message ?? 'Failed to send message', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
            }
        });
    }

    // Scroll Animations
    #initScrollAnimations() {
        const cards = document.querySelectorAll('.feature-card');
        if (!cards.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2, rootMargin: '50px' }
        );

        cards.forEach(card => observer.observe(card));
    }

    // Global Event Handlers
    #initGlobalEventHandlers() {
        // Handle link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link?.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                this.#showNotification('This feature is coming soon!', 'info');
            }
        });

        // Handle network status
        window.addEventListener('online', () => 
            this.#showNotification('You are back online!', 'success'));
        window.addEventListener('offline', () => 
            this.#showNotification('You are offline. Please check your connection.', 'error'));

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.#showNotification('An unexpected error occurred', 'error');
        });
    }

    // Utility Methods
    #showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <p>${message}</p>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));

        const close = () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        };

        notification.querySelector('.notification-close').addEventListener('click', close);
        setTimeout(close, 5000);
    }

    async #simulateFormSubmission() {
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.1 ? resolve() : reject(new Error('Network error'));
            }, 1500);
        });
    }

    #getDefaultValidators(type) {
        return {
            email: [
                value => ({
                    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                    message: 'Please enter a valid email address'
                })
            ],
            text: [
                value => ({
                    isValid: value.length >= 2,
                    message: 'Must be at least 2 characters'
                })
            ],
            textarea: [
                value => ({
                    isValid: value.length >= 10,
                    message: 'Message must be at least 10 characters'
                })
            ]
        }[type] ?? [];
    }

    #showInputError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup?.querySelector('.error-message') ?? 
                        document.createElement('div');
        
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        if (!formGroup?.querySelector('.error-message')) {
            formGroup?.appendChild(errorDiv);
        }
        
        input.classList.add('error');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new App());