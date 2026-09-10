import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cancelPickup, getMyPickups } from "../services/pickupService";
import PickupRequestList from "./PickupRequestList";
import PickupDetailsModal from "./PickupDetailsModal";
import CancelPickupModal from "./CancelPickupModal";
import "./PickupRequestsPage.css";

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

export default function PickupRequestsPage({ isLoggedIn, onLogout, userRole }) {
  const navigate = useNavigate();

  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [selectedPickup, setSelectedPickup] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [pickupToCancel, setPickupToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchPickups = useCallback(() => {
    setLoading(true);
    setError("");
    getMyPickups()
      .then((response) => {
        const items = response.data || response || [];
        setPickups(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error("Failed to load pickups:", err);
        setError(err.message || "Failed to load pickup requests.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    getMyPickups()
      .then((response) => {
        if (!active) return;
        const items = response.data || response || [];
        setPickups(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load pickups:", err);
        setError(err.message || "Failed to load pickup requests.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOpenDetails = (pickup) => {
    setSelectedPickup(pickup);
    setIsDetailsOpen(true);
  };

  const handleOpenCancel = (pickup) => {
    setPickupToCancel(pickup);
  };

  const handleConfirmCancel = async (id, reason) => {
    try {
      setIsCancelling(true);
      await cancelPickup(id);
      showToast(`Pickup request #${id} was cancelled (${reason || "by user"}).`);
      setPickupToCancel(null);
      fetchPickups();
    } catch (err) {
      console.error("Failed to cancel pickup:", err);
      alert(err.message || "Could not cancel pickup.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="prp-page">
      {toastMessage && (
        <div className="prp-toast">
          <span>✓</span> {toastMessage}
        </div>
      )}

      <header className="prp-header">
        <div className="prp-header-inner">
          <div className="prp-nav-left">
            <button
              type="button"
              className="prp-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <Link to="/" className="prp-logo">
              Clean<span>Bee</span>
            </Link>
          </div>

          <div className="prp-header-right">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="prp-header-link">
                  Dashboard
                </Link>
                {["volunteer", "admin"].includes(userRole) && (
                  <Link to="/volunteer/tasks" className="prp-header-link">
                    Volunteer Portal
                  </Link>
                )}
                <button type="button" className="prp-btn-logout" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="prp-header-link prp-header-link--login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="prp-hero">
        <div className="prp-hero-content">
          <span className="prp-hero-badge">Doorstep Collection</span>
          <h1>Pickup Requests Management</h1>
          <p>
            Schedule recyclable waste pickups from your home or business, track collection status in real-time,
            and earn CleanBee Eco Points.
          </p>
        </div>
      </section>

      <main className="prp-main">
        <div className="prp-container">
          <div className="prp-list-wrapper">
            <PickupRequestList
              pickups={pickups}
              loading={loading}
              error={error}
              onViewDetails={handleOpenDetails}
              onCancel={handleOpenCancel}
              onRefresh={fetchPickups}
            />
          </div>
        </div>
      </main>

      <PickupDetailsModal
        pickup={selectedPickup}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedPickup(null);
        }}
        onCancelClick={(pickup) => {
          setIsDetailsOpen(false);
          handleOpenCancel(pickup);
        }}
      />

      <CancelPickupModal
        pickup={pickupToCancel}
        isOpen={Boolean(pickupToCancel)}
        onClose={() => setPickupToCancel(null)}
        onConfirm={handleConfirmCancel}
        isSubmitting={isCancelling}
      />

      <footer className="prp-footer">
        <p>&copy; 2026 CleanBee. All rights reserved.</p>
      </footer>
    </div>
  );
}