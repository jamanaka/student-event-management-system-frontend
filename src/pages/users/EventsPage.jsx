import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  Calendar,
  MapPin,
  Grid3x3,
  List,
  Sparkles,
  TrendingUp,
  Clock,
  SlidersHorizontal,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  FaMagic,
  FaBook,
  FaBirthdayCake,
  FaFutbol,
  FaTheaterMasks,
  FaBriefcase,
  FaTools,
  FaStar,
  FaMusic,
  FaPaintBrush,
  FaCode,
  FaFlask,
} from "react-icons/fa";
import DashboardLayout from "../../components/common/DashboardLayout";
import PublicLayout from "../../components/common/PublicLayout";
import EventCard from "../../components/common/EventCard";
// import EventCardList from '../../components/common/EventCardList';
import SkeletonLoader from "../../components/common/SkeletonLoader";
import { useEventStore } from "../../store/useEventStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useRSVPStore } from "../../store/useRSVPStore";
import "../../css/users/EventsPage.css";

const EventsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const { rsvps } = useRSVPStore();
  const {
    events,
    loading,
    fetchEvents,
    pagination,
    stats: eventStats,
    // trendingEvents
  } = useEventStore();

  const totalPages = pagination.totalPages || 1;
  const searchRef = useRef(null);

  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    status: "approved",
    sort: searchParams.get("sort") || "date",
    location: searchParams.get("location") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    capacity: searchParams.get("capacity") || "",
    tags: searchParams.get("tags") ? searchParams.get("tags").split(",") : [],
  });

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(localFilters.search);
  const [viewMode, setViewMode] = useState("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showTrendingEvents, setShowTrendingEvents] = useState(true);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [selectedTags, setSelectedTags] = useState(localFilters.tags || []);

  const categories = [
    {
      value: "",
      label: "All Categories",
      icon: FaMagic,
      color: "#6366f1",
      desc: "Show all events",
    },
    {
      value: "academic",
      label: "Academic",
      icon: FaBook,
      color: "#3b82f6",
      desc: "Lectures, seminars, educational workshops",
    },
    {
      value: "social",
      label: "Social",
      icon: FaBirthdayCake,
      color: "#ec4899",
      desc: "Parties, mixers, networking events",
    },
    {
      value: "sports",
      label: "Sports",
      icon: FaFutbol,
      color: "#10b981",
      desc: "Games, tournaments, fitness activities",
    },
    {
      value: "cultural",
      label: "Cultural",
      icon: FaTheaterMasks,
      color: "#f59e0b",
      desc: "Art shows, performances, cultural festivals",
    },
    {
      value: "career",
      label: "Career",
      icon: FaBriefcase,
      color: "#8b5cf6",
      desc: "Job fairs, networking, career workshops",
    },
    {
      value: "workshop",
      label: "Workshop",
      icon: FaTools,
      color: "#06b6d4",
      desc: "Hands-on learning, skill development",
    },
    {
      value: "music",
      label: "Music",
      icon: FaMusic,
      color: "#f43f5e",
      desc: "Concerts, jam sessions, music events",
    },
    {
      value: "tech",
      label: "Technology",
      icon: FaCode,
      color: "#0ea5e9",
      desc: "Tech talks, hackathons, coding events",
    },
    {
      value: "arts",
      label: "Arts",
      icon: FaPaintBrush,
      color: "#8b5cf6",
      desc: "Art exhibitions, creative workshops",
    },
    {
      value: "science",
      label: "Science",
      icon: FaFlask,
      color: "#10b981",
      desc: "Science fairs, lab tours, research talks",
    },
    {
      value: "other",
      label: "Other",
      icon: FaStar,
      color: "#6b7280",
      desc: "Any other type of event",
    },
  ];

  const popularTags = [
    "Free",
    "Food Provided",
    "Beginner-Friendly",
    "Networking",
    "Interactive",
    "Online",
    "Speaker Session",
    "Hands-on",
    "Student-Run",
    "Professional",
  ];

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const now = new Date();

    // Use stats from store/backend, but calculate user RSVPs locally since that depends on user data
    const userRSVPEvents = rsvps
      .map((rsvp) => (typeof rsvp.event === "string" ? null : rsvp.event))
      .filter(Boolean);
    const userUpcomingRSVPs = userRSVPEvents.filter((event) => {
      const eventDate = new Date(`${event.date}T${event.time || "00:00"}`);
      return eventDate > now;
    }).length;

    // Get most popular from current events (for display purposes)
    const mostPopularEvent = [...events].sort(
      (a, b) => (b.currentAttendees || 0) - (a.currentAttendees || 0)
    )[0];

    // Calculate this week from current events (for display)
    const thisWeek = events.filter((e) => {
      const eventDate = new Date(`${e.date}T${e.time || "00:00"}`);
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate > now && eventDate <= weekFromNow;
    }).length;

    return {
      total: eventStats.totalEvents || 0,
      upcoming: eventStats.upcomingEvents || 0,
      thisWeek,
      today: eventStats.todayEvents || 0,
      mostPopularEvent,
      userUpcomingRSVPs,
      categoriesCount: eventStats.categories || 0,
      averageAttendees:
        events.length > 0
          ? Math.round(
              events.reduce((sum, e) => sum + (e.currentAttendees || 0), 0) /
                events.length
            )
          : 0,
    };
  }, [events, eventStats, rsvps]);

  const sortOptions = [
    { value: "date", label: "Date (Soonest)", icon: Calendar },
    { value: "-date", label: "Date (Latest)", icon: Calendar },
    { value: "title", label: "Title (A-Z)", icon: Star },
    { value: "-title", label: "Title (Z-A)", icon: Star },
    { value: "capacity", label: "Popularity", icon: Users },
    { value: "-capacity", label: "Most Attended", icon: TrendingUp },
  ];

  // Featured event (either trending or upcoming)
  useEffect(() => {
    if (events.length > 0) {
      const upcomingEvents = events.filter((e) => {
        const eventDate = new Date(`${e.date}T${e.time || "00:00"}`);
        return eventDate > new Date();
      });

      if (upcomingEvents.length > 0) {
        // Select a featured event: either trending or upcoming with high attendance
        const featured = upcomingEvents.sort((a, b) => {
          const scoreA = (a.currentAttendees || 0) * 2 + (a.rating || 0);
          const scoreB = (b.currentAttendees || 0) * 2 + (b.rating || 0);
          return scoreB - scoreA;
        })[0];

        setFeaturedEvent(featured);
      }
    }
  }, [events]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== localFilters.search) {
        setLocalFilters((prev) => ({ ...prev, search: searchInput }));
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Initialize page from URL on mount
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page") || "1");
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch events with filters
  useEffect(() => {
    const params = {
      ...localFilters,
      page: currentPage,
      limit: viewMode === "grid" ? 12 : 6,
      upcoming: true,
      tags: selectedTags.join(","),
    };
    fetchEvents(params);

    // Update URL params
    const newParams = new URLSearchParams();
    if (localFilters.search) newParams.set("search", localFilters.search);
    if (localFilters.category) newParams.set("category", localFilters.category);
    if (localFilters.location) newParams.set("location", localFilters.location);
    if (localFilters.startDate)
      newParams.set("startDate", localFilters.startDate);
    if (localFilters.endDate) newParams.set("endDate", localFilters.endDate);
    if (localFilters.capacity) newParams.set("capacity", localFilters.capacity);
    if (localFilters.sort !== "date") newParams.set("sort", localFilters.sort);
    if (selectedTags.length > 0) newParams.set("tags", selectedTags.join(","));
    if (currentPage > 1) newParams.set("page", currentPage.toString());
    setSearchParams(newParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters, currentPage, selectedTags, viewMode]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setLocalFilters({
      search: "",
      category: "",
      status: "approved",
      sort: "date",
      location: "",
      startDate: "",
      endDate: "",
      capacity: "",
    });
    setSelectedTags([]);
    setSearchInput("");
    setCurrentPage(1);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  const hasActiveFilters =
    localFilters.search ||
    localFilters.category ||
    localFilters.location ||
    localFilters.startDate ||
    localFilters.endDate ||
    localFilters.capacity ||
    localFilters.sort !== "date" ||
    selectedTags.length > 0;

  const handleEventUpdate = () => {
    fetchEvents({
      ...localFilters,
      page: currentPage,
      limit: viewMode === "grid" ? 12 : 6,
      upcoming: true,
      tags: selectedTags.join(","),
    });
  };

  const quickFilters = [
    { label: "Today", key: "today", icon: Calendar },
    { label: "This Week", key: "week", icon: Clock },
    { label: "Free Events", key: "free", icon: Star },
    { label: "Online", key: "online", icon: MapPin },
  ];

  const handleQuickFilter = (key) => {
    const now = new Date();
    switch (key) {
      case "today":
        const today = now.toISOString().split("T")[0];
        handleFilterChange("startDate", today);
        handleFilterChange("endDate", today);
        break;
      case "week":
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const weekFromNowStr = weekFromNow.toISOString().split("T")[0];
        handleFilterChange("startDate", now.toISOString().split("T")[0]);
        handleFilterChange("endDate", weekFromNowStr);
        break;
      case "free":
        handleTagToggle("Free");
        break;
      case "online":
        handleTagToggle("Online");
        break;
      default:
        break;
    }
  };

  const Layout = isAuthenticated ? DashboardLayout : PublicLayout;

  return (
    <Layout title={isAuthenticated ? "Browse Events" : undefined}>
      <div className="events-page">
        {/* Hero Section */}
        <div className="events-hero">
          <div className="events-hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Explore Campus Events</span>
            </div>
            <h1 className="hero-title">Discover Amazing Events</h1>
            <p className="hero-subtitle">
              Join thousands of students at exciting campus events, workshops,
              and social gatherings
            </p>
          </div>

          {/* Hero Stats */}
          <div className="hero-stats">
            {[
              {
                value: stats.total,
                label: "Total Events",
                icon: TrendingUp,
                color: "#3b82f6",
              },
              {
                value: stats.upcoming,
                label: "Upcoming",
                icon: Calendar,
                color: "#10b981",
              },
              {
                value: stats.today,
                label: "Today",
                icon: Clock,
                color: "#f59e0b",
              },
              {
                value: stats.categoriesCount,
                label: "Categories",
                icon: Target,
                color: "#8b5cf6",
              },
            ]
              .filter(Boolean)
              .map((stat, index) => (
                <div
                  key={index}
                  className="hero-stat-item"
                  style={{ "--stat-color": stat.color }}
                >
                  <div className="hero-stat-icon-wrapper">
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <div className="hero-stat-value">{stat.value}</div>
                    <div className="hero-stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Featured Event (if available) */}
        {featuredEvent && showTrendingEvents && (
          <div className="featured-event-section">
            <div className="featured-event-header">
              <h2>
                <Zap size={24} />
                Featured Event
                <span className="featured-badge">Hot</span>
              </h2>
              <button
                onClick={() => setShowTrendingEvents(false)}
                className="hide-featured-btn"
              >
                <EyeOff size={18} />
                Hide
              </button>
            </div>
            <div className="featured-event-card">
              {featuredEvent.imageUrl && (
                <div className="featured-event-image">
                  <img src={featuredEvent.imageUrl} alt={featuredEvent.title} />
                </div>
              )}
              <div className="featured-event-content">
                <div className="featured-badge">Featured</div>
                <h3 className="featured-event-title">{featuredEvent.title}</h3>
                <p className="featured-event-desc">
                  {featuredEvent.description?.substring(0, 150)}...
                </p>
                <div className="featured-event-meta">
                  <div className="featured-meta-item">
                    <Calendar size={18} />
                    <span>
                      {new Date(featuredEvent.date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="featured-meta-item">
                    <Clock size={18} />
                    <span>{featuredEvent.time}</span>
                  </div>
                  <div className="featured-meta-item">
                    <MapPin size={18} />
                    <span>{featuredEvent.location}</span>
                  </div>
                  <div className="featured-meta-item">
                    <Users size={18} />
                    <span>{featuredEvent.currentAttendees || 0} attending</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/events/${featuredEvent._id}`)}
                  className="featured-event-btn"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="category-filters-section">
          <div className="section-header">
            <h3>
              <Target size={24} />
              Browse by Category
            </h3>
          </div>

          <div className="category-chips">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleFilterChange("category", cat.value)}
                className={`category-chip ${
                  localFilters.category === cat.value ? "active" : ""
                }`}
                title={cat.desc}
                style={{ "--chip-color": cat.color }}
              >
                <span className="category-icon">
                  <cat.icon size={20} />
                </span>
                <span>{cat.label}</span>
                {localFilters.category === cat.value && (
                  <span className="chip-indicator"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Main Filters */}
        <div className="main-filters">
          <div className="search-bar-container">
            <div className="search-bar">
              <Search className="search-icon" size={22} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search events by title, description, or organizer..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    handleFilterChange("search", "");
                  }}
                  className="clear-search-btn"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <div className="filter-controls">
              <div className="view-toggle">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  title="Grid View"
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  title="List View"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="results-header">
          <div className="results-info">
            <div className="results-count">
              {loading ? (
                <span className="loading-text">
                  <RefreshCw size={18} className="loading-spinner" />
                  Loading events...
                </span>
              ) : (
                <>
                  <span className="count-number">
                    {pagination.total || events.length}
                  </span>
                  <span className="count-label">
                    {" "}
                    event{(pagination.total || events.length) !== 1
                      ? "s"
                      : ""}{" "}
                    found
                  </span>
                  {hasActiveFilters && (
                    <span className="filter-indicator">
                      <Filter size={16} />
                      <span>
                        {Object.values(localFilters).filter(
                          (v) => v && v !== "approved" && v !== "date"
                        ).length + selectedTags.length}{" "}
                        filter(s) active
                      </span>
                    </span>
                  )}
                </>
              )}
            </div>

            {totalPages > 1 && !loading && (
              <div className="pagination-info">
                <span className="page-info">
                  Page <strong>{pagination.currentPage || currentPage}</strong>{" "}
                  of <strong>{totalPages}</strong>
                </span>
                <div className="results-stats">
                  <span className="stat-item">
                    <Users size={14} />
                    {stats.averageAttendees} avg attendance
                  </span>
                  <span className="stat-item">
                    <Calendar size={14} />
                    {stats.upcoming} upcoming
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Events Display */}
        {loading ? (
          <div className="events-loading">
            <SkeletonLoader
              type={viewMode === "grid" ? "card" : "list"}
              count={viewMode === "grid" ? 6 : 3}
            />
          </div>
        ) : events.length > 0 ? (
          <>
            <div className={`events-container events-${viewMode}`}>
              {events.map((event) =>
                viewMode === "grid" ? (
                  <EventCard
                    key={event._id}
                    event={event}
                    showStatus={false}
                    onEventUpdate={handleEventUpdate}
                  />
                ) : (
                  <EventCard
                    key={event._id}
                    event={event}
                    onEventUpdate={handleEventUpdate}
                  />
                )
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Calendar size={80} />
              <div className="empty-state-glow"></div>
            </div>
            <h3 className="empty-state-title">
              {hasActiveFilters
                ? "No events match your filters"
                : "No upcoming events found"}
            </h3>
            <p className="empty-state-text">
              {hasActiveFilters
                ? "Try adjusting your filters or search terms"
                : "Check back soon for new events or create your own!"}
            </p>
            <div className="empty-state-actions">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="empty-state-btn primary"
                >
                  <RefreshCw size={18} />
                  Clear All Filters
                </button>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => navigate("/events/create")}
                  className="empty-state-btn secondary"
                >
                  <Sparkles size={18} />
                  Create Your First Event
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => {
                const newPage = Math.max(
                  1,
                  (pagination.currentPage || currentPage) - 1
                );
                setCurrentPage(newPage);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={(pagination.currentPage || currentPage) === 1}
              className="pagination-btn prev"
            >
              <ChevronUp size={18} style={{ transform: "rotate(-90deg)" }} />
              Previous
            </button>

            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const current = pagination.currentPage || currentPage;
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (current <= 3) {
                  pageNum = i + 1;
                } else if (current >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = current - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`pagination-btn ${
                      current === pageNum ? "active" : ""
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 &&
                (pagination.currentPage || currentPage) < totalPages - 2 && (
                  <>
                    <span className="pagination-ellipsis">...</span>
                    <button
                      onClick={() => {
                        setCurrentPage(totalPages);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="pagination-btn"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
            </div>

            <button
              onClick={() => {
                const newPage = Math.min(
                  totalPages,
                  (pagination.currentPage || currentPage) + 1
                );
                setCurrentPage(newPage);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={(pagination.currentPage || currentPage) === totalPages}
              className="pagination-btn next"
            >
              Next
              <ChevronUp size={18} style={{ transform: "rotate(90deg)" }} />
            </button>
          </div>
        )}

        {/* Quick Create Button */}
        {isAuthenticated && (
          <button
            onClick={() => navigate("/events/create")}
            className="floating-create-btn"
            title="Create New Event"
          >
            <Sparkles size={24} />
            Create
          </button>
        )}
      </div>
    </Layout>
  );
};

export default EventsPage;
