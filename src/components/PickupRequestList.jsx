import { useState, useMemo } from "react";
import PickupRequestCard from "./PickupRequestCard";
import "./PickupRequestList.css";

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function PickupRequestList({
  pickups = [],
  loading = false,
  error = "",
  onViewDetails,
  onCancel,
  onRefresh,
}) {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Compute filtered & sorted pickups
  const filteredPickups = useMemo(() => {
    return pickups
      .filter((item) => {
        // Status filter
        if (selectedFilter !== "all") {
          const itemStatus = (item.status || "").toLowerCase().replace("-", "_");
          if (itemStatus !== selectedFilter) return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = String(item.id).includes(q);
          const matchWaste = (item.waste_type || "").toLowerCase().includes(q);
          const matchAddress = (item.pickup_address || "").toLowerCase().includes(q);
          return matchId || matchWaste || matchAddress;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at || b.pickup_date) - new Date(a.created_at || a.pickup_date);
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at || a.pickup_date) - new Date(b.created_at || b.pickup_date);
        }
        if (sortBy === "quantity") {
          return Number(b.quantity || 0) - Number(a.quantity || 0);
        }
        return 0;
      });
  }, [pickups, selectedFilter, searchQuery, sortBy]);

  // Tab counts
  const counts = useMemo(() => {
    const res = { all: pickups.length };
    pickups.forEach((p) => {
      const st = (p.status || "").toLowerCase().replace("-", "_");
      res[st] = (res[st] || 0) + 1;
    });
    return res;
  }, [pickups]);

  return (
    <div className="pickup-list-container">
      {/* Controls Bar */}
      <div className="pickup-list-controls">
        {/* Filter Tabs */}
        <div className="pickup-tabs-wrapper">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`pickup-tab-btn ${selectedFilter === tab.key ? "active" : ""}`}
              onClick={() => setSelectedFilter(tab.key)}
            >
              {tab.label}
              <span className="pickup-tab-count">{counts[tab.key] || 0}</span>
            </button>
          ))}
        </div>

        {/* Search & Sort Bar */}
        <div className="pickup-search-sort-bar">
          <div className="pickup-search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by ID, waste type, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pickup-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="pickup-search-clear"
                onClick={() => setSearchQuery("")}
              >
                &times;
              </button>
            )}
          </div>

          <div className="pickup-sort-wrap">
            <label htmlFor="pickup-sort-select">Sort:</label>
            <select
              id="pickup-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pickup-sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="quantity">Largest Quantity</option>
            </select>
          </div>
        </div>
      </div>

      {/* States: Loading, Error, Empty, List */}
      {loading ? (
        <div className="pickup-list-state pickup-list-state--loading">
          <div className="pickup-spinner" />
          <p>Loading your pickup requests...</p>
        </div>
      ) : error ? (
        <div className="pickup-list-state pickup-list-state--error">
          <p className="error-text">⚠️ {error}</p>
          {onRefresh && (
            <button className="pickup-refresh-btn" onClick={onRefresh}>
              Try Again
            </button>
          )}
        </div>
      ) : filteredPickups.length === 0 ? (
        <div className="pickup-list-state pickup-list-state--empty">
          <div className="empty-icon">📦</div>
          <h4>No pickup requests found</h4>
          <p>
            {searchQuery || selectedFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "You have not submitted any pickup requests yet."}
          </p>
        </div>
      ) : (
        <div className="pickup-grid">
          {filteredPickups.map((pickup) => (
            <PickupRequestCard
              key={pickup.id}
              pickup={pickup}
              onViewDetails={onViewDetails}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
