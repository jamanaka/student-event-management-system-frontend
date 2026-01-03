import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useIsAuthenticated } from '../../store/useAuthStore';
import { FaGraduationCap } from 'react-icons/fa';
import '../../css/common/PublicLayout.css';

const PublicLayout = ({ children, title }) => {
  const { user } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header-container">
          <Link to="/" className="public-logo">
            <span className="logo-icon"><FaGraduationCap size={24} /></span>
            <span className="logo-text">CampusEvents</span>
          </Link>
          
          <nav className="public-nav">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' ? (
                  <Link to="/admin/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/users/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                )}
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="public-main">
        <div className="public-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;

