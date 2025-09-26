# Tickr - Daily Task Management Application

A modern, full-stack task management application built with React and Node.js. Tickr helps users organize their daily tasks with features like priority management, progress tracking, and analytics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Customization Guide](#customization-guide)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication**: Registration, login, logout, and password reset with email verification
- **Task Management**: Create, read, update, and delete tasks with priority levels
- **Priority Levels**: Organize tasks by low, medium, and high priority
- **Progress Tracking**: Monitor task completion and progress over time
- **Analytics Dashboard**: View task statistics and productivity insights
- **User Settings**: Customizable preferences including theme, view modes, and notifications
- **Landing Page**: Professional landing page with feature showcase
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for better user experience
- **Task View Modes**: Switch between list and card view modes
- **Email Notifications**: Email verification and password reset functionality
- **Auto-Ping System**: Server auto-ping to keep deployment active (for hosting services)
- **Contact & Contribution**: Contact page and contribution guide for open-source collaboration
- **Real-time Updates**: Dynamic UI updates without page refresh

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Chart.js & React Chart.js 2** - Data visualization
- **React Hot Toast** - Elegant notifications
- **React Icons** - Icon library
- **Axios** - HTTP client for API requests
- **Date-fns** - Date utility library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending functionality
- **CORS** - Cross-origin resource sharing
- **Validator** - Input validation
- **Crypto-js** - Cryptographic utilities
- **Axios** - HTTP client for server-side requests
- **Dotenv** - Environment variable management

## 📁 Project Structure

```
Tickr/
├── backend/                 # Node.js backend
│   ├── config/
│   │   └── database.js     # MongoDB connection setup
│   ├── controllers/        # Route handlers
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── settingsController.js
│   │   └── tasksController.js
│   ├── middleware/
│   │   └── auth.js         # Authentication middleware
│   ├── models/             # Mongoose schemas
│   │   ├── Settings.js
│   │   ├── Task.js
│   │   ├── TaskProgress.js
│   │   └── User.js
│   ├── routes/             # API routes
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── settings.js
│   │   └── tasks.js
│   ├── utils/              # Utility functions
│   │   └── emailService.js # Email service utilities
│   ├── .env               # Environment variables
│   ├── .gitignore         # Git ignore rules
│   ├── package.json
│   └── server.js           # Main server file
│
├── frontend/               # React frontend
│   ├── public/
│   │   └── manifest.json   # PWA manifest
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/        # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/          # Custom hooks
│   │   │   └── useTasks.js
│   │   ├── pages/          # Page components
│   │   │   ├── Analytics.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── ContributionGuide.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── Register.jsx
│   │   ├── services/       # API service functions
│   │   │   ├── analyticsService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── settingsService.js
│   │   │   └── taskService.js
│   │   ├── utils/          # Utility functions
│   │   │   ├── dateUtils.js
│   │   │   └── validation.js
│   │   ├── App.jsx         # Main App component
│   │   ├── index.css       # Global styles
│   │   └── index.jsx       # App entry point
│   ├── package.json
│   ├── tailwind.config.js  # Tailwind configuration
│   ├── postcss.config.js   # PostCSS configuration
│   └── vite.config.js      # Vite configuration
│
└── README.md               # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for version control)

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Tickr
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

## ⚙️ Configuration

### Backend Configuration

1. **Create environment file:**
   ```bash
   cd backend
   cp .env.example .env  # or create manually
   ```

2. **Configure environment variables in `backend/.env`:**
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/tickr
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/tickr

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d

   # Server
   PORT=5000
   NODE_ENV=development
   BACKEND_URL=http://localhost:5000

   # Email Configuration (for verification and password reset)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-email-app-password
   EMAIL_FROM=noreply@tickr.com
   ```

### Frontend Configuration

1. **Create environment file:**
   ```bash
   cd frontend
   cp .env.example .env  # or create manually
   ```

2. **Configure environment variables in `frontend/.env`:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Tickr
   ```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Production Mode

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend in production:**
   ```bash
   cd backend
   npm start
   ```

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/verify-email` | Verify email with OTP |
| GET | `/api/auth/me` | Get current user profile |

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all user tasks |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/:id` | Get specific task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/complete` | Mark task as complete |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/stats` | Get user task statistics |
| GET | `/api/analytics/progress` | Get progress data |
| GET | `/api/analytics/trends` | Get task completion trends |

### Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings` | Update user settings |
| PATCH | `/api/settings/update` | Update specific setting |
| POST | `/api/settings/reset` | Reset settings to default |

## 🎨 Customization Guide

### Styling and Themes

1. **Customize colors in `frontend/tailwind.config.js`:**
   ```javascript
   module.exports = {
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#eff6ff',
             500: '#3b82f6',
             600: '#2563eb',
             // Add more shades
           }
         }
       }
     }
   }
   ```

2. **Modify theme context in `frontend/src/context/ThemeContext.jsx`**

### Adding New Features

1. **Backend - Add new routes:**
   - Create controller in `backend/controllers/`
   - Add routes in `backend/routes/`
   - Update server.js to include new routes

2. **Frontend - Add new pages:**
   - Create component in `frontend/src/pages/`
   - Add route in `frontend/src/App.jsx`
   - Create corresponding service functions
   - Update navigation in `Navbar.jsx` if needed

### Settings System

The application includes a comprehensive settings system:

1. **Theme Management**: Users can switch between light and dark themes
2. **View Modes**: Toggle between list and card view for tasks
3. **Notifications**: Enable/disable notification preferences
4. **Language**: Support for multiple languages (extensible)
5. **Animations**: Control UI animations for better accessibility

To extend settings:
1. Add new fields to `Settings.js` model
2. Update `settingsController.js` validation
3. Modify `settingsService.js` for frontend integration
4. Add UI controls in settings component

### Database Schema Modifications

1. **Update Mongoose models in `backend/models/`**
2. **Run database migrations if needed**
3. **Update corresponding API endpoints**

### Email Configuration

The application includes email verification and password reset functionality:

1. **Email Verification**: New users receive OTP via email for account verification
2. **Password Reset**: Users can reset passwords through secure email links
3. **Custom Templates**: HTML email templates for professional communication

To configure email services:
1. Set up SMTP credentials in backend `.env`
2. Configure email templates in `utils/emailService.js`
3. Test email functionality in development
4. Consider using services like SendGrid, Mailgun for production

### Deployment Features

The application includes production-ready features:

1. **Auto-Ping System**: Prevents server hibernation on free hosting services
2. **Environment Configuration**: Separate dev/prod configurations
3. **Error Handling**: Comprehensive error handling and logging
4. **CORS Setup**: Properly configured cross-origin requests

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String (required),
  description: String,
  priority: String (low/medium/high),
  completed: Boolean,
  completedAt: Date,
  user: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### TaskProgress Model
```javascript
{
  user: ObjectId (ref: User),
  date: Date,
  tasksCreated: Number,
  tasksCompleted: Number,
  productivityScore: Number
}
```

### Settings Model
```javascript
{
  user: ObjectId (ref: User),
  theme: String (light/dark),
  taskViewMode: String (list/card),
  notifications: Boolean,
  language: String,
  animation: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Development Commands

### Backend Commands
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (setup required)
```

### Frontend Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📝 Environment Variables Reference

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `BACKEND_URL` - Backend URL for auto-ping functionality
- `SMTP_HOST` - SMTP server host for email services
- `SMTP_PORT` - SMTP server port
- `SMTP_EMAIL` - Email address for sending emails
- `SMTP_PASSWORD` - Email password or app password
- `EMAIL_FROM` - From email address for notifications

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Check if MongoDB is running
   - Verify MONGODB_URI in .env file
   - Ensure network access for MongoDB Atlas

2. **CORS Errors:**
   - Verify frontend URL in backend CORS configuration
   - Check API_URL in frontend .env

3. **Email Verification Issues:**
   - Verify SMTP credentials in .env file
   - Check email service provider settings
   - Ensure app passwords are used for Gmail
   - Test email connectivity

4. **Settings Not Saving:**
   - Check authentication middleware
   - Verify settings model validation
   - Ensure proper API endpoint calls

5. **Build Errors:**
   - Clear node_modules and reinstall dependencies
   - Check Node.js version compatibility
   - Verify all environment variables are set

6. **Authentication Issues:**
   - Verify JWT_SECRET configuration
   - Check token expiration settings
   - Ensure proper middleware implementation

### Getting Help

- Check the issues section for known problems
- Create a new issue with detailed description
- Include error logs and environment details

---

Built with ❤️ using MERN
