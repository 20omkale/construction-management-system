<div align="center">

# 🏗️ Construction Management System

An advanced, comprehensive full-stack solution designed to streamline construction project management, track intricate project details, handle documentation securely, and manage team authentication efficiently.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white&style=for-the-badge)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Fast_Builds-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white&style=for-the-badge)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white&style=for-the-badge)](https://www.postgresql.org/)

</div>

---

## ✨ Key Features

- **Robust Authentication:** Secure login flows with JWT, bcrypt hashing, and OTP features via Nodemailer.
- **Project Tracking:** Easily create, manage, and track the progress of ongoing construction builds.
- **Document Generation:** Automated rendering of necessary reports and forms directly into PDF formats using `pdfkit`.
- **Modern UI:** Built with React 19 and TailwindCSS for a highly responsive, aesthetically pleasing user interface.
- **Cloud Storage Integration:** Architecture ready for AWS S3 & Supabase for large file and blueprint storage.
- **Type-Safe Database:** Prisma ORM communicating with a serverless Neon PostgreSQL cloud database.

---

## 💻 Tech Stack Overview

### 🎨 Frontend (Client)
- **Framework:** React 19 powered by Vite for lightning-fast HMR.
- **Styling:** TailwindCSS for utility-first responsive rendering.
- **Routing:** React Router v7 for smooth Single Page Application (SPA) navigation.
- **Networking:** Axios for handling asynchronous API requests to the backend.

### ⚙️ Backend (Server)
- **Environment:** Node.js paired with Express.js to handle API lifecycle & routes.
- **Database:** Neon PostgreSQL.
- **ORM:** Prisma Client with `@prisma/adapter-pg`.
- **Security:** Helmet, express-rate-limit, CORS, JWT, and bcrypt for robust API protection.
- **Utilities:** Nodemailer (Emails), PDFKit (Invoicing/Reporting), AWS SDK (S3 Storage).

---

## 📂 Comprehensive Project Structure

The project employs a cleanly segregated Monorepo architecture for logical separation of concerns.

```text
Construction-Management-System/
│
├── Backend/                         # ⚙️ Node.js Express API Server
│   ├── .env                         # Server environment variables
│   ├── prisma/                      # Database Schema and seeders
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/                         # Core Backend Logic
│   │   ├── controllers/             # Request handlers
│   │   ├── routes/                  # API Endpoints definition
│   │   └── index.js                 # Server entry point
│   ├── vercel.json                  # Cloud Deployment configuration
│   └── package.json                 # Backend dependencies & scripts
│
├── Frontend/                        # 🎨 React Application
│   ├── public/                      # Static assets
│   ├── src/                         # Core Frontend Logic
│   │   ├── components/              # Reusable UI React components
│   │   ├── pages/                   # Main routing views
│   │   ├── main.jsx                 # Application entry point
│   │   └── App.jsx                  # Root component
│   ├── vite.config.js               # Vite build tools configuration
│   ├── eslint.config.js             # Linter configurations
│   └── package.json                 # Frontend dependencies & scripts
│
└── README.md                        # Project documentation (You are here!)
```

---

## ⚡ Getting Started Locally

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 📋 Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (Node Package Manager)
- A **PostgreSQL Database** URI (e.g., via Neon.tech)

### 🛠️ 1. Backend Setup

1. Open your terminal and navigate into the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file in the `Backend` root and add your configuration parameters:
   ```env
   # Database String
   DATABASE_URL="postgres://user:password@host:port/dbname?sslmode=require"
   
   # JWT Auth Secret
   JWT_SECRET="your_super_secret_key"
   
   # Server Port
   PORT=3000
   ```
4. Initialize your database using Prisma (Generates schema, runs migrations, and seeds defaults):
   ```bash
   npm run db:setup
   ```
5. Spin up the backend development server:
   ```bash
   npm run dev
   ```
   *Your server should now be listening at `http://localhost:3000`.*

### 🖥️ 2. Frontend Setup

1. Open a **new** terminal window/tab and navigate into the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install the necessary frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Your application will typically run at `http://localhost:5173`. Open this URL in your browser to view the app!*

---

## ☁️ Deployment Prep & Scripts

The `Backend` has explicit scripts configured for Vercel deployment:
- `vercel-build`: Generates Prisma engines and deploys database migrations automatically at build time.

The `Frontend` uses Vite's built-in bundler:
- `npm run build`: Minifies and optimizes the React application for production.

---

## 🛡️ License

This project is licensed under the **ISC License**. Use it, tweak it, build upon it!

<div align="center">
  <sub>Built with ❤️ for better construction management.</sub>
</div>
