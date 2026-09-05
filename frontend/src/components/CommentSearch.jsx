// frontend/src/components/CommentSearch.jsx

import React, { useState } from "react";
import { FiSearch, FiX, FiFilter } from "react-icons/fi";

const CommentSearch = ({ onSearch, onFilter, filterOptions }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    resolved: false,
    unresolved: false,
    myComments: false,
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  const handleFilterToggle = (filterName) => {
    const newFilters = {
      ...activeFilters,
      [filterName]: !activeFilters[filterName],
    };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const getFilterCount = () => {
    let count = 0;
    if (activeFilters.resolved) count++;
    if (activeFilters.unresolved) count++;
    if (activeFilters.myComments) count++;
    return count;
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchBar}>
        <FiSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search comments..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
        {searchTerm && (
          <button onClick={handleClearSearch} style={styles.clearBtn}>
            <FiX />
          </button>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            ...styles.filterBtn,
            backgroundColor:
              showFilters || getFilterCount() > 0 ? "#007bff" : "#f0f0f0",
            color: showFilters || getFilterCount() > 0 ? "white" : "#666",
          }}
        >
          <FiFilter />
          {getFilterCount() > 0 && (
            <span style={styles.filterBadge}>{getFilterCount()}</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div style={styles.filterDropdown}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>
              <input
                type="checkbox"
                checked={activeFilters.resolved}
                onChange={() => handleFilterToggle("resolved")}
                style={styles.checkbox}
              />
              <span style={styles.filterText}>✅ Resolved</span>
            </label>
            <label style={styles.filterLabel}>
              <input
                type="checkbox"
                checked={activeFilters.unresolved}
                onChange={() => handleFilterToggle("unresolved")}
                style={styles.checkbox}
              />
              <span style={styles.filterText}>🟡 Active</span>
            </label>
            <label style={styles.filterLabel}>
              <input
                type="checkbox"
                checked={activeFilters.myComments}
                onChange={() => handleFilterToggle("myComments")}
                style={styles.checkbox}
              />
              <span style={styles.filterText}>👤 My Comments</span>
            </label>
          </div>
          <div style={styles.filterActions}>
            <button
              onClick={() => {
                setActiveFilters({
                  resolved: false,
                  unresolved: false,
                  myComments: false,
                });
                onFilter({
                  resolved: false,
                  unresolved: false,
                  myComments: false,
                });
              }}
              style={styles.clearFiltersBtn}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: "15px",
    position: "relative",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px 12px",
    transition: "border-color 0.2s",
    ":focus-within": {
      borderColor: "#007bff",
      boxShadow: "0 0 0 3px rgba(0,123,255,0.1)",
    },
  },
  searchIcon: {
    color: "#999",
    fontSize: "18px",
    marginRight: "10px",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    padding: "4px 0",
    background: "transparent",
    color: "#333",
    "::placeholder": {
      color: "#999",
    },
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#999",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ":hover": {
      color: "#333",
    },
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
    position: "relative",
    marginLeft: "8px",
    flexShrink: 0,
  },
  filterBadge: {
    backgroundColor: "#dc3545",
    color: "white",
    borderRadius: "50%",
    padding: "1px 6px",
    fontSize: "10px",
    fontWeight: "bold",
    marginLeft: "4px",
  },
  filterDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    padding: "16px",
    minWidth: "200px",
    zIndex: 100,
    border: "1px solid #e9ecef",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  filterLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#333",
    cursor: "pointer",
    padding: "4px 0",
    ":hover": {
      color: "#007bff",
    },
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    accentColor: "#007bff",
  },
  filterText: {
    fontSize: "14px",
  },
  filterActions: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #eee",
    textAlign: "right",
  },
  clearFiltersBtn: {
    padding: "4px 12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    color: "#666",
    ":hover": {
      backgroundColor: "#e9ecef",
    },
  },
};

export default CommentSearch;
