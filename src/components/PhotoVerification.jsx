import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { pickupApi } from "../services/api";
import "./PhotoVerification.css";

/* ── Inline SVG icons  ── */
const CameraIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

/* ── Helpers ── */
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/* ── Component ── */
export default function PhotoVerification({ isLoggedIn, onLogout }) {
  const fileInputRef = useRef(null);

  /* Form state */
  const [photo, setPhoto]         = useState(null);   // { file, preview, name }
  const [category, setCategory]   = useState("");
  const [address, setAddress]     = useState("");
  const [date, setDate]           = useState("");
  const [time, setTime]           = useState("");
  const [quantity, setQuantity]   = useState("1");
  const [unit, setUnit]           = useState("kg");
  const [contactPhone, setContactPhone] = useState("");

  /* UI state */
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary]     = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  /* ── Handlers ── */
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPhoto({ file, preview, name: file.name });
    setErrors((prev) => ({ ...prev, photo: "" }));
    // reset input so the same file can be re-selected after Remove
    e.target.value = "";
  }

  function handleRemovePhoto() {
    if (photo?.preview) URL.revokeObjectURL(photo.preview);
    setPhoto(null);
  }

  function validate() {
    const errs = {};
    if (!photo)          errs.photo    = "Please upload a waste photo.";
    if (!category)       errs.category = "Please select a waste category.";
    if (!address.trim()) errs.address  = "Please enter a pickup address.";
    if (!date)           errs.date     = "Please select a preferred date.";
    if (!time)           errs.time     = "Please select a preferred time.";
    if (!quantity || Number(quantity) <= 0) errs.quantity = "Please enter a valid quantity.";
    if (!contactPhone.trim()) errs.contactPhone = "Please enter a contact phone number.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!isLoggedIn) {
      setServerError("Please log in with a verified account before submitting a pickup request.");
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);

    try {
      const pickupResponse = await pickupApi.create({
        waste_type: category === "Other" ? "mixed" : category.toLowerCase(),
        quantity: Number(quantity),
        quantity_unit: unit,
        pickup_address: address.trim(),
        pickup_date: date,
        pickup_time: time,
        contact_phone: contactPhone.trim(),
      });

      await pickupApi.uploadPhoto(pickupResponse.data.id, photo.file, "before");

      setSummary({
        pickupId: pickupResponse.data.id,
        photoName: photo.name,
        category,
        quantity: `${quantity} ${unit}`,
        address: address.trim(),
        date: formatDate(date),
        time: formatTime(time),
      });
      setSubmitted(true);
    } catch (requestError) {
      setServerError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Success State ── */
  if (submitted && summary) {
    return (
      <div className="pv-page">
        <header className="pv-topbar">
          <span className="pv-logo">
            Clean<span className="pv-accent">Bee</span>
          </span>
        </header>

        <main className="pv-main">
          <div className="pv-success-card">
            <div className="pv-success-icon">
              <CheckIcon />
            </div>
            <h2>Pickup request submitted!</h2>
            <p className="pv-success-sub">
              Your request and verification photo have been saved. A volunteer will be matched shortly.
            </p>

            <div className="pv-summary">
              <div className="pv-summary-row">
                <span className="pv-summary-label">Pickup ID</span>
                <span className="pv-summary-value">#{summary.pickupId}</span>
              </div>
              <div className="pv-summary-row">
                <span className="pv-summary-label">Photo</span>
                <span className="pv-summary-value">{summary.photoName}</span>
              </div>
              <div className="pv-summary-row">
                <span className="pv-summary-label">Quantity</span>
                <span className="pv-summary-value">{summary.quantity}</span>
              </div>
              <div className="pv-summary-row">
                <span className="pv-summary-label">Waste Type</span>
                <span className="pv-summary-value">{summary.category}</span>
              </div>
              <div className="pv-summary-row">
                <span className="pv-summary-label">Address</span>
                <span className="pv-summary-value">{summary.address}</span>
              </div>
              <div className="pv-summary-row">
                <span className="pv-summary-label">Pickup Date</span>
                <span className="pv-summary-value">{summary.date}</span>
              </div>
              <div className="pv-summary-row">
                <span className="pv-summary-label">Pickup Time</span>
                <span className="pv-summary-value">{summary.time}</span>
              </div>
            </div>

            <div className="pv-success-actions">
             <Link to="/" className="pv-btn pv-btn-primary">
                Back to Home
             </Link>
              <button
                type="button"
                className="pv-btn pv-btn-ghost"
                onClick={() => {
                  setSubmitted(false);
                  setSummary(null);
                  setPhoto(null);
                  setCategory("");
                  setAddress("");
                  setDate("");
                  setTime("");
                  setQuantity("1");
                  setUnit("kg");
                  setContactPhone("");
                  setErrors({});
                  setServerError("");
                }}
              >
                Submit Another
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div className="pv-page">
      {/* Top-bar */}
      <header className="pv-topbar">
        <span className="pv-logo">
          Clean<span className="pv-accent">Bee</span>
        </span>
        <div className="pv-topbar-right">
          <Link to="/#features" className="pv-btn pv-btn-ghost pv-btn-sm">
  <ArrowLeftIcon /> Back
</Link>
        </div>
      </header>

      <main className="pv-main">
        {/* Page heading */}
        <div className="pv-page-head">
          
          <h1>Photo Verification</h1>
          <p className="pv-subtitle">
            Upload a photo of your waste so the collector knows what to expect.
          </p>
        </div>

        <form className="pv-form" onSubmit={handleSubmit} noValidate>

          {/* ── 1. Photo Upload ── */}
          <section className="pv-section pv-card">
            <h2 className="pv-section-title">Waste Photo</h2>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="pv-file-input"
              id="pv-file-input"
              onChange={handleFileChange}
              aria-hidden="true"
              tabIndex={-1}
            />

            {!photo ? (
              /* Upload zone */
              <button
                type="button"
                className={`pv-upload-zone${errors.photo ? " pv-upload-zone--error" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload waste photo"
              >
                <span className="pv-upload-icon">
                  <CameraIcon />
                </span>
                <span className="pv-upload-title">Upload waste photo</span>
                <span className="pv-upload-hint">PNG, JPG or JPEG</span>
              </button>
            ) : (
              /* Preview */
              <div className="pv-preview">
                <img
                  src={photo.preview}
                  alt="Waste preview"
                  className="pv-preview-img"
                />
                <div className="pv-preview-info">
                  <span className="pv-preview-name">{photo.name}</span>
                  <div className="pv-preview-actions">
                    <button
                      type="button"
                      className="pv-btn pv-btn-ghost pv-btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      className="pv-btn pv-btn-danger pv-btn-sm"
                      onClick={handleRemovePhoto}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errors.photo && (
              <span className="pv-field-error" role="alert">{errors.photo}</span>
            )}
          </section>

          {/* ── 2. Waste Category ── */}
          <section className="pv-section pv-card">
            <h2 className="pv-section-title">Waste Category</h2>
            <div className="form-item">
              <label htmlFor="pv-category">Waste Category</label>
              <select
                id="pv-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setErrors((prev) => ({ ...prev, category: "" }));
                }}
              >
                <option value="" disabled>Select a category…</option>
                <option value="Plastic">Plastic</option>
                <option value="Organic">Organic</option>
                <option value="Paper">Paper</option>
                <option value="E-Waste">E-Waste</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <span className="field-error" role="alert">{errors.category}</span>
              )}
            </div>
          </section>

          {/* ── 3. Pickup Information ── */}
          <section className="pv-section pv-card">
            <h2 className="pv-section-title">Pickup Information</h2>

            <div className="pv-row-two">
              <div className="form-item">
                <label htmlFor="pv-quantity">Quantity</label>
                <input
                  id="pv-quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setErrors((prev) => ({ ...prev, quantity: "" }));
                  }}
                />
                {errors.quantity && <span className="field-error" role="alert">{errors.quantity}</span>}
              </div>

              <div className="form-item">
                <label htmlFor="pv-unit">Unit</label>
                <select id="pv-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="kg">Kilograms</option>
                  <option value="bags">Bags</option>
                  <option value="items">Items</option>
                </select>
              </div>
            </div>

            <div className="form-item">
              <label htmlFor="pv-contact-phone">Contact Phone</label>
              <input
                id="pv-contact-phone"
                type="tel"
                placeholder="e.g. +8801712345678"
                value={contactPhone}
                onChange={(e) => {
                  setContactPhone(e.target.value);
                  setErrors((prev) => ({ ...prev, contactPhone: "" }));
                }}
              />
              {errors.contactPhone && <span className="field-error" role="alert">{errors.contactPhone}</span>}
            </div>

            <div className="form-item">
              <label htmlFor="pv-address">Pickup Address</label>
              <input
                id="pv-address"
                type="text"
                placeholder="e.g. 12 Dhanmondi Road, Dhaka"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrors((prev) => ({ ...prev, address: "" }));
                }}
              />
              {errors.address && (
                <span className="field-error" role="alert">{errors.address}</span>
              )}
            </div>

            <div className="pv-row-two">
              <div className="form-item">
                <label htmlFor="pv-date">Preferred Date</label>
                <input
                  id="pv-date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setErrors((prev) => ({ ...prev, date: "" }));
                  }}
                />
                {errors.date && (
                  <span className="field-error" role="alert">{errors.date}</span>
                )}
              </div>

              <div className="form-item">
                <label htmlFor="pv-time">Preferred Time</label>
                <input
                  id="pv-time"
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setErrors((prev) => ({ ...prev, time: "" }));
                  }}
                />
                {errors.time && (
                  <span className="field-error" role="alert">{errors.time}</span>
                )}
              </div>
            </div>
          </section>

          {/* ── 4. Submit ── */}
          {serverError && <p className="pv-field-error" role="alert">{serverError}</p>}

          <button type="submit" className="pv-btn pv-btn-primary pv-btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Pickup Request"}
          </button>

        </form>
      </main>
    </div>
  );
}
