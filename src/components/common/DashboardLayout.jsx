import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  User
} from 'lucide-react';
import { FaGraduationCap } from 'react-icons/fa';
import { useAuthStore } from '../../store/useAuthStore';
import '../../css/common/DashboardLayout.css';

const DashboardLayout = ({ children, title, isAdmin = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarLinks = isAdmin
    ? [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/events', label: 'All Events', icon: Calendar },
        { path: '/admin/pending', label: 'Pending Events', icon: Bell },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/profile', label: 'Profile', icon: User },
      ]
    : [
        { path: '/users/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/events', label: 'Browse Events', icon: Calendar },
        { path: '/events/my-events', label: 'My Events', icon: Calendar },
        { path: '/events/my-rsvps', label: 'My RSVPs', icon: Users },
        { path: '/events/create', label: 'Create Event', icon: PlusCircle },
        { path: '/profile', label: 'Profile', icon: User },
      ];

  return (
    <div className="dashboard-layout">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to={isAdmin ? '/admin/dashboard' : '/users/dashboard'} className="sidebar-logo">
            <span className="logo-icon"><FaGraduationCap size={24} /></span>
            <span className="logo-text">CampusEvents</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {/* <Link 
            to="/profile" 
            className="sidebar-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link> */}
          <button 
            className="sidebar-nav-link logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-header">
          <h1 className="dashboard-page-title">{title}</h1>
          <div className="dashboard-header-actions">
            <div className="user-info">
              <User size={20} />
              <span className="user-name">
                {user?.firstName} {user?.lastName}
              </span>
              {user?.role === 'admin' && (
                <span className="user-badge admin">Admin</span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;

