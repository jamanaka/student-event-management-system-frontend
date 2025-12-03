import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './css/Index.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Import from folder /pages/admin/
import Dashboard from './pages/admin/Dashboard';

// Import from folder /pages/users/
import UserDashboard from './pages/users/UserDashboard';

function App() {
  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin route */}
            <Route path="/admin/dashboard" element={<Dashboard />} />

            {/* Admin route */}
            <Route path="/users/dashboard" element={<UserDashboard />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
