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
  const normalizeStatus = (status) => (status || "").toLowerCase().replace(/[ -]/g, "_");

  const filteredPickups = useMemo(() => {
    return pickups
      .filter((item) => {
        if (selectedFilter !== "all") {
          const itemStatus = normalizeStatus(item.status);
          if (itemStatus !== selectedFilter) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.created_at || b.pickup_date) - new Date(a.created_at || a.pickup_date));
  }, [pickups, selectedFilter]);

  // Tab counts
  const counts = useMemo(() => {
    const res = { all: pickups.length };
    pickups.forEach((p) => {
      const st = normalizeStatus(p.status);
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
            {selectedFilter !== "all"
              ? "Try selecting another status filter."
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
