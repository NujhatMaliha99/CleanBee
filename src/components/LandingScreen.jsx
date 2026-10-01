import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { landingApi } from "../services/api";
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
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
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
  { id: "photo", icon: "camera", title: "Pickup request", body: "Submit a pickup request with details and photos so volunteers can assist you." },
  { id: "pin", icon: "pin", title: "Area reports", body: "Track cleanup activity and pending pickups across your neighborhood." },
];

const EMPTY_OVERVIEW = {
  stats: {
    waste_diverted_kg: 0,
    completed_pickups: 0,
    total_eco_points: 0,
    active_volunteers: 0,
  },
  activities: [],
  rewards: [],
};

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const formatStatus = (status) =>
  String(status || "updated").replaceAll("_", " ");

export default function LandingScreen({ hasRegistered, isLoggedIn, onLogout }) {
  const firstName =
    typeof window !== "undefined" ? localStorage.getItem("firstName") : null;
  const [scrolled, setScrolled] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const tickerMessages = overview.activities.length
    ? overview.activities.map(
        (activity) =>
          `Pickup #${activity.id} ${formatStatus(activity.status)} · ${formatStatus(activity.waste_type)}`
      )
    : ["No recent pickup activity yet."];

  const impactStats = [
    { value: numberFormat.format(overview.stats.waste_diverted_kg), label: "kg waste diverted" },
    { value: numberFormat.format(overview.stats.completed_pickups), label: "pickups completed" },
    { value: numberFormat.format(overview.stats.total_eco_points), label: "eco points earned" },
    { value: numberFormat.format(overview.stats.active_volunteers), label: "volunteers onboard" },
  ];

  const nextRewardTarget = wallet?.next_reward?.points_required || 0;
  const walletProgress = nextRewardTarget
    ? Math.min(100, (wallet.points / nextRewardTarget) * 100)
    : wallet
      ? 100
      : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    let active = true;

    const loadLandingData = async (showLoading = false) => {
      if (showLoading) setLoading(true);

      try {
        const overviewResponse = await landingApi.getOverview();
        const walletResponse = isLoggedIn ? await landingApi.getWallet() : null;

        if (!active) return;
        setOverview(overviewResponse.data);
        setWallet(walletResponse?.data || null);
        setApiError("");
      } catch (error) {
        if (!active) return;
        setApiError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLandingData(true);
    const pollId = setInterval(() => loadLandingData(false), 30000);

    return () => {
      active = false;
      clearInterval(pollId);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const id = setInterval(
      () => setTickerIndex((i) => (i + 1) % tickerMessages.length),
      3200
    );
    return () => clearInterval(id);
  }, [tickerMessages.length]);

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
      <header className={`cb-nav${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-open" : ""}`}>
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
            ) : hasRegistered ? (
              <Link to="/login" className="cb-btn cb-btn-primary">
                Login
              </Link>
            ) : (
              <>
                <Link to="/login" className="cb-btn cb-btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="cb-btn cb-btn-primary">
                  Get started
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="cb-nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="cb-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? "close" : "menu"} size={24} />
          </button>
        </div>

        {/* Mobile menu drawer */}
        <div
          id="cb-mobile-menu"
          className={`cb-mobile-menu${menuOpen ? " is-open" : ""}`}
        >
          <nav className="cb-mobile-links">
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#rewards" onClick={closeMenu}>Rewards</a>
          </nav>
          <div className="cb-mobile-cta">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="cb-btn cb-btn-primary" onClick={closeMenu}>
                  Go to dashboard
                </Link>
                <button
                  type="button"
                  className="cb-btn cb-btn-ghost"
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                >
                  Log out
                </button>
              </>
            ) : hasRegistered ? (
              <Link to="/login" className="cb-btn cb-btn-primary" onClick={closeMenu}>
                Login
              </Link>
            ) : (
              <>
                <Link to="/register" className="cb-btn cb-btn-primary" onClick={closeMenu}>
                  Get started
                </Link>
                <Link to="/login" className="cb-btn cb-btn-ghost" onClick={closeMenu}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {menuOpen && <div className="cb-mobile-scrim" onClick={closeMenu} aria-hidden="true" />}

      {(loading || apiError) && (
        <div
          className={`cb-data-status${apiError ? " cb-data-status--error" : ""}`}
          role="status"
        >
          {apiError
            ? "Live data is temporarily unavailable. Please try again shortly."
            : "Loading live CleanBee data…"}
        </div>
      )}

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
                  <Link to="/notifications" className="cb-btn cb-btn-primary cb-btn-lg">
                    Instant alert
                  </Link>
                  <a href="#rewards" className="cb-btn cb-btn-outline cb-btn-lg">
                    See your eco rewards
                  </a>
                </>
              ) : hasRegistered ? (
                <Link to="/login" className="cb-btn cb-btn-primary cb-btn-lg">
                  Login
                </Link>
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
                <strong>{loading ? "—" : `${numberFormat.format(overview.stats.waste_diverted_kg)} kg`}</strong>
                <span>waste diverted</span>
              </div>
              <div>
                <strong>{loading ? "—" : numberFormat.format(overview.stats.active_volunteers)}</strong>
                <span>active volunteers</span>
              </div>
              <div>
                <strong>{loading ? "—" : numberFormat.format(overview.stats.completed_pickups)}</strong>
                <span>completed pickups</span>
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
                  <span>Eco pts</span>
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
            {tickerMessages[tickerIndex % tickerMessages.length]}
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
              {f.id === "photo" || f.id === "pin" ? (
                <Link
                  to={f.id === "photo" ? "/photo-verification" : "/area-reports"}
                  className="cb-cell-inner cb-cell-inner--link"
                  aria-label={`Open ${f.title} page`}
                >
                  <span className="cb-cell-icon">
                    <Icon name={f.icon} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </Link>
              ) : (
                <div className="cb-cell-inner">
                  <span className="cb-cell-icon">
                    <Icon name={f.icon} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              )}
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
          {impactStats.map((s) => (
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
              {overview.rewards.map((reward) => (
                <li key={reward.id}>
                  <span className="cb-rewards-points">
                    {numberFormat.format(reward.points_required)} pts
                  </span>
                  <span>{reward.name}</span>
                </li>
              ))}
              {!loading && overview.rewards.length === 0 && (
                <li className="cb-rewards-empty">No reward offers available right now.</li>
              )}
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
            {isLoggedIn ? (
              <>
                <strong className="cb-reward-card-balance">
                  {loading || !wallet ? "—" : numberFormat.format(wallet.points)} pts
                </strong>
                {wallet?.recent_pickups?.map((pickup) => (
                  <div className="cb-reward-card-row" key={pickup.id}>
                    <Icon name="check" size={16} />
                    <span>
                      Pickup #{pickup.id} {formatStatus(pickup.status)}
                      {pickup.earned_points ? ` · +${pickup.earned_points} pts` : ""}
                    </span>
                  </div>
                ))}
                {!loading && wallet?.recent_pickups?.length === 0 && (
                  <div className="cb-reward-card-row">No pickup activity yet.</div>
                )}
                <div className="cb-reward-card-bar">
                  <div
                    className="cb-reward-card-bar-fill"
                    style={{ width: `${walletProgress}%` }}
                  />
                </div>
                <span className="cb-reward-card-note">
                  {wallet?.next_reward
                    ? `${numberFormat.format(wallet.points_to_next_reward)} pts to ${wallet.next_reward.name}`
                    : wallet
                      ? "All available reward targets reached"
                      : "Loading wallet…"}
                </span>
              </>
            ) : (
              <div className="cb-wallet-login">
                <p>Sign in to view your eco wallet and recent pickup rewards.</p>
                <Link to="/login" className="cb-btn cb-btn-dark">
                  Login to view wallet
                </Link>
              </div>
            )}
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
        ) : hasRegistered ? (
          <>
            <h2>Ready for your next pickup?</h2>
            <p>Log in to schedule a pickup or check your rewards.</p>
            <Link to="/login" className="cb-btn cb-btn-dark cb-btn-lg">
              Login
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
            ) : hasRegistered ? (
              <Link to="/login">Login</Link>
            ) : (
              <>
                <Link to="/login">Login</Link>
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
