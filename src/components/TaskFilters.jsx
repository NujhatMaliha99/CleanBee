import "./TaskFilters.css";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "plastic", label: "Plastic" },
  { value: "organic", label: "Organic" },
  { value: "paper", label: "Paper" },
  { value: "e-waste", label: "E-Waste" },
  { value: "glass", label: "Glass" },
  { value: "metal", label: "Metal" },
  { value: "mixed", label: "Mixed" },
];

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  pickupDate,
  onPickupDateChange,
  sortBy,
  onSortChange,
  onReset,
}) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    categoryFilter !== "all" ||
    Boolean(pickupDate) ||
    sortBy !== "newest";

  return (
    <div className="task-filters-card">
      <div className="task-filters-row">
        {/* Search */}
        <div className="filter-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by request ID or address..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="filter-search-clear"
              onClick={() => onSearchChange("")}
            >
              &times;
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="filter-select-group">
          <label htmlFor="cat-filter-select">Category:</label>
          <select
            id="cat-filter-select"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-group">
          <label htmlFor="pickup-date-filter">Pickup date:</label>
          <input
            id="pickup-date-filter"
            type="date"
            value={pickupDate}
            onChange={(event) => onPickupDateChange(event.target.value)}
            className="filter-select"
          />
        </div>

        {/* Sort Select */}
        <div className="filter-select-group">
          <label htmlFor="task-sort-select">Sort By:</label>
          <select
            id="task-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest Request</option>
            <option value="pickup_asc">Earliest Pickup</option>
            <option value="distance_asc">Nearest Location</option>
          </select>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button type="button" className="filter-reset-btn" onClick={onReset}>
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
