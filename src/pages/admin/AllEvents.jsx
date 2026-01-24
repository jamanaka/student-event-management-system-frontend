import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import EventCard from "../../components/common/EventCard";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import { useEventStore } from "../../store/useEventStore";
import "../../css/admin/AllEvents.css";

const AllEvents = () => {
  const { events, loading, fetchEvents } = useEventStore();

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    sort: "newest",
  });

  useEffect(() => {
    const params = {
      ...filters,
      limit: 50,
    };
    if (!filters.status) {
      params.status = undefined;
    }
    fetchEvents(params);
  }, [filters, fetchEvents]);

  const categories = [
    { value: "", label: "All Categories" },
    { value: "academic", label: "Academic" },
    { value: "social", label: "Social" },
    { value: "sports", label: "Sports" },
    { value: "cultural", label: "Cultural" },
    { value: "career", label: "Career" },
    { value: "workshop", label: "Workshop" },
    { value: "other", label: "Other" },
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout title="All Events" isAdmin={true}>
      <div className="admin-all-events">
        <div className="admin-filters-container">
          <div className="admin-search-bar">
            <Search className="admin-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-filter-controls">
            <div className="admin-filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="admin-filter-select"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="admin-filter-select"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-filter-group">
              <label>Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="admin-filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="date">Date (Soonest)</option>
                <option value="dateDesc">Date (Latest)</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader type="card" count={8} />
        ) : events.length > 0 ? (
          <div className="admin-events-grid">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                showStatus={true}
                adminView={true}
              />
            ))}
          </div>
        ) : (
          <div className="admin-empty-state">
            <p>No events found matching your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AllEvents;
