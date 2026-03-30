# USFinance - Banking Landing Page

A professional, responsive banking landing page built with HTML, CSS, JavaScript, and Node.js/Express.

![USFinance](https://img.shields.io/badge/USFinance-Banking%20Platform-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎨 Features

- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Modern UI** - Built with brand colors: Blue (#0052CC), Red (#E31B23), White (#FFFFFF)
- **Interactive Elements** - Smooth scrolling, animations, and transitions
- **Contact Form** - Server-side validated contact submission
- **Newsletter Subscription** - Email capture with validation
- **Mobile Menu** - Hamburger menu for mobile devices
- **Professional Layout** - 8 key sections covering all banking services
- **Accessibility** - Semantic HTML and proper ARIA labels
- **Performance** - Optimized for fast loading

## 📋 Sections Included

1. **Navigation Bar** - Sticky navigation with mobile toggle
2. **Hero Section** - Eye-catching banner with CTAs
3. **Services** - 6 banking services with icons
4. **Features** - 6 key differentiators
5. **Statistics** - Company metrics and achievements
6. **About** - Company information and values
7. **Newsletter** - Email subscription
8. **Contact** - Contact form and information
9. **Footer** - Links and social media

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hackdemon4-stack/usfinance.git
cd usfinance
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
usfinance/
├── public/
│   ├── css/
│   │   └── styles.css          # Main stylesheet (1000+ lines)
│   ├── js/
│   │   └── script.js           # JavaScript functionality
│   └── index.html              # Landing page HTML
├── node_modules/               # Dependencies (after npm install)
├── .env                        # Environment variables
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Project configuration
├── server.js                   # Express server
└── README.md                   # This file
```

## 🎯 Usage

### Running the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

### API Endpoints

#### Contact Form
- **Endpoint**: `POST /api/contact`
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "subject": "Inquiry",
  "message": "Your message here"
}
```

#### Newsletter Subscription
- **Endpoint**: `POST /api/newsletter`
- **Body**:
```json
{
  "email": "user@example.com"
}
```

## 🎨 Customization

### Change Brand Colors
Edit `public/css/styles.css` and modify the CSS variables:
```css
:root {
    --primary: #0052CC;      /* Blue */
    --secondary: #E31B23;    /* Red */
    --white: #FFFFFF;
}
```

### Update Company Information
Edit `public/index.html` and update:
- Company name: Search for "USFinance"
- Contact details: Update phone, email, and address in the contact section
- Services: Modify service cards content
- About text: Update company description

### Add Your Logo
Replace the bank icon in the navbar with your logo:
```html
<i class="fas fa-bank"></i> <!-- Replace this -->
```

## 🔒 Security

- Server-side form validation
- CORS enabled for safe cross-origin requests
- Email validation on both client and server
- Environment variables for sensitive data

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🎬 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Dependencies

- **express** (^4.18.2) - Web framework
- **cors** (^2.8.5) - CORS middleware
- **dotenv** (^16.0.3) - Environment variables

### Dev Dependencies
- **nodemon** (^2.0.20) - Development server with auto-reload

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, change it in `.env`:
```
PORT=3001
```

### Module Not Found
Install dependencies:
```bash
npm install
```

### CORS Issues
CORS is already configured in `server.js`, but you can modify it:
```javascript
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

## 📈 Performance Tips

1. Images are lazy-loaded automatically
2. CSS is minified and optimized
3. JavaScript is vanilla (no heavy libraries)
4. Server responses are optimized
5. Animations use CSS for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

For support, email admin@usfinance.online or open an issue in the repository.

## 🎉 Credits

- Inspired by US Bank's professional design
- Built with HTML, CSS, JavaScript, and Node.js
- Font Awesome icons

## 📞 Contact

- **Website**: https://usfinance.example.com
- **Email**: admin@usfinance.online
- **Phone**: +1 609-629-7943

---

**Made with ❤️ by hackdemon4-stack**

Last Updated: 2026-03-26