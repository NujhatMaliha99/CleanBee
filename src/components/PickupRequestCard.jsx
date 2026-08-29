import PickupStatusBadge from "./PickupStatusBadge";
import "./PickupRequestCard.css";

export default function PickupRequestCard({ pickup, onViewDetails, onCancel }) {
  const formatDate = (d) => {
    if (!d) return "";
    const dateObj = new Date(d);
    if (Number.isNaN(dateObj.getTime())) return d;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isPending = (pickup.status || "").toLowerCase() === "pending";

  return (
    <div className={`pickup-card pickup-card--${(pickup.status || "pending").toLowerCase()}`}>
      <div className="pickup-card__header">
        <div className="pickup-card__id-group">
          <span className="pickup-card__id">#{pickup.id}</span>
          <span className="pickup-card__waste-type">{pickup.waste_type}</span>
        </div>
        <PickupStatusBadge status={pickup.status} />
      </div>

      <div className="pickup-card__body">
        <div className="pickup-card__meta-item">
          <span className="meta-icon">⚖️</span>
          <span className="meta-value">
            {pickup.quantity} {pickup.quantity_unit || "kg"}
          </span>
        </div>

        <div className="pickup-card__meta-item">
          <span className="meta-icon">📅</span>
          <span className="meta-value">
            {formatDate(pickup.pickup_date)} at {pickup.pickup_time || "N/A"}
          </span>
        </div>

        <div className="pickup-card__meta-item pickup-card__meta-item--address">
          <span className="meta-icon">📍</span>
          <span className="meta-value truncate" title={pickup.pickup_address}>
            {pickup.pickup_address}
          </span>
        </div>
      </div>

      <div className="pickup-card__actions">
        <button
          type="button"
          className="pickup-card__btn pickup-card__btn--details"
          onClick={() => onViewDetails(pickup)}
        >
          View Details
        </button>

        {isPending && onCancel && (
          <button
            type="button"
            className="pickup-card__btn pickup-card__btn--cancel"
            onClick={() => onCancel(pickup)}
            title="Cancel this pickup"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
