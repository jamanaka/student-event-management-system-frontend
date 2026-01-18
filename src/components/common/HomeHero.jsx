import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import "../../css/HomeHero.css";
import { Calendar, Users, Trophy, Sparkles } from "lucide-react";

const HomeHero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleExploreEvents = () => {
    navigate('/events');
  };

  const handleCreateEvent = () => {
    if (isAuthenticated) {
      navigate('/events/create');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="home-hero">
      <div className="hero-background">
        <div className="hero-gradient"></div>
        <div className="hero-pattern"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles className="sparkle-icon" />
            <span>University Event Management</span>
          </div>

          <div>
          <h1 className="hero-title">
            Where <span className="highlight">Student Events</span>
            <br />
            Come to <span className="highlight">Life</span>
          </h1>

          <p className="hero-subtitle">
            Discover, organize, and participate in campus events all in one
            place. From academic seminars to cultural festivals, never miss out
            on the campus experience.
          </p>
          </div>

          <div className="hero-actions">
            <button className="btn-primary" onClick={handleExploreEvents}>
              Explore Events
            </button>
            <button className="btn-secondary" onClick={handleCreateEvent}>
              Create Event
            </button>
          </div>
        </div>

        <div className="hero-features">
          <div className="feature">
            <div className="feature-icon">
              <div className="icon-circle">
                <Calendar />
              </div>
            </div>
            <h4 className="feature-title">Easy Registration</h4>
            <p className="feature-desc">One-click signup for any event</p>
          </div>

          <div className="feature">
            <div className="feature-icon">
              <div className="icon-circle">
                <Users />
              </div>
            </div>
            <h4 className="feature-title">Team Collaboration</h4>
            <p className="feature-desc">Create teams and manage members</p>
          </div>

          <div className="feature">
            <div className="feature-icon">
              <div className="icon-circle">
                <Trophy />
              </div>
            </div>
            <h4 className="feature-title">Win Prizes</h4>
            <p className="feature-desc">Compete for amazing rewards</p>
          </div>

          <div className="feature">
            <div className="feature-icon">
              <div className="icon-circle">
                <Sparkles />
              </div>
            </div>
            <h4 className="feature-title">Build Portfolio</h4>
            <p className="feature-desc">Showcase your achievements</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
