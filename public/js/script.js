// ========================
// MOBILE MENU TOGGLE
// ========================

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when a link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ========================
// CONTACT FORM HANDLING
// ========================

const contactForm = document.getElementById('contactForm');
const contactMessage = document.getElementById('contactMessage');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showMessage(contactMessage, data.message, 'success');
            contactForm.reset();
            
            // Clear message after 5 seconds
            setTimeout(() => {
                contactMessage.classList.remove('success', 'error');
            }, 5000);
        } else {
            showMessage(contactMessage, data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(contactMessage, 'An error occurred. Please try again later.', 'error');
    }
});

// ========================
// NEWSLETTER FORM HANDLING
// ========================

const newsletterForm = document.getElementById('newsletterForm');
const newsletterMessage = document.getElementById('newsletterMessage');

newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = newsletterForm.querySelector('input[type="email"]').value;

    try {
        const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
            showMessage(newsletterMessage, data.message, 'success');
            newsletterForm.reset();
            
            // Clear message after 5 seconds
            setTimeout(() => {
                newsletterMessage.classList.remove('success', 'error');
            }, 5000);
        } else {
            showMessage(newsletterMessage, data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(newsletterMessage, 'An error occurred. Please try again later.', 'error');
    }
});

// ========================
// MESSAGE DISPLAY HELPER
// ========================

function showMessage(messageElement, text, type) {
    messageElement.textContent = text;
    messageElement.classList.remove('success', 'error');
    messageElement.classList.add(type);
}

// ========================
// SMOOTH SCROLL ENHANCEMENT
// ========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================
// SCROLL ANIMATIONS
// ========================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ========================
// NAVBAR SCROLL EFFECT
// ========================

const navbar = document.querySelector('.navbar');
const scrollThreshold = 50;

window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ========================
// FORM VALIDATION
// ========================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    if (!phone) return true; // Optional field
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Real-time email validation on contact form
const emailInput = document.getElementById('email');
if (emailInput) {
    emailInput.addEventListener('blur', () => {
        if (emailInput.value && !validateEmail(emailInput.value)) {
            emailInput.style.borderColor = '#E31B23';
        } else {
            emailInput.style.borderColor = '#E0E0E0';
        }
    });
}

// ========================
// ACTIVE NAV LINK HIGHLIGHTING
// ========================

const sections = document.querySelectorAll('section');
const navLinksList = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinksList.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ========================
// PAGE LOAD ANIMATIONS
// ========================

document.addEventListener('DOMContentLoaded', () => {
    // Fade in hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.opacity = '0';
        heroSection.style.animation = 'fadeInDown 0.8s ease forwards';
    }
});

// Add fade-in animation
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .nav-link.active {
        color: var(--secondary);
        font-weight: 700;
        border-bottom: 2px solid var(--secondary);
    }
`;
document.head.appendChild(style);

// ========================
// LOG INITIALIZATION
// ========================

console.log('🏦 USFinance Landing Page Loaded Successfully');