import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Mail, Phone, Image as ImageIcon, Sparkles, FileText, Users, Clock } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useEventStore } from '../../store/useEventStore';
import { FaBook, FaBirthdayCake, FaFutbol, FaTheaterMasks, FaBriefcase, FaTools, FaStar } from 'react-icons/fa';
import '../../css/users/CreateEventPage.css';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { createEvent, loading } = useEventStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    capacity: 10,
    contactEmail: '',
    contactPhone: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'academic', label: 'Academic', icon: FaBook, color: '#3b82f6' },
    { value: 'social', label: 'Social', icon: FaBirthdayCake, color: '#ec4899' },
    { value: 'sports', label: 'Sports', icon: FaFutbol, color: '#10b981' },
    { value: 'cultural', label: 'Cultural', icon: FaTheaterMasks, color: '#f59e0b' },
    { value: 'career', label: 'Career', icon: FaBriefcase, color: '#8b5cf6' },
    { value: 'workshop', label: 'Workshop', icon: FaTools, color: '#06b6d4' },
    { value: 'other', label: 'Other', icon: FaStar, color: '#6b7280' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
    
    // Clear error for this field
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
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
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

    // Date validation
    if (formData.date && formData.time) {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      if (eventDateTime < new Date()) {
        newErrors.date = 'Event date and time must be in the future';
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

    const success = await createEvent(formData);
    if (success) {
      navigate('/events/my-events');
    }
  };

  return (
    <DashboardLayout title="Create Event">
      <div className="create-event-page">
        <button onClick={() => navigate(-1)} className="back-link">
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="form-container">
          <div className="form-header">
            <h1>Create New Event</h1>
            <p>Fill in the details below to create your event. It will be reviewed by an admin before going live.</p>
          </div>

          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-section">
              <h2 className="section-title">
                <FileText size={20} />
                Basic Information
              </h2>

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
                  <div className="category-select-wrapper">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`form-select ${errors.category ? 'error' : ''}`}
                      required
                      style={{
                        color: formData.category ? categories.find(c => c.value === formData.category)?.color || '#1f2937' : '#6b7280'
                      }}
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {formData.category && (
                      <div 
                        className="category-select-icon"
                        style={{ color: categories.find(c => c.value === formData.category)?.color }}
                      >
                        {React.createElement(categories.find(c => c.value === formData.category)?.icon || FaStar, { size: 18 })}
                      </div>
                    )}
                  </div>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="capacity" className="form-label">
                    <Users size={16} />
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
                    Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`form-input ${errors.date ? 'error' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  {errors.date && <span className="error-message">{errors.date}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="time" className="form-label">
                    <Clock size={16} />
                    Time <span className="required">*</span>
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

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  <MapPin size={16} />
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
              <h2 className="section-title">
                <Mail size={20} />
                Contact Information
              </h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactEmail" className="form-label">
                    <Mail size={16} />
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
                    <Phone size={16} />
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
              <h2 className="section-title">
                <ImageIcon size={20} />
                Event Image (Optional)
              </h2>

              <div className="form-group">
                <label htmlFor="imageUrl" className="form-label">
                  <ImageIcon size={16} />
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
                {formData.imageUrl && (
                  <div className="image-preview">
                    <img 
                      src={formData.imageUrl} 
                      alt="Event preview" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="image-preview-error" style={{ display: 'none' }}>
                      <ImageIcon size={32} />
                      <span>Invalid image URL</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
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
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateEventPage;

