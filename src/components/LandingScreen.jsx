import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingScreen.css";

/* Minimal line-icon set — kept in one place so the visual language stays consistent */
const ICONS = {
  pin: "M12 2C7.6 2 4 5.6 4 10c0 5.6 8 12 8 12s8-6.4 8-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z",
  users:
    "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 20c0-2.6 1.8-4.8 4.2-5.5.6.3 1.1.7 1.6 1.2 1.3 1.2 2.2 2.9 2.2 4.8",
  coin: "M12 3v18M7 7.5c0-1.4 2.2-2.5 5-2.5s5 1.1 5 2.5-2.2 2.5-5 2.5-5 1.1-5 2.5 2.2 2.5 5 2.5 5 1.1 5 2.5-2.2 2.5-5 2.5-5-1.1-5-2.5",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  bell: "M12 3a5 5 0 0 0-5 5v3.6c0 .7-.3 1.4-.8 1.9L5 15h14l-1.2-1.5a2.6 2.6 0 0 1-.8-1.9V8a5 5 0 0 0-5-5ZM9.5 19a2.5 2.5 0 0 0 5 0",
  route:
    "M4 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm16-14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 17c4-2 4-9 8-11h4",
  leaf: "M5 20C4 12 8 4 20 4c1 8-4 16-15 16Zm0 0c1.5-4 4-7 9-9",
  check: "m5 12 5 5L20 7",
  arrow: "M5 12h14M13 6l6 6-6 6",
  bin: "M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Zm3-3h6l1 2H8l1-2Z",
  gift: "M12 8v13M4 12h16v9H4v-9Zm0 0V8h16v4M8 8a2.5 2.5 0 1 1 4-3c1 1 0 3 0 3H8Zm8 0a2.5 2.5 0 1 0-4-3c-1 1 0 3 0 3h4Z",
  calendar:
    "M4 9h16M7 3v4M17 3v4M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 9h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01",
  camera:
    "M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
};

function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

const TICKER = [
  "Pickup #4127 accepted in Dhanmondi",
  "Rina just earned 40 eco points",
  "New volunteer joined in Mirpur",
  "Pickup #4130 marked complete in Gulshan",
  "Sabbir redeemed 500 points for a top-up",
];

const STEPS = [
  {
    n: "01",
    icon: "pin",
    title: "Request a pickup",
    body: "Drop a pin, add a photo, and say what needs to go. Takes under a minute.",
  },
  {
    n: "02",
    icon: "users",
    title: "A volunteer accepts",
    body: "The nearest verified volunteer gets notified and claims your request.",
  },
  {
    n: "03",
    icon: "coin",
    title: "You earn eco points",
    body: "Points land the moment the pickup is confirmed — no forms, no waiting.",
  },
];

const FEATURES = [
  { icon: "camera", title: "Photo verification", body: "Attach a photo with every request so volunteers know exactly what to expect." },
  { icon: "users", title: "Volunteer tasks", body: "Volunteers see nearby tasks and claim the ones they can complete." },
  { icon: "pin", title: "Area reports", body: "Track cleanup activity and pending pickups across your neighborhood." },
  { icon: "coin", title: "Eco point", body: "Earn points automatically the moment a pickup is confirmed." },
  { icon: "bell", title: "Instant alert", body: "Know the second your pickup is accepted, on the way, or done." },
  { icon: "bin", title: "Waste report submission", body: "Flag illegal dumping or an overflowing bin in seconds." },
];

const REWARDS = [
  { points: "500", perk: "৳100 mobile top-up", icon: "coin" },
  { points: "1,200", perk: "Reusable eco kit", icon: "gift" },
  { points: "2,000", perk: "A tree planted in your name", icon: "leaf" },
];

const STATS = [
  { value: "48,600", label: "kg waste diverted" },
  { value: "9,800", label: "pickups completed" },
  { value: "126,000", label: "eco points earned" },
  { value: "3,200", label: "volunteers onboard" },
];

