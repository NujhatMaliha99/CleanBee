import React from "react";

export default function ApprovalFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  areaFilter,
  onAreaChange,
  sortBy,
  onSortChange,
  onResetFilters,
  statusOptions = ["all", "pending", "approved", "rejected", "action_needed"],
  areaOptions = ["all", "Banani", "Dhanmondi", "Gulshan", "Uttara", "Mirpur", "Mohammadpur", "Downtown"],
}) {
  const isFiltered =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    dateFilter !== "all" ||
    areaFilter !== "all" ||
    sortBy !== "newest";

  return (
    <div className="admin-filters-container">
      <div className="admin-filters-grid">
        {/* Search Bar */}
        <div className="admin-filter-item search-item">
          <label htmlFor="admin-search-input" className="filter-label">
            Search
          </label>
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="admin-search-input"
              type="text"
              className="admin-input search-input"
              placeholder="Search by name, ID, location, waste..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => onSearchChange("")}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="admin-filter-item">
          <label htmlFor="admin-status-select" className="filter-label">
            Status
          </label>
          <select
            id="admin-status-select"
            className="admin-select"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all"
                  ? "All Statuses"
                  : opt === "action_needed"
                  ? "Action Needed"
                  : opt.charAt(0).toUpperCase() + opt.slice(1).replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Area Filter */}
        <div className="admin-filter-item">
          <label htmlFor="admin-area-select" className="filter-label">
            Area / Location
          </label>
          <select
            id="admin-area-select"
            className="admin-select"
            value={areaFilter}
            onChange={(e) => onAreaChange(e.target.value)}
          >
            {areaOptions.map((area) => (
              <option key={area} value={area}>
                {area === "all" ? "All Areas" : area}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="admin-filter-item">
          <label htmlFor="admin-date-select" className="filter-label">
            Submission Date
          </label>
          <select
            id="admin-date-select"
            className="admin-select"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="admin-filter-item">
          <label htmlFor="admin-sort-select" className="filter-label">
            Sort Order
          </label>
          <select
            id="admin-sort-select"
            className="admin-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {isFiltered && (
        <div className="admin-filters-actions">
          <button
            type="button"
            className="admin-btn admin-btn-ghost btn-sm"
            onClick={onResetFilters}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
