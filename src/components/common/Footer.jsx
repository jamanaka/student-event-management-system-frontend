import React from "react";
import "../../css/common/Footer.css";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaCalendarAlt,
  FaUsers,
  FaTicketAlt,
  FaHeart,
  FaUniversity,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand & About Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <FaCalendarAlt className="footer-logo-icon" />
              <span className="footer-logo-text">
                Campus<span className="logo-highlight">Events</span>
              </span>
            </div>
            <p className="footer-tagline">
              Your ultimate student event management platform. Discover, create,
              and manage campus events with ease.
            </p>
            <div className="footer-social">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* Quick Links Sections */}
          <div className="footer-links-grid">
            {/* For Students */}
            <div className="footer-links-section">
              <h4 className="footer-section-title">
                <FaUsers className="section-icon" /> For Students
              </h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/events" className="footer-link">
                    Browse Events
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="footer-link">
                    Event Calendar
                  </Link>
                </li>
                <li>
                  <Link to="/tickets" className="footer-link">
                    My Tickets
                  </Link>
                </li>
                <li>
                  <Link to="/clubs" className="footer-link">
                    Student Clubs
                  </Link>
                </li>
                <li>
                  <Link to="/organize" className="footer-link">
                    Organize Event
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Organizers */}
            <div className="footer-links-section">
              <h4 className="footer-section-title">
                <FaTicketAlt className="section-icon" /> For Organizers
              </h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/dashboard" className="footer-link">
                    Organizer Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/create-event" className="footer-link">
                    Create Event
                  </Link>
                </li>
                <li>
                  <Link to="/analytics" className="footer-link">
                    Event Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="footer-link">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link to="/verify" className="footer-link">
                    Verify Organization
                  </Link>
                </li>
              </ul>
            </div>

            {/* University Partners */}
            <div className="footer-links-section">
              <h4 className="footer-section-title">
                <FaUniversity className="section-icon" /> University Partners
              </h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/partners" className="footer-link">
                    Partner Universities
                  </Link>
                </li>
                <li>
                  <Link to="/integrations" className="footer-link">
                    Campus Integrations
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="footer-link">
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <Link to="/safety" className="footer-link">
                    Safety Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="footer-link">
                    Partner Inquiry
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div className="footer-contact-section">
              <h4 className="footer-section-title">Contact Us</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>Campus Events HQ, University District, City 12345</span>
                </div>
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <span>support@campusevents.com</span>
                </div>
              </div>
              <div className="newsletter-signup">
                <p className="newsletter-title">Stay Updated</p>
                <div className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="newsletter-input"
                  />
                  <button className="newsletter-button">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              © {currentYear} CampusEvents. Made with{" "}
              <FaHeart className="heart-icon" /> for students. All rights
              reserved.
            </p>
          </div>

          <div className="footer-legal-links">
            <Link to="/privacy" className="footer-legal-link">
              Privacy Policy
            </Link>
            <span className="footer-separator">•</span>
            <Link to="/terms" className="footer-legal-link">
              Terms of Service
            </Link>
            <span className="footer-separator">•</span>
            <Link to="/accessibility" className="footer-legal-link">
              Accessibility
            </Link>
            <span className="footer-separator">•</span>
            <Link to="/cookies" className="footer-legal-link">
              Cookie Policy
            </Link>
          </div>

          <div className="footer-badges">
            <span className="badge">🏆 #1 Student Event Platform</span>
            <span className="badge">🔒 SSL Secured</span>
            <span className="badge">🎓 100+ Campuses</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
