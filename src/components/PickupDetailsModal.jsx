import PickupStatusBadge from "./PickupStatusBadge";
import "./PickupDetailsModal.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export default function PickupDetailsModal({ pickup, isOpen, onClose, onCancelClick }) {
  if (!isOpen || !pickup) return null;

  const formatDate = (d) => {
    if (!d) return "Not specified";
    const dateObj = new Date(d);
    if (Number.isNaN(dateObj.getTime())) return d;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (t) => {
    if (!t) return "Not specified";
    if (t.includes(":")) {
      const [h, m] = t.split(":");
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    }
    return t;
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http") || path.startsWith("data:")) return path;
    // Laravel storage url
    const cleanPath = path.replace(/^public\//, "");
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  const imageUrl = getImageUrl(pickup.image_path || pickup.previewUrl || pickup.image);

  return (
    <div className="pickup-details-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pickup-details-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pickup-details-header">
          <div className="pickup-details-title-area">
            <div className="pickup-details-id-row">
              <span className="pickup-details-id">Request #{pickup.id}</span>
              <PickupStatusBadge status={pickup.status} size="large" />
            </div>
            <p className="pickup-details-created">
              Submitted on {formatDate(pickup.created_at || new Date().toISOString())}
            </p>
          </div>
          <button className="pickup-details-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="pickup-details-body">
          {/* Main Grid */}
          <div className="pickup-details-grid">
            {/* Waste Specs Card */}
            <div className="pickup-info-box">
              <span className="pickup-info-label">Waste Information</span>
              <div className="pickup-info-main">
                <span className="waste-category-tag">{pickup.waste_type}</span>
                <span className="waste-quantity-highlight">
                  {pickup.quantity} {pickup.quantity_unit || "kg"}
                </span>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="pickup-info-box">
              <span className="pickup-info-label">Scheduled Pickup</span>
              <div className="pickup-info-schedule">
                <div className="schedule-item">
                  <span className="sched-icon">📅</span>
                  <span>{formatDate(pickup.pickup_date)}</span>
                </div>
                <div className="schedule-item">
                  <span className="sched-icon">⏰</span>
                  <span>{formatTime(pickup.pickup_time)}</span>
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="pickup-info-box pickup-info-box--full">
              <span className="pickup-info-label">Pickup Address & Contact</span>
              <div className="address-contact-wrap">
                <div className="location-row">
                  <span className="loc-pin">📍</span>
                  <span className="loc-text">{pickup.pickup_address || "No address provided"}</span>
                </div>
                <div className="contact-row">
                  <span className="contact-icon">📞</span>
                  <span>{pickup.contact_phone || "No contact phone"}</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {pickup.instructions && (
              <div className="pickup-info-box pickup-info-box--full">
                <span className="pickup-info-label">Special Instructions</span>
                <p className="instructions-text">{pickup.instructions}</p>
              </div>
            )}

            {/* Assigned Volunteer (if any) */}
            {pickup.assigned_volunteer && (
              <div className="pickup-info-box pickup-info-box--full volunteer-assigned-card">
                <span className="pickup-info-label">Assigned Volunteer</span>
                <div className="vol-info-row">
                  <div className="vol-avatar">
                    {pickup.assigned_volunteer.first_name?.charAt(0) || "V"}
                  </div>
                  <div>
                    <h4>
                      {pickup.assigned_volunteer.first_name} {pickup.assigned_volunteer.last_name || ""}
                    </h4>
                    {pickup.assigned_volunteer.phone && (
                      <p className="vol-phone">📞 {pickup.assigned_volunteer.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Photo Preview if uploaded */}
            {imageUrl && (
              <div className="pickup-info-box pickup-info-box--full">
                <span className="pickup-info-label">Uploaded Waste Photo</span>
                <div className="pickup-photo-preview-wrap">
                  <img
                    src={imageUrl}
                    alt={`Waste for pickup #${pickup.id}`}
                    className="pickup-modal-photo"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pickup-details-footer">
          {pickup.status === "pending" && onCancelClick && (
            <button
              className="pickup-modal-cancel-action-btn"
              onClick={() => {
                onClose();
                onCancelClick(pickup);
              }}
            >
              Cancel This Request
            </button>
          )}
          <button className="pickup-modal-done-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
