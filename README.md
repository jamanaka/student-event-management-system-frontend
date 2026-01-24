# Student Event Management System - Frontend

A modern React-based frontend application for managing student events. Built with React 19, TypeScript support, and a comprehensive UI for both administrators and regular users to create, manage, and participate in events.

## 🚀 Features

- **User Authentication**
  - Secure login and registration
  - Password reset functionality
  - JWT-based session management
  - Role-based access control

- **Admin Dashboard**
  - User management and analytics
  - Event approval workflow
  - System statistics and monitoring
  - Comprehensive admin controls

- **User Dashboard**
  - Personal event management
  - RSVP tracking and management
  - Profile management
  - Event participation history

- **Event Management**
  - Create and edit events with rich details
  - Event discovery and search
  - RSVP functionality
  - Event status tracking

- **Modern UI/UX**
  - Responsive design for all devices
  - Dark/light theme support
  - Toast notifications
  - Loading states and error handling
  - Accessible components

- **Performance Optimized**
  - Code splitting and lazy loading
  - Efficient state management
  - Optimized bundle size

## 🛠️ Tech Stack

- **Framework**: React 19 with hooks
- **Language**: JavaScript with TypeScript support
- **Routing**: React Router DOM v7
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with CSS modules
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Create React App
- **Styling**: CSS Modules with responsive design

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API running (see backend README)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jamanaka/student-event-management-system-frontend.git
   cd student-event-management-system-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```env
   # API Configuration
   REACT_APP_API_BASE_URL=http://localhost:5000/api

   # Environment
   REACT_APP_ENV=development
   ```

4. **Start the development server**
   ```bash
   # Runs on port 3001 to avoid conflicts with backend
   npm start
   # or
   npm run dev
   ```

   The application will open at [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Navbar, Footer, etc.)
│   └── ...
├── pages/               # Page components
│   ├── admin/           # Admin-specific pages
│   └── users/           # User-specific pages
├── services/            # API service functions
├── store/               # Zustand state management
├── lib/                 # Utility libraries
├── utils/               # Helper functions
├── css/                 # Stylesheets
│   ├── common/          # Global styles
│   ├── admin/           # Admin-specific styles
│   └── users/           # User-specific styles
├── App.js              # Main app component
└── index.js            # Application entry point
```

## 🎯 Available Scripts

### `npm start` / `npm run dev`
Runs the app in development mode on port 3001.
- Hot reloading enabled
- Development build with source maps

### `npm run build`
Builds the app for production to the `build` folder.
- Optimized and minified bundle
- Ready for deployment

### `npm test`
Launches the test runner in interactive watch mode.
- Runs all test files
- Coverage reports available

### `npm run eject`
**Note: This is a one-way operation!**
Removes the single build dependency and copies all configuration files.

## 🌐 Application Routes

### Public Routes
- `/` - Home/Landing page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset
- `/events/:id` - Public event details

### User Routes (Protected)
- `/users/dashboard` - User dashboard
- `/events` - Browse events
- `/events/create` - Create new event
- `/events/:id/edit` - Edit event
- `/events/my-events` - User's created events
- `/events/my-rsvps` - User's RSVPs
- `/profile` - User profile management

### Admin Routes (Protected)
- `/admin/dashboard` - Admin dashboard with statistics
- `/admin/pending` - Pending events for approval
- `/admin/events` - All events management
- `/admin/events/:id` - Event details for admin
- `/admin/users` - User management
- `/admin/profile` - Admin profile

## 🔐 Authentication Flow

The application uses JWT tokens for authentication:
- Access tokens are stored in memory and refreshed automatically
- Refresh tokens are stored in HTTP-only cookies
- Automatic token refresh on API calls
- Protected routes redirect to login if not authenticated

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🎨 Styling Guidelines

- **CSS Modules**: Component-scoped styles
- **BEM Methodology**: Block-Element-Modifier naming convention
- **CSS Variables**: Consistent color scheme and spacing
- **Mobile-First**: Responsive design approach

## 🔧 Development Guidelines

### Component Structure
```javascript
// Example component structure
import React from 'react';
import styles from './ComponentName.module.css';

const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{prop1}</h2>
      <p className={styles.description}>{prop2}</p>
    </div>
  );
};

export default ComponentName;
```

### State Management
Uses Zustand for global state management:
```javascript
// Example store usage
import { useAuthStore } from '../store/useAuthStore';

const MyComponent = () => {
  const { user, login, logout } = useAuthStore();

  // Component logic
};
```

### API Calls
Centralized API service functions:
```javascript
// Example API call
import eventService from '../services/event.service';

const fetchEvents = async () => {
  try {
    const events = await eventService.getAllEvents();
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watchAll=false
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Deployment Options

#### Static Hosting (Netlify, Vercel, etc.)
1. Build the application
2. Upload the `build` folder contents
3. Configure environment variables

#### Docker Deployment
```dockerfile
FROM nginx:alpine
COPY build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Server Deployment
Copy the `build` folder to your web server and serve static files.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write descriptive commit messages

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/jamanaka/student-event-management-system-frontend/issues) page
2. Create a new issue with detailed information
3. Include browser console errors and steps to reproduce

## 🔄 Version History

- **v0.1.0** - Initial release with core functionality
  - User authentication and registration
  - Event creation and management
  - Admin approval workflow
  - RSVP system
  - Responsive design

## 📚 Related Projects

- [Backend API](https://github.com/jamanaka/student-event-management-system-backend) - REST API for the application

---

**Note**: This frontend application requires the backend API to be running. Make sure to set up the [backend](https://github.com/jamanaka/student-event-management-system-backend) first.
