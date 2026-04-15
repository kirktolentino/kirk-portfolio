# Kirk Adison Tolentino — Portfolio Website
## Setup & Installation Guide

---

## 📁 File Structure

```
kirk-portfolio/
├── index.php               ← Main portfolio page
├── assets/
│   ├── css/
│   │   └── style.css       ← All styles
│   └── js/
│       └── main.js         ← Interactions & scroll effects
├── mail/
│   ├── send.php            ← PHPMailer contact form handler
│   └── PHPMailer/          ← PHPMailer library (see Step 2)
│       └── src/
│           ├── PHPMailer.php
│           ├── SMTP.php
│           └── Exception.php
└── README.md
```

---

## 🚀 Setup Steps

### Step 1 — Add Your Profile Photo

Place your photo inside `assets/images/` and name it `profile.jpg`.

Recommended: square image, at least 300×300px.

---

### Step 2 — Install PHPMailer

**Option A: Composer (recommended)**

If you have Composer installed, run in the portfolio folder:
```bash
composer require phpmailer/phpmailer
```

Then in `mail/send.php`, uncomment this line:
```php
require_once __DIR__ . '/../vendor/autoload.php';
```
And comment out the three manual `require_once` lines below it.

**Option B: Manual Download**

1. Download PHPMailer from: https://github.com/PHPMailer/PHPMailer/releases
2. Extract and copy only the `src/` folder into `mail/PHPMailer/`

---

### Step 3 — Configure Gmail SMTP

1. Go to your Google Account → Security
2. Enable **2-Step Verification** (required for App Passwords)
3. Go to **App Passwords** → Select "Mail" + "Other (Custom)" → Generate
4. Copy the 16-character App Password

5. Open `mail/send.php` and update:
```php
define('SMTP_HOST',     'smtp.gmail.com');
define('SMTP_USERNAME', 'kirktolentino0@gmail.com');  // Your Gmail
define('SMTP_PASSWORD', 'xxxx xxxx xxxx xxxx');        // Paste App Password here
define('SMTP_PORT',     587);
define('OWNER_EMAIL',   'kirktolentino0@gmail.com');   // Where to receive messages
```

---

### Step 4 — Upload to Hosting

Upload all files to your web hosting (e.g. Hostinger, InfinityFree, etc.)

Make sure your hosting supports:
- PHP 7.4 or higher
- SMTP / outgoing email

---

### Step 5 — Test the Contact Form

1. Open your site in a browser
2. Scroll to the Contact section
3. Fill out the form and click Send
4. Check your Gmail inbox for the message

---

## 🔧 Customization Tips

- **Profile photo**: Replace `assets/images/profile.jpg`
- **Colors**: Edit CSS variables at the top of `assets/css/style.css`
- **Content**: Edit `index.php` directly — all sections are clearly labeled

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| Form says "something went wrong" | Check SMTP credentials, enable App Password |
| PHPMailer not found | Double-check the file paths in `mail/send.php` |
| Email goes to spam | Ask recipient to add you to contacts |
| Blank page | Check PHP error logs for syntax errors |

---

Built with ❤️ for Kirk Adison M. Tolentino  
BS Information Technology — Mindoro State University
