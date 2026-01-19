import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { useEventStore } from '../../store/useEventStore';
import '../../css/users/CreateEventPage.css';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedEvent, loading, fetchEventById, updateEvent } = useEventStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    location: '',
    category: '',
    capacity: 10,
    contactEmail: '',
    contactPhone: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'career', label: 'Career' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id, fetchEventById]);

  useEffect(() => {
    if (selectedEvent) {
      // Format start date for input
      const startDate = new Date(selectedEvent.date);
      const formattedStartDate = startDate.toISOString().split('T')[0];
      
      // Format end date for input
      const endDate = selectedEvent.endDate ? new Date(selectedEvent.endDate) : null;
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';
      
      // Format time for input (HH:MM)
      const startTimeValue = selectedEvent.time || '';
      const endTimeValue = selectedEvent.endTime || '';
      
      setFormData({
        title: selectedEvent.title || '',
        description: selectedEvent.description || '',
        date: formattedStartDate,
        time: startTimeValue,
        endDate: formattedEndDate,
        endTime: endTimeValue,
        location: selectedEvent.location || '',
        category: selectedEvent.category || '',
        capacity: selectedEvent.capacity || 10,
        contactEmail: selectedEvent.contactEmail || '',
        contactPhone: selectedEvent.contactPhone || '',
        imageUrl: selectedEvent.imageUrl || '',
      });
    }
  }, [selectedEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (!formData.date) newErrors.date = 'Start date is required';
    if (!formData.time) newErrors.time = 'Start time is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    // End date/time validation
    if (formData.endDate && formData.endTime) {
      if (formData.date && formData.time) {
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        const minDurationMs = 15 * 60 * 1000; // 15 minutes in milliseconds
        const timeDifference = endDateTime - startDateTime;
        
        if (timeDifference < minDurationMs) {
          newErrors.endDate = 'End date and time must be at least 15 minutes after start date and time';
          newErrors.endTime = 'End date and time must be at least 15 minutes after start date and time';
        }
      }
      
      if (formData.date && formData.endDate < formData.date) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const success = await updateEvent(id, formData);
    if (success) {
      navigate(`/events/${id}`);
    }
  };

  if (loading && !selectedEvent) {
    return (
      <DashboardLayout title="Edit Event">
        <Spinner />
      </DashboardLayout>
    );
  }

  if (!selectedEvent) {
    return (
      <DashboardLayout title="Event Not Found">
        <div className="event-not-found">
          <h2>Event not found</h2>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Event">
      <div className="create-event-page">
        <button onClick={() => navigate(`/events/${id}`)} className="back-link">
          <ArrowLeft size={20} />
          Back to Event
        </button>

        <div className="form-container">
          <div className="form-header">
            <h1>Edit Event</h1>
            <p>Update the details of your event below.</p>
          </div>

          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-section">
              <h2 className="section-title">Basic Information</h2>

              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Event Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="e.g., Spring Tech Meetup"
                  required
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  rows={6}
                  placeholder="Provide a detailed description of your event..."
                  required
                />
                <p className="field-hint">
                  {formData.description.length} characters (minimum 50)
                </p>
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`form-select ${errors.category ? 'error' : ''}`}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="capacity" className="form-label">
                    Capacity <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={`form-input ${errors.capacity ? 'error' : ''}`}
                    min="1"
                    required
                  />
                  {errors.capacity && <span className="error-message">{errors.capacity}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">
                <Calendar size={20} />
                Date & Location
              </h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date" className="form-label">
                    <Calendar size={16} />
                    Start Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`form-input ${errors.date ? 'error' : ''}`}
                    required
                  />
                  {errors.date && <span className="error-message">{errors.date}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="time" className="form-label">
                    <Clock size={16} />
                    Start Time <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`form-input ${errors.time ? 'error' : ''}`}
                    required
                  />
                  {errors.time && <span className="error-message">{errors.time}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">
                    <Calendar size={16} />
                    End Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`form-input ${errors.endDate ? 'error' : ''}`}
                    min={formData.date || ''}
                    required
                  />
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="endTime" className="form-label">
                    <Clock size={16} />
                    End Time <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={`form-input ${errors.endTime ? 'error' : ''}`}
                    required
                  />
                  {errors.endTime && <span className="error-message">{errors.endTime}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`form-input ${errors.location ? 'error' : ''}`}
                  placeholder="e.g., Main Auditorium, Building A"
                  required
                />
                {errors.location && <span className="error-message">{errors.location}</span>}
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">Contact Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactEmail" className="form-label">
                    Contact Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className={`form-input ${errors.contactEmail ? 'error' : ''}`}
                    placeholder="contact@example.com"
                    required
                  />
                  {errors.contactEmail && <span className="error-message">{errors.contactEmail}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone" className="form-label">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">Event Image (Optional)</h2>

              <div className="form-group">
                <label htmlFor="imageUrl" className="form-label">
                  Image URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="field-hint">
                  Provide a direct link to an image for your event
                </p>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(`/events/${id}`)}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditEventPage;

