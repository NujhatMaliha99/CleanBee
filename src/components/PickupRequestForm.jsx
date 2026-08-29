import { useState, useRef } from "react";
import { pickupApi } from "../services/api";
import "./PickupRequestForm.css";

const WASTE_CATEGORIES = [
  { value: "plastic", label: "Plastic & Bottles", icon: "🍾" },
  { value: "organic", label: "Organic & Food Waste", icon: "🍎" },
  { value: "paper", label: "Paper & Cardboard", icon: "📦" },
  { value: "e-waste", label: "E-Waste & Electronics", icon: "💻" },
  { value: "glass", label: "Glass & Ceramics", icon: "🥛" },
  { value: "metal", label: "Metal & Cans", icon: "🥫" },
  { value: "mixed", label: "Mixed / General Waste", icon: "🗑️" },
];

const QUANTITY_UNITS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "bags", label: "Bags" },
  { value: "items", label: "Items / Pieces" },
];

export default function PickupRequestForm({ onSuccess, onCancel }) {
  const fileInputRef = useRef(null);

  // Form Fields
  const [wasteType, setWasteType] = useState("plastic");
  const [quantity, setQuantity] = useState("5");
  const [quantityUnit, setQuantityUnit] = useState("kg");
  const [pickupAddress, setPickupAddress] = useState(() => localStorage.getItem("address") || "");
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [pickupTime, setPickupTime] = useState("10:00");
  const [contactPhone, setContactPhone] = useState(() => localStorage.getItem("phone") || "");
  const [instructions, setInstructions] = useState("");
  const [photo, setPhoto] = useState(null); // { file, preview, name }

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
      setErrors((prev) => ({ ...prev, photo: "Only JPG, PNG, or WEBP images are supported." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Photo size must be under 5MB." }));
      return;
    }

    const preview = URL.createObjectURL(file);
    setPhoto({ file, preview, name: file.name });
    setErrors((prev) => ({ ...prev, photo: "" }));
  };

  const handleRemovePhoto = () => {
    if (photo?.preview) URL.revokeObjectURL(photo.preview);
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};

    if (!wasteType) errs.wasteType = "Please select a waste category.";
    if (!quantity || Number(quantity) <= 0) errs.quantity = "Please enter a valid quantity greater than 0.";
    if (!quantityUnit) errs.quantityUnit = "Please choose a quantity unit.";
    if (!pickupAddress.trim()) errs.pickupAddress = "Pickup address is required.";

    if (!pickupDate) {
      errs.pickupDate = "Please choose a pickup date.";
    } else if (pickupDate < todayStr) {
      errs.pickupDate = "Pickup date cannot be in the past.";
    }

    if (!pickupTime) {
      errs.pickupTime = "Please specify a preferred pickup time.";
    } else if (!/^\d{2}:\d{2}$/.test(pickupTime)) {
      errs.pickupTime = "Time format must be HH:MM.";
    }

    if (!contactPhone.trim()) {
      errs.contactPhone = "Contact phone number is required.";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(contactPhone.trim())) {
      errs.contactPhone = "Enter a valid phone number (7-15 digits).";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Build FormData for multipart request (matching Laravel StorePickupRequest)
      const formData = new FormData();
      formData.append("waste_type", wasteType);
      formData.append("quantity", Number(quantity));
      formData.append("quantity_unit", quantityUnit);
      formData.append("pickup_address", pickupAddress.trim());
      formData.append("pickup_date", pickupDate);
      formData.append("pickup_time", pickupTime);
      formData.append("contact_phone", contactPhone.trim());
      if (instructions.trim()) {
        formData.append("instructions", instructions.trim());
      }
      if (photo?.file) {
        formData.append("image", photo.file);
      }

      const response = await pickupApi.create(formData);
      setSubmitSuccess(true);

      setTimeout(() => {
        onSuccess?.(response.data || response);
      }, 1200);
    } catch (err) {
      console.error("Pickup creation failed:", err);
      setSubmitError(err.message || "Failed to schedule pickup request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="pickup-form-card" onSubmit={handleSubmit} noValidate>
      <div className="pickup-form-header">
        <div className="pickup-form-badge">Request Pickup</div>
        <h2>Schedule Waste Pickup</h2>
        <p>Fill out the details below to request a doorstep collection by verified volunteers.</p>
      </div>

      {submitSuccess && (
        <div className="pickup-form-alert pickup-form-alert--success">
          <span className="alert-icon">✓</span>
          <div>
            <strong>Pickup scheduled successfully!</strong>
            <p>Your request has been submitted and is pending volunteer assignment.</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="pickup-form-alert pickup-form-alert--error">
          <span className="alert-icon">⚠️</span>
          <div>
            <strong>Submission error</strong>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      <div className="pickup-form-body">
        {/* Waste Category Selection */}
        <div className="form-group">
          <label className="form-label">
            Waste Category <span className="req">*</span>
          </label>
          <div className="waste-category-grid">
            {WASTE_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`category-select-card ${wasteType === cat.value ? "selected" : ""}`}
                onClick={() => {
                  setWasteType(cat.value);
                  setErrors((prev) => ({ ...prev, wasteType: "" }));
                }}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-text">{cat.label}</span>
              </button>
            ))}
          </div>
          {errors.wasteType && <span className="field-error">{errors.wasteType}</span>}
        </div>

        {/* Quantity & Unit Row */}
        <div className="form-row form-row--2col">
          <div className="form-group">
            <label htmlFor="pickup-qty" className="form-label">
              Estimated Quantity <span className="req">*</span>
            </label>
            <input
              id="pickup-qty"
              type="number"
              min="0.1"
              step="any"
              placeholder="e.g. 5"
              className={`form-input ${errors.quantity ? "has-error" : ""}`}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((prev) => ({ ...prev, quantity: "" }));
              }}
            />
            {errors.quantity && <span className="field-error">{errors.quantity}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pickup-unit" className="form-label">
              Unit <span className="req">*</span>
            </label>
            <select
              id="pickup-unit"
              className="form-select"
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
            >
              {QUANTITY_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
            {errors.quantityUnit && <span className="field-error">{errors.quantityUnit}</span>}
          </div>
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="pickup-address" className="form-label">
            Pickup Address <span className="req">*</span>
          </label>
          <div className="input-with-icon">
            <span className="input-icon">📍</span>
            <input
              id="pickup-address"
              type="text"
              placeholder="e.g. House 24, Road 7, Dhanmondi, Dhaka"
              className={`form-input has-icon ${errors.pickupAddress ? "has-error" : ""}`}
              value={pickupAddress}
              onChange={(e) => {
                setPickupAddress(e.target.value);
                setErrors((prev) => ({ ...prev, pickupAddress: "" }));
              }}
            />
          </div>
          {errors.pickupAddress && <span className="field-error">{errors.pickupAddress}</span>}
        </div>

        {/* Date & Time Row */}
        <div className="form-row form-row--2col">
          <div className="form-group">
            <label htmlFor="pickup-date" className="form-label">
              Preferred Date <span className="req">*</span>
            </label>
            <input
              id="pickup-date"
              type="date"
              min={todayStr}
              className={`form-input ${errors.pickupDate ? "has-error" : ""}`}
              value={pickupDate}
              onChange={(e) => {
                setPickupDate(e.target.value);
                setErrors((prev) => ({ ...prev, pickupDate: "" }));
              }}
            />
            {errors.pickupDate && <span className="field-error">{errors.pickupDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pickup-time" className="form-label">
              Preferred Time <span className="req">*</span>
            </label>
            <input
              id="pickup-time"
              type="time"
              className={`form-input ${errors.pickupTime ? "has-error" : ""}`}
              value={pickupTime}
              onChange={(e) => {
                setPickupTime(e.target.value);
                setErrors((prev) => ({ ...prev, pickupTime: "" }));
              }}
            />
            {errors.pickupTime && <span className="field-error">{errors.pickupTime}</span>}
          </div>
        </div>

        {/* Contact Phone */}
        <div className="form-group">
          <label htmlFor="pickup-phone" className="form-label">
            Contact Phone Number <span className="req">*</span>
          </label>
          <div className="input-with-icon">
            <span className="input-icon">📞</span>
            <input
              id="pickup-phone"
              type="tel"
              placeholder="+880 1700-000000"
              className={`form-input has-icon ${errors.contactPhone ? "has-error" : ""}`}
              value={contactPhone}
              onChange={(e) => {
                setContactPhone(e.target.value);
                setErrors((prev) => ({ ...prev, contactPhone: "" }));
              }}
            />
          </div>
          {errors.contactPhone && <span className="field-error">{errors.contactPhone}</span>}
        </div>

        {/* Instructions */}
        <div className="form-group">
          <label htmlFor="pickup-instructions" className="form-label">
            Additional Instructions <span className="opt">(optional)</span>
          </label>
          <textarea
            id="pickup-instructions"
            rows="3"
            placeholder="e.g. Leave at gate, call when arriving, bags are sorted by color..."
            className="form-textarea"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        {/* Photo Upload with Preview */}
        <div className="form-group">
          <label className="form-label">
            Waste Photo <span className="opt">(optional, helps volunteers prepare)</span>
          </label>

          {!photo ? (
            <div
              className="photo-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
              <div className="dropzone-content">
                <span className="upload-icon">📷</span>
                <p className="dropzone-prompt">
                  <strong>Click to upload</strong> or drag photo here
                </p>
                <span className="dropzone-hint">PNG, JPG or WEBP (Max 5MB)</span>
              </div>
            </div>
          ) : (
            <div className="photo-preview-container">
              <img src={photo.preview} alt="Waste preview" className="photo-preview-img" />
              <div className="photo-preview-details">
                <span className="photo-name">{photo.name}</span>
                <button
                  type="button"
                  className="photo-remove-btn"
                  onClick={handleRemovePhoto}
                >
                  ✕ Remove Photo
                </button>
              </div>
            </div>
          )}
          {errors.photo && <span className="field-error">{errors.photo}</span>}
        </div>
      </div>

      {/* Form Footer */}
      <div className="pickup-form-footer">
        {onCancel && (
          <button
            type="button"
            className="pickup-form-btn pickup-form-btn--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="pickup-form-btn pickup-form-btn--primary"
          disabled={isSubmitting || submitSuccess}
        >
          {isSubmitting ? (
            <span className="btn-loading-content">
              <span className="mini-spinner" /> Scheduling...
            </span>
          ) : (
            "Schedule Pickup"
          )}
        </button>
      </div>
    </form>
  );
}
