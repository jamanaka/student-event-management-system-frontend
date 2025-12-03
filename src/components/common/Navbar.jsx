import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import "../../css/LandingNavbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const menuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle body scroll lock and close menu on outside click
  useEffect(() => {
    const handleBodyScroll = () => {
      if (isMobileMenuOpen) {
        document.body.style.overflow = "hidden";
        document.body.classList.add("no-scroll");
      } else {
        document.body.style.overflow = "auto";
        document.body.classList.remove("no-scroll");
      }
    };

    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    handleBodyScroll();
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.style.overflow = "auto";
      document.body.classList.remove("no-scroll");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleGetStarted = () => {
    setIsMobileMenuOpen(false);
    if (isAuthenticated) {
      navigate("/events");
    } else {
      navigate("/register");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className={`landing-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-navbar-container">
          {/* Logo */}
          <div className="landing-navbar-brand">
            <Link to="/" className="landing-navbar-logo">
              <span className="logo-icon">🎓</span>
              <span className="logo-text">CampusEvents</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="landing-navbar-links desktop-links">
            <button
              onClick={() => scrollToSection("features")}
              className="nav-link"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="nav-link"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="nav-link"
            >
              Testimonials
            </button>
            <Link to="/events" className="nav-link">
              Browse Events
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="landing-navbar-actions desktop-actions">
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <button onClick={handleGetStarted} className="btn btn-primary">
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            ref={hamburgerRef}
            className="mobile-hamburger"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            style={{
              position: "relative",
              width: "30px",
              height: "30px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "5px",
              display: "none", // Hidden by default, shown via CSS
              zIndex: "1002",
            }}
          >
            {/* Hamburger lines with JavaScript-controlled animation */}
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "block",
                  position: "absolute",
                  height: "2px",
                  width: "100%",
                  background: scrolled ? "#2d3436" : "white",
                  borderRadius: "1px",
                  transition: "all 0.3s ease",
                  top: isMobileMenuOpen ? "50%" : "20%",
                  transform: isMobileMenuOpen
                    ? "rotate(45deg) translateY(-50%)"
                    : "none",
                  opacity: isMobileMenuOpen ? 1 : 1,
                }}
              ></span>
              <span
                style={{
                  display: "block",
                  position: "absolute",
                  height: "2px",
                  width: "100%",
                  background: scrolled ? "#2d3436" : "white",
                  borderRadius: "1px",
                  transition: "all 0.3s ease",
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: isMobileMenuOpen ? 0 : 1,
                }}
              ></span>
              <span
                style={{
                  display: "block",
                  position: "absolute",
                  height: "2px",
                  width: "100%",
                  background: scrolled ? "#2d3436" : "white",
                  borderRadius: "1px",
                  transition: "all 0.3s ease",
                  bottom: isMobileMenuOpen ? "50%" : "20%",
                  transform: isMobileMenuOpen
                    ? "rotate(-45deg) translateY(50%)"
                    : "none",
                  opacity: isMobileMenuOpen ? 1 : 1,
                }}
              ></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Using JavaScript for control */}
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: "0",
          right: isMobileMenuOpen ? "0" : "-100%",
          width: "325px",
          height: "100vh",
          background: "white",
          zIndex: "1001",
          transition: "right 0.3s ease",
          boxShadow: "-5px 0 20px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid gray",
            background: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              fontSize: "1.4rem",
              fontWeight: "700",
              color: "#2d3436",
            }}
          >
            <span style={{ fontSize: "1.8rem" }}>🎓</span>
            <span>CampusEvents</span>
          </div>
        </div>

        <div
          style={{
            flex: "1",
            padding: "1.5rem",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginBottom: "2rem",
            }}
          >
            <button
              onClick={() => {
                scrollToSection("features");
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "1rem",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "#000",
                fontSize: "1.1rem",
                fontWeight: "500",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(74, 105, 189, 0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Features
            </button>
            <button
              onClick={() => {
                scrollToSection("how-it-works");
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "1rem",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "#000",
                fontSize: "1.1rem",
                fontWeight: "500",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(74, 105, 189, 0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              How It Works
            </button>
            <button
              onClick={() => {
                scrollToSection("testimonials");
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "1rem",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "#000",
                fontSize: "1.1rem",
                fontWeight: "500",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(74, 105, 189, 0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Testimonials
            </button>
            <Link
              to="/events"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: "block",
                width: "100%",
                padding: "1rem",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "#000",
                fontSize: "1.1rem",
                fontWeight: "500",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(74, 105, 189, 0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Browse Events
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                padding: "1rem",
                borderRadius: "8px",
                fontWeight: "600",
                textDecoration: "none",
                textAlign: "center",
                border: "2px solid #4a69bd",
                color: "#4a69bd",
                background: "transparent",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#4a69bd";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#4a69bd";
              }}
            >
              Login
            </Link>
            <button
              onClick={handleGetStarted}
              style={{
                padding: "1rem",
                borderRadius: "8px",
                fontWeight: "600",
                textDecoration: "none",
                textAlign: "center",
                background: "linear-gradient(135deg, #4a69bd 0%, #6a89cc 100%)",
                color: "white",
                border: "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(74, 105, 189, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: "1000",
            animation: "fadeIn 0.3s ease",
          }}
        />
      )}
    </>
  );
};

export default Navbar;