export default function LandingScreen({ isLoggedIn, onLogout }) {
  const firstName =
    typeof window !== "undefined" ? localStorage.getItem("firstName") : null;
  const [scrolled, setScrolled] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setTickerIndex((i) => (i + 1) % TICKER.length),
      3200
    );
    return () => clearInterval(id);
  }, []);

  const handleTiltMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 14 });
  };
  const handleTiltLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="landing">
      {/* Nav */}
      <header className={`cb-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="cb-nav-inner">
          <span className="cb-logo">
            Clean<span className="accent">Bee</span>
          </span>
          <nav className="cb-nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#rewards">Rewards</a>
          </nav>
          <div className="cb-nav-cta">
            {isLoggedIn ? (
              <>
                <button type="button" className="cb-btn cb-btn-ghost" onClick={onLogout}>
                  Log out
                </button>
                <Link to="/dashboard" className="cb-btn cb-btn-primary">
                  Go to dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="cb-btn cb-btn-ghost">
                  Sign in
                </Link>
                <Link to="/register" className="cb-btn cb-btn-primary">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="cb-hero">
        <div className="cb-hero-blob b1" aria-hidden="true" />
        <div className="cb-hero-blob b2" aria-hidden="true" />
        <div className="cb-hex-field" aria-hidden="true" />
        <div className="cb-hero-inner">
          <div className="cb-hero-copy">
            <span className="cb-eyebrow">
              {isLoggedIn && firstName ? `Welcome back, ${firstName}` : "Smart pickups. Real rewards."}
            </span>
            <h1>Turn trash day into reward day.</h1>
            <p className="cb-hero-sub">
              Request a pickup in seconds, get matched with a nearby verified
              volunteer, and earn eco points every time you help keep your
              neighborhood clean.
            </p>
            <div className="cb-hero-actions">
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" className="cb-btn cb-btn-primary cb-btn-lg">
                    Go to your dashboard
                  </Link>
                  <a href="#rewards" className="cb-btn cb-btn-outline cb-btn-lg">
                    See your eco rewards
                  </a>
                </>
              ) : (
                <>
                  <Link to="/register" className="cb-btn cb-btn-primary cb-btn-lg">
                    Get started free
                  </Link>
                  <Link to="/login" className="cb-btn cb-btn-outline cb-btn-lg">
                    I already have an account
                  </Link>
                </>
              )}
            </div>
            <div className="cb-hero-stats">
              <div>
                <strong>12,400 kg</strong>
                <span>waste diverted</span>
              </div>
              <div>
                <strong>3,200</strong>
                <span>active volunteers</span>
              </div>
              <div>
                <strong>18 min</strong>
                <span>avg. pickup time</span>
              </div>
            </div>
          </div>

          <div className="cb-hero-visual">
            <div className="cb-coin-stage">
              <div className="cb-coin">
                <div className="cb-coin-face cb-coin-front">
                  <Icon name="bin" size={34} />
                  <span>Request</span>
                </div>
                <div className="cb-coin-face cb-coin-back">
                  <Icon name="coin" size={34} />
                  <span>+40 pts</span>
                </div>
              </div>
              <span className="cb-coin-ring" />
              <span className="cb-leaf cb-leaf-a">
                <Icon name="leaf" size={16} />
              </span>
              <span className="cb-leaf cb-leaf-b">
                <Icon name="leaf" size={14} />
              </span>
            </div>
          </div>
        </div>

        <div className="cb-ticker">
          <span className="cb-ticker-dot" />
          <span key={tickerIndex} className="cb-ticker-text">
            {TICKER[tickerIndex]}
          </span>
        </div>
      </section>

      {/* How it works */}
      <section className="cb-section" id="how-it-works">
        <div className="cb-section-head">
          <span className="cb-kicker">How it works</span>
          <h2>From full bin to full wallet, in three steps.</h2>
        </div>
        <div className="cb-steps">
          {STEPS.map((s, i) => (
            <div className="cb-step" key={s.n}>
              <div className="cb-step-top">
                <span className="cb-step-num">{s.n}</span>
                <span className="cb-step-icon">
                  <Icon name={s.icon} />
                </span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              {i < STEPS.length - 1 && (
                <span className="cb-step-arrow" aria-hidden="true">
                  <Icon name="arrow" size={18} />
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="cb-section cb-section-tint" id="features">
        <div className="cb-section-head">
          <span className="cb-kicker">Built for the whole loop</span>
          <h2>Everything a pickup needs, nothing it doesn't.</h2>
        </div>
        <div className="cb-hive">
          {FEATURES.map((f) => (
            <div className="cb-cell" key={f.title}>
              <div className="cb-cell-inner">
                <span className="cb-cell-icon">
                  <Icon name={f.icon} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact stats */}
      <section className="cb-impact">
        <div className="cb-section-head cb-on-dark">
          <span className="cb-kicker">Since launch</span>
          <h2>Small pickups add up fast.</h2>
        </div>
        <div className="cb-impact-grid">
          {STATS.map((s) => (
            <div className="cb-impact-cell" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Rewards */}
      <section className="cb-section" id="rewards">
        <div className="cb-rewards">
          <div className="cb-rewards-copy">
            <span className="cb-kicker">Eco rewards</span>
            <h2>Your trash has value. We just keep the tab.</h2>
            <p>
              Every confirmed pickup adds points to your wallet. Cash them in
              for perks, or let them stack up for something bigger.
            </p>
            <ul className="cb-rewards-list">
              {REWARDS.map((r) => (
                <li key={r.perk}>
                  <span className="cb-rewards-points">{r.points} pts</span>
                  <span>{r.perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="cb-reward-card"
            ref={cardRef}
            onMouseMove={handleTiltMove}
            onMouseLeave={handleTiltLeave}
            style={{
              transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
          >
            <div className="cb-reward-card-top">
              <span>Eco wallet</span>
              <Icon name="coin" size={20} />
            </div>
            <strong className="cb-reward-card-balance">1,840 pts</strong>
            <div className="cb-reward-card-row">
              <Icon name="check" size={16} />
              <span>Pickup #4130 confirmed · +40 pts</span>
            </div>
            <div className="cb-reward-card-row">
              <Icon name="check" size={16} />
              <span>Pickup #4118 confirmed · +35 pts</span>
            </div>
            <div className="cb-reward-card-bar">
              <div className="cb-reward-card-bar-fill" />
            </div>
            <span className="cb-reward-card-note">160 pts to your next perk</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cb-cta">
        {isLoggedIn ? (
          <>
            <h2>Ready to request your next pickup?</h2>
            <p>Head to your dashboard to schedule a pickup or check your rewards.</p>
            <Link to="/dashboard" className="cb-btn cb-btn-dark cb-btn-lg">
              Go to your dashboard
            </Link>
          </>
        ) : (
          <>
            <h2>Ready to make pickup day pay off?</h2>
            <p>Join CleanBee and put your neighborhood's waste to work.</p>
            <Link to="/register" className="cb-btn cb-btn-dark cb-btn-lg">
              Create your free account
            </Link>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="cb-footer">
        <div className="cb-footer-top">
          <span className="cb-logo cb-logo-footer">
            Clean<span className="accent">Bee</span>
          </span>
          <p>Clean today, green tomorrow.</p>
        </div>
        <div className="cb-footer-links">
          <div>
            <h4>Product</h4>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#rewards">Rewards</a>
          </div>
          <div>
            <h4>Account</h4>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <button type="button" className="cb-footer-linkbtn" onClick={onLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Sign in</Link>
                <Link to="/register">Create account</Link>
              </>
            )}
          </div>
          <div>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="cb-footer-bottom">
          <span>© {new Date().getFullYear()} CleanBee. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
