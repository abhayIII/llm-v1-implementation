// Utility function for error handling
const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
};

// Mobile menu functionality
const initMobileMenu = () => {
    try {
        const mobileMenu = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        const navLinksItems = document.querySelectorAll('.nav-links a');
        const body = document.body;

        if (!mobileMenu || !navLinks) {
            throw new Error('Mobile menu elements not found');
        }

        // Toggle menu
        const toggleMenu = () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        };

        // Add click event to menu button
        mobileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking on a link
        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                toggleMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !mobileMenu.contains(e.target)) {
                toggleMenu();
            }
        });

        // Prevent clicks inside the menu from closing it
        navLinks.addEventListener('click', (e) => {
            e.stopPropagation();
        });

    } catch (error) {
        handleError(error, 'mobile menu initialization');
    }
};

// Smooth scrolling
const initSmoothScroll = () => {
    try {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    history.pushState(null, '', targetId);
                }
            });
        });
    } catch (error) {
        handleError(error, 'smooth scroll initialization');
    }
};

// Form validation
const initFormValidation = () => {
    try {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea');

        const validation