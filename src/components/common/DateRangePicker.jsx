import React, { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import '../../css/common/DateRangePicker.css';

const DateRangePicker = ({ 
  value, 
  onChange, 
  className = "",
  showPreview = true,
  showClear = true,
  compact = false,
  minDate = null,
  maxDate = null,
  placeholder = {
    start: "Start date",
    end: "End date"
  }
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleStartDateChange = (e) => {
    const newStart = e.target.value ? new Date(e.target.value) : null;
    
    // Ensure end date is not before start date
    let newEnd = value.end;
    if (newStart && value.end && newStart > value.end) {
      newEnd = newStart;
    }
    
    onChange({
      start: newStart,
      end: newEnd
    });
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value ? new Date(e.target.value) : null;
    
    // Ensure end date is not before start date
    if (value.start && newEnd && value.start > newEnd) {
      return; // Don't update if invalid
    }
    
    onChange({
      ...value,
      end: newEnd
    });
  };

  const handleClear = () => {
    onChange({
      start: null,
      end: null
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getValidationClass = () => {
    if (value.start && value.end) {
      return value.start <= value.end ? 'valid' : 'invalid';
    }
    return '';
  };

  return (
    <div className={`date-range-picker ${className} ${compact ? 'compact' : ''} ${showClear ? 'with-clear' : ''}`}>
      <div 
        className={`date-input-group ${isFocused ? 'focused' : ''} ${getValidationClass()}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <Calendar size={16} className="date-icon" />
        
        <input
          type="date"
          value={value.start ? value.start.toISOString().split('T')[0] : ''}
          onChange={handleStartDateChange}
          className="date-input"
          placeholder={placeholder.start}
          min={minDate ? minDate.toISOString().split('T')[0] : undefined}
          max={maxDate ? maxDate.toISOString().split('T')[0] : undefined}
          onFocus={(e) => e.target.showPicker?.()}
        />
        
        <span className="date-separator">to</span>
        
        <input
          type="date"
          value={value.end ? value.end.toISOString().split('T')[0] : ''}
          onChange={handleEndDateChange}
          className="date-input"
          placeholder={placeholder.end}
          min={value.start ? value.start.toISOString().split('T')[0] : minDate ? minDate.toISOString().split('T')[0] : undefined}
          max={maxDate ? maxDate.toISOString().split('T')[0] : undefined}
          disabled={!value.start}
          onFocus={(e) => e.target.showPicker?.()}
        />
        
        {showClear && (value.start || value.end) && (
          <button
            type="button"
            onClick={handleClear}
            className="date-clear-btn"
            aria-label="Clear dates"
            title="Clear dates"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {showPreview && (value.start || value.end) && (
        <div className="date-range-preview">
          <span>
            {value.start ? formatDate(value.start) : 'Start date'} 
            {value.end ? ` → ${formatDate(value.end)}` : ''}
          </span>
          {value.start && value.end && value.start <= value.end && (
            <span className="date-range-days">
              • {(Math.ceil((value.end - value.start) / (1000 * 60 * 60 * 24)) + 1)} days
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;