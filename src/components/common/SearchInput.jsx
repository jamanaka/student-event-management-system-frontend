import React from 'react';
import { Search } from 'lucide-react';
import '../../css/common/SearchInput.css';

const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`search-input-wrapper ${className}`}>
      <div className="search-input-container">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
      </div>
    </div>
  );
};

export default SearchInput;