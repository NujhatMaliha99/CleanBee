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
  sortBy,
  onSortChange,
  areas = [],
  selectedArea,
  onAreaChange,
  onReset,
}) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    categoryFilter !== "all" ||
    (selectedArea && selectedArea !== "all") ||
    sortBy !== "date_asc";

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
            placeholder="Search by area, requester, or waste type..."
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

        {/* Area dropdown (if areas provided) */}
        {areas.length > 0 && (
          <div className="filter-select-group">
            <label htmlFor="area-filter-select">Area:</label>
            <select
              id="area-filter-select"
              value={selectedArea || "all"}
              onChange={(e) => onAreaChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Areas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Select */}
        <div className="filter-select-group">
          <label htmlFor="task-sort-select">Sort By:</label>
          <select
            id="task-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select"
          >
            <option value="date_asc">Earliest Date</option>
            <option value="date_desc">Latest Date</option>
            <option value="quantity_desc">Highest Volume</option>
            <option value="quantity_asc">Lowest Volume</option>
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
