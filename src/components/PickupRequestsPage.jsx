import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pickupApi } from "../services/api";
import PickupRequestForm from "./PickupRequestForm";
import PickupRequestList from "./PickupRequestList";
import PickupDetailsModal from "./PickupDetailsModal";
import CancelPickupModal from "./CancelPickupModal";
import "./PickupRequestsPage.css";

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function PickupRequestsPage({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create'
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Modals state
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
    pickupApi
      .getAll()
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
    pickupApi
      .getAll()
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

  // Handlers
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
      await pickupApi.cancel(id);
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

  const handleCreateSuccess = () => {
    showToast("Your pickup request was scheduled successfully!");
    setActiveTab("list");
    fetchPickups();
  };

  return (
    <div className="prp-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="prp-toast">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Top Header */}
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
                <Link to="/volunteer" className="prp-header-link">
                  Volunteer Portal
                </Link>
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

      {/* Hero Banner */}
      <section className="prp-hero">
        <div className="prp-hero-content">
          <span className="prp-hero-badge">Doorstep Collection</span>
          <h1>Pickup Requests Management</h1>
          <p>
            Schedule recyclable waste pickups from your home or business, track collection status in real-time,
            and earn CleanBee Eco Points.
          </p>

          <div className="prp-mode-toggle">
            <button
              type="button"
              className={`prp-toggle-btn ${activeTab === "list" ? "active" : ""}`}
              onClick={() => setActiveTab("list")}
            >
              My Requests ({pickups.length})
            </button>
            <button
              type="button"
              className={`prp-toggle-btn ${activeTab === "create" ? "active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
              <PlusIcon /> Schedule New Pickup
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="prp-main">
        <div className="prp-container">
          {activeTab === "create" ? (
            <div className="prp-form-wrapper">
              <PickupRequestForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setActiveTab("list")}
              />
            </div>
          ) : (
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
          )}
        </div>
      </main>

      {/* Modals */}
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
