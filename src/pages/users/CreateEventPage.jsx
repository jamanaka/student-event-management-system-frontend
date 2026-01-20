import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Mail, Phone, Image as ImageIcon, Sparkles, FileText, Users, Clock, Globe, Building, Mic, Camera, Info, CheckCircle, AlertCircle, X, Eye } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useEventStore } from '../../store/useEventStore';
import { FaBook, FaBirthdayCake, FaFutbol, FaTheaterMasks, FaBriefcase, FaTools, FaStar, FaMusic, FaPaintBrush, FaCode, FaFlask } from 'react-icons/fa';
import '../../css/users/CreateEventPage.css';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { createEvent, loading } = useEventStore();

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
    isOnline: false,
    tags: [],
    customTag: '',
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { value: 'academic', label: 'Academic', icon: FaBook, color: '#3b82f6', desc: 'Lectures, seminars, educational workshops' },
    { value: 'social', label: 'Social', icon: FaBirthdayCake, color: '#ec4899', desc: 'Parties, mixers, networking events' },
    { value: 'sports', label: 'Sports', icon: FaFutbol, color: '#10b981', desc: 'Games, tournaments, fitness activities' },
    { value: 'cultural', label: 'Cultural', icon: FaTheaterMasks, color: '#f59e0b', desc: 'Art shows, performances, cultural festivals' },
    { value: 'career', label: 'Career', icon: FaBriefcase, color: '#8b5cf6', desc: 'Job fairs, networking, career workshops' },
    { value: 'workshop', label: 'Workshop', icon: FaTools, color: '#06b6d4', desc: 'Hands-on learning, skill development' },
    { value: 'music', label: 'Music', icon: FaMusic, color: '#f43f5e', desc: 'Concerts, jam sessions, music events' },
    { value: 'tech', label: 'Technology', icon: FaCode, color: '#0ea5e9', desc: 'Tech talks, hackathons, coding events' },
    { value: 'arts', label: 'Arts', icon: FaPaintBrush, color: '#8b5cf6', desc: 'Art exhibitions, creative workshops' },
    { value: 'science', label: 'Science', icon: FaFlask, color: '#10b981', desc: 'Science fairs, lab tours, research talks' },
    { value: 'other', label: 'Other', icon: FaStar, color: '#6b7280', desc: 'Any other type of event' },
  ];

  const commonTags = ['Networking', 'Beginner-Friendly', 'Free', 'Food Provided', 'Professional', 'Student-Run', 'Interactive', 'Speaker Session', 'Hands-on'];

  useEffect(() => {
    if (formData.date && formData.time) {
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      if (startDateTime < new Date()) {
        setErrors(prev => ({ ...prev, date: 'Event must start in the future' }));
      } else {
        setErrors(prev => ({ ...prev, date: '' }));
      }
    }
  }, [formData.date, formData.time]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'capacity' ? Math.max(1, parseInt(value) || 1) : 
              value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCustomTagAdd = () => {
    if (formData.customTag.trim() && !formData.tags.includes(formData.customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, formData.customTag.trim()],
        customTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.trim().length < 50) {
        newErrors.description = 'Description must be at least 50 characters';
      }
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.capacity || formData.capacity < 1) {
        newErrors.capacity = 'Capacity must be at least 1';
      }
    } else if (stepNum === 2) {
      if (!formData.date) newErrors.date = 'Start date is required';
      if (!formData.time) newErrors.time = 'Start time is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (!formData.endTime) newErrors.endTime = 'End time is required';
      if (!formData.location.trim() && !formData.isOnline) {
        newErrors.location = 'Location is required for in-person events';
      }

      if (formData.date && formData.time && formData.endDate && formData.endTime) {
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        
        if (endDateTime <= startDateTime) {
          newErrors.endDate = 'End date must be after start date';
          newErrors.endTime = 'End time must be after start time';
        }
        
        if (startDateTime < new Date()) {
          newErrors.date = 'Event must start in the future';
        }
      }
    } else if (stepNum === 3) {
      if (!formData.contactEmail.trim()) {
        newErrors.contactEmail = 'Contact email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateStep(3)) {
      const eventData = {
        ...formData,
        tags: formData.tags.join(',')
      };
      
      const success = await createEvent(eventData);
      if (success) {
        navigate('/events/my-events');
      }
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const PreviewCard = () => (
    <div className="event-preview-card">
      <div className="preview-header">
        <h3>Event Preview</h3>
        <button onClick={() => setShowPreview(false)} className="preview-close">
          <X size={20} />
        </button>
      </div>
      
      <div className="preview-content">
        {formData.imageUrl && !imageError && (
          <div className="preview-image">
            <img 
              src={formData.imageUrl} 
              alt="Event preview" 
              onError={handleImageError}
            />
          </div>
        )}
        
        <div className="preview-details">
          <div className="preview-badge">
            {formData.category && categories.find(c => c.value === formData.category)?.icon && (
              React.createElement(categories.find(c => c.value === formData.category).icon, { 
                size: 16,
                style: { color: categories.find(c => c.value === formData.category)?.color }
              })
            )}
            <span style={{ color: categories.find(c => c.value === formData.category)?.color }}>
              {categories.find(c => c.value === formData.category)?.label || 'Uncategorized'}
            </span>
          </div>
          
          <h4 className="preview-title">{formData.title || 'Your Event Title'}</h4>
          
          <div className="preview-meta">
            <div className="preview-meta-item">
              <Calendar size={16} />
              <span>
                {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'Date TBD'}
              </span>
            </div>
            
            <div className="preview-meta-item">
              <Clock size={16} />
              <span>{formData.time || 'Time TBD'}</span>
            </div>
            
            <div className="preview-meta-item">
              {formData.isOnline ? <Globe size={16} /> : <MapPin size={16} />}
              <span>
                {formData.isOnline ? 'Online Event' : (formData.location || 'Location TBD')}
              </span>
            </div>
            
            <div className="preview-meta-item">
              <Users size={16} />
              <span>{formData.capacity || 10} spots</span>
            </div>
          </div>
          
          <p className="preview-description">
            {formData.description ? 
              (formData.description.length > 150 ? 
                formData.description.substring(0, 150) + '...' : 
                formData.description
              ) : 
              'Your event description will appear here'
            }
          </p>
          
          {formData.tags.length > 0 && (
            <div className="preview-tags">
              {formData.tags.slice(0, 3).map(tag => (
                <span key={tag} className="preview-tag">{tag}</span>
              ))}
              {formData.tags.length > 3 && (
                <span className="preview-tag">+{formData.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Create Event">
      <div className="create-event-page">
        <div className="create-event-header">
          <button onClick={() => navigate(-1)} className="back-link">
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <div className="header-content">
            <div className="header-badge">
              <Sparkles size={16} />
              <span>Create Amazing Events</span>
            </div>
            <h1>Create New Event</h1>
            <p>Fill in the details below to create your event. It will be reviewed by an admin before going live.</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className={`step ${stepNum === step ? 'active' : ''} ${stepNum < step ? 'completed' : ''}`}>
              <div className="step-circle">
                {stepNum < step ? <CheckCircle size={20} /> : stepNum}
              </div>
              <div className="step-label">
                {stepNum === 1 && 'Basic Info'}
                {stepNum === 2 && 'Date & Location'}
                {stepNum === 3 && 'Contact Info'}
                {stepNum === 4 && 'Review'}
              </div>
            </div>
          ))}
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="event-form">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="form-step">
                <div className="step-header">
                  <h2><FileText size={24} /> Basic Information</h2>
                  <p>Tell us about your event. Be creative and descriptive!</p>
                </div>

                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Event Title <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Mic size={20} />
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`form-input ${errors.title ? 'error' : ''}`}
                      placeholder="e.g., Spring Tech Meetup: AI & Innovation"
                      required
                    />
                  </div>
                  {errors.title && <div className="error-message"><AlertCircle size={16} /> {errors.title}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description <span className="required">*</span>
                  </label>
                  <div className="textarea-wrapper">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={`form-textarea ${errors.description ? 'error' : ''}`}
                      rows={5}
                      placeholder="Describe your event in detail. What will attendees learn or experience? Who should attend? What makes this event special?"
                      required
                    />
                    <div className="textarea-footer">
                      <div className={`char-count ${formData.description.length >= 50 ? 'valid' : ''}`}>
                        {formData.description.length} / 50 characters
                      </div>
                      <div className="word-count">
                        {formData.description.trim() ? formData.description.trim().split(/\s+/).length : 0} words
                      </div>
                    </div>
                  </div>
                  {errors.description && <div className="error-message"><AlertCircle size={16} /> {errors.description}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">
                      Category <span className="required">*</span>
                    </label>
                    <div className="category-grid">
                      {categories.map(cat => (
                        <button
                          key={cat.value}
                          type="button"
                          className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, category: cat.value }));
                            if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                          }}
                          style={{
                            borderColor: formData.category === cat.value ? cat.color : '#e5e7eb',
                            backgroundColor: formData.category === cat.value ? `${cat.color}10` : 'white'
                          }}
                        >
                          <div className="category-icon" style={{ color: cat.color }}>
                            {React.createElement(cat.icon, { size: 24 })}
                          </div>
                          <div className="category-info">
                            <span style={{ color: cat.color }}>{cat.label}</span>
                            <small>{cat.desc}</small>
                          </div>
                          {formData.category === cat.value && (
                            <div className="category-check">
                              <CheckCircle size={18} style={{ color: cat.color }} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {errors.category && <div className="error-message"><AlertCircle size={16} /> {errors.category}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="capacity" className="form-label">
                    <Users size={20} />
                    Event Capacity <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Enter maximum number of attendees"
                    min="1"
                    max="1000"
                    required
                    disabled={loading}
                    className={`form-input ${errors.capacity ? 'error' : ''}`}
                  />
                  <div className="field-hint">
                    Maximum number of attendees allowed for this event (1-1000)
                  </div>
                  {errors.capacity && <div className="error-message"><AlertCircle size={16} /> {errors.capacity}</div>}
                </div>

                {/* Tags Section */}
                <div className="form-group">
                  <label className="form-label">
                    <Info size={20} />
                    Event Tags
                  </label>
                  <div className="tags-container">
                    <div className="common-tags">
                      {commonTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          className={`tag-button ${formData.tags.includes(tag) ? 'active' : ''}`}
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                          {formData.tags.includes(tag) && <CheckCircle size={14} />}
                        </button>
                      ))}
                    </div>
                    
                    <div className="custom-tag-input">
                      <input
                        type="text"
                        value={formData.customTag}
                        onChange={(e) => setFormData(prev => ({ ...prev, customTag: e.target.value }))}
                        placeholder="Add custom tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomTagAdd())}
                      />
                      <button type="button" onClick={handleCustomTagAdd} className="add-tag-btn">
                        Add
                      </button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="selected-tags">
                        {formData.tags.map(tag => (
                          <span key={tag} className="selected-tag">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="remove-tag">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date & Location */}
            {step === 2 && (
              <div className="form-step">
                <div className="step-header">
                  <h2><Calendar size={24} /> Date & Location</h2>
                  <p>When and where will your event take place?</p>
                </div>

                <div className="event-type-toggle">
                  <button
                    type="button"
                    className={`event-type-btn ${!formData.isOnline ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, isOnline: false }))}
                  >
                    <Building size={20} />
                    In-Person
                  </button>
                  <button
                    type="button"
                    className={`event-type-btn ${formData.isOnline ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, isOnline: true, location: '' }))}
                  >
                    <Globe size={20} />
                    Online
                  </button>
                </div>

                <div className="date-time-section">
                  <div className="date-time-grid">
                    <div className="form-group">
                      <label htmlFor="date" className="form-label">
                        <Calendar size={20} />
                        Start Date <span className="required">*</span>
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
                      {errors.date && <div className="error-message"><AlertCircle size={16} /> {errors.date}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="time" className="form-label">
                        <Clock size={20} />
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
                      {errors.time && <div className="error-message"><AlertCircle size={16} /> {errors.time}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="endDate" className="form-label">
                        <Calendar size={20} />
                        End Date <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className={`form-input ${errors.endDate ? 'error' : ''}`}
                        min={formData.date || new Date().toISOString().split('T')[0]}
                        required
                      />
                      {errors.endDate && <div className="error-message"><AlertCircle size={16} /> {errors.endDate}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="endTime" className="form-label">
                        <Clock size={20} />
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
                      {errors.endTime && <div className="error-message"><AlertCircle size={16} /> {errors.endTime}</div>}
                    </div>
                  </div>
                </div>

                {!formData.isOnline && (
                  <div className="form-group">
                    <label htmlFor="location" className="form-label">
                      <MapPin size={20} />
                      Location <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Building size={20} />
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className={`form-input ${errors.location ? 'error' : ''}`}
                        placeholder="e.g., Main Auditorium, Building A, University Campus"
                        required
                      />
                    </div>
                    {errors.location && <div className="error-message"><AlertCircle size={16} /> {errors.location}</div>}
                  </div>
                )}

                {formData.isOnline && (
                  <div className="form-group">
                    <label htmlFor="location" className="form-label">
                      <Globe size={20} />
                      Online Meeting Link (Optional)
                    </label>
                    <input
                      type="url"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="https://zoom.us/j/your-meeting-id or https://meet.google.com/your-meeting"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Contact & Image */}
            {step === 3 && (
              <div className="form-step">
                <div className="step-header">
                  <h2><Mail size={24} /> Contact & Media</h2>
                  <p>How can attendees reach you? Add an image to make your event stand out!</p>
                </div>

                <div className="contact-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="contactEmail" className="form-label">
                        <Mail size={20} />
                        Contact Email <span className="required">*</span>
                      </label>
                      <div className="input-with-icon">
                        <Mail size={20} />
                        <input
                          type="email"
                          id="contactEmail"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleChange}
                          className={`form-input ${errors.contactEmail ? 'error' : ''}`}
                          placeholder="organizer@example.com"
                          required
                        />
                      </div>
                      {errors.contactEmail && <div className="error-message"><AlertCircle size={16} /> {errors.contactEmail}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="contactPhone" className="form-label">
                        <Phone size={20} />
                        Contact Phone (Optional)
                      </label>
                      <div className="input-with-icon">
                        <Phone size={20} />
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
                </div>

                <div className="image-section">
                  <div className="form-group">
                    <label htmlFor="imageUrl" className="form-label">
                      <Camera size={24} />
                      Event Image (Optional)
                      <span className="label-hint">Recommended: 1200x630px, max 5MB</span>
                    </label>
                    
                    {formData.imageUrl ? (
                      <div className="image-preview-container">
                        <div className="image-preview">
                          <img 
                            src={formData.imageUrl} 
                            alt="Event preview" 
                            onError={handleImageError}
                          />
                          {imageError && (
                            <div className="image-error">
                              <ImageIcon size={32} />
                              <span>Unable to load image</span>
                            </div>
                          )}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="remove-image-btn"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="image-upload-area">
                        <div className="upload-placeholder">
                          <ImageIcon size={48} />
                          <p>Drag & drop an image or paste a URL</p>
                          <small>Supports JPG, PNG, WebP</small>
                        </div>
                        <input
                          type="url"
                          id="imageUrl"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          className="image-url-input"
                          placeholder="https://example.com/event-image.jpg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Toggle */}
                <div className="preview-toggle">
                  <button
                    type="button"
                    className={`preview-toggle-btn ${showPreview ? 'active' : ''}`}
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye size={20} />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>

                {showPreview && <PreviewCard />}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
              <div className="form-step review-step">
                <div className="step-header">
                  <h2><CheckCircle size={24} /> Review & Submit</h2>
                  <p>Review your event details before submission</p>
                </div>

                <div className="review-summary">
                  <div className="review-section">
                    <h3><FileText size={20} /> Basic Information</h3>
                    <div className="review-item">
                      <strong>Title:</strong> {formData.title || 'Not provided'}
                    </div>
                    <div className="review-item">
                      <strong>Category:</strong> {formData.category ? categories.find(c => c.value === formData.category)?.label : 'Not selected'}
                    </div>
                    <div className="review-item">
                      <strong>Description:</strong> {formData.description ? `${formData.description.substring(0, 100)}...` : 'Not provided'}
                    </div>
                    <div className="review-item">
                      <strong>Capacity:</strong> {formData.capacity} attendees
                    </div>
                  </div>

                  <div className="review-section">
                    <h3><Calendar size={20} /> Date & Location</h3>
                    <div className="review-item">
                      <strong>Date:</strong> {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not set'}
                    </div>
                    <div className="review-item">
                      <strong>Time:</strong> {formData.time || 'Not set'} - {formData.endTime || 'Not set'}
                    </div>
                    <div className="review-item">
                      <strong>Location:</strong> {formData.isOnline ? 'Online Event' : (formData.location || 'Not provided')}
                    </div>
                  </div>

                  <div className="review-section">
                    <h3><Mail size={20} /> Contact Information</h3>
                    <div className="review-item">
                      <strong>Email:</strong> {formData.contactEmail || 'Not provided'}
                    </div>
                    {formData.contactPhone && (
                      <div className="review-item">
                        <strong>Phone:</strong> {formData.contactPhone}
                      </div>
                    )}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="review-section">
                      <h3><Info size={20} /> Tags</h3>
                      <div className="review-tags">
                        {formData.tags.map(tag => (
                          <span key={tag} className="review-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      required
                    />
                    <span>I confirm that all information provided is accurate and I agree to the event guidelines.</span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn-prev">
                  <ArrowLeft size={18} />
                  Previous
                </button>
              )}
              
              {step < 4 ? (
                <button type="button" onClick={nextStep} className="btn-next">
                  Next Step
                  <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                </button>
              ) : (
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Create Event
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateEventPage;