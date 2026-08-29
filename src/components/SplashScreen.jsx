import { useEffect, useRef } from "react";
import "./SplashScreen.css";

const LEAF_SVG = (
  <svg viewBox="0 0 60 60" fill="none">
    <path
      d="M30 4C14 10 6 24 10 42c14 4 30-2 38-16C54 12 44 4 30 4Z"
      fill="#4fd67a"
    />
    <path d="M12 42C22 30 34 20 52 12" stroke="#0e3a29" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CITY_SVG = (
  <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMax slice" fill="none">
    <rect x="10" y="60" width="34" height="80" fill="#123626" />
    <rect x="52" y="30" width="28" height="110" fill="#123626" />
    <rect x="88" y="70" width="24" height="70" fill="#0e2c20" />
    <rect x="300" y="50" width="30" height="90" fill="#123626" />
    <rect x="336" y="20" width="26" height="120" fill="#0e2c20" />
    <rect x="368" y="65" width="22" height="75" fill="#123626" />
    <g fill="#4fd67a" opacity="0.5">
      <rect x="16" y="70" width="6" height="6" />
      <rect x="28" y="70" width="6" height="6" />
      <rect x="16" y="85" width="6" height="6" />
      <rect x="58" y="42" width="6" height="6" />
      <rect x="70" y="42" width="6" height="6" />
      <rect x="58" y="58" width="6" height="6" />
      <rect x="306" y="62" width="6" height="6" />
      <rect x="318" y="62" width="6" height="6" />
      <rect x="342" y="34" width="6" height="6" />
      <rect x="374" y="78" width="6" height="6" />
    </g>
  </svg>
);

const GROUND_SVG = (
  <svg viewBox="0 0 300 60" fill="none">
    <ellipse cx="150" cy="30" rx="148" ry="26" fill="#8fbf8a" />
    <ellipse cx="150" cy="26" rx="148" ry="24" fill="#a9d8ae" />
    <path d="M40 26c10-14 26-16 34-6 6-10 20-10 24 0 8-8 20-6 24 4" stroke="#4fa35a" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
    <path d="M200 30c8-12 22-14 30-4" stroke="#4fa35a" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>
);


const BIN_SVG = (
  <svg viewBox="0 0 200 220" fill="none">
    {/* open lid */}
    <g>
      <rect x="34" y="18" width="118" height="16" rx="6" fill="#c7ead0" transform="rotate(-14 34 18)" />
      <rect x="30" y="10" width="96" height="12" rx="5" fill="#dff3e3" transform="rotate(-14 30 10)" />
    </g>

    {/* bottles peeking out */}
    <g opacity="0.9">
      <rect x="70" y="50" width="16" height="46" rx="6" fill="#eaf7ee" stroke="#bcdec2" strokeWidth="1.5" transform="rotate(-8 70 50)" />
      <rect x="96" y="46" width="14" height="50" rx="6" fill="#eaf7ee" stroke="#bcdec2" strokeWidth="1.5" transform="rotate(6 96 46)" />
    </g>

    {/* bin body */}
    <path
      d="M42 88h116l-10 118c-1 9-9 16-18 16H70c-9 0-17-7-18-16L42 88Z"
      fill="#a9d8ae"
    />
    <path
      d="M42 88h116l-3 26H45l-3-26Z"
      fill="#8fc494"
    />
    {/* subtle ribbing, no recycle icon */}
    <line x1="70" y1="118" x2="63" y2="200" stroke="#8fc494" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    <line x1="100" y1="118" x2="98" y2="204" stroke="#8fc494" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    <line x1="130" y1="118" x2="135" y2="200" stroke="#8fc494" strokeWidth="4" strokeLinecap="round" opacity="0.6" />

    {/* rim */}
    <rect x="36" y="80" width="128" height="14" rx="7" fill="#c7ead0" />
  </svg>
);

const BEE_SVG = (
  <svg viewBox="0 0 120 100" fill="none" overflow="visible">
    {/* left wing */}
    <ellipse className="cb-wing left" cx="42" cy="30" rx="22" ry="14" fill="#eafaf0" opacity="0.75" />
    {/* right wing */}
    <ellipse className="cb-wing right" cx="78" cy="30" rx="22" ry="14" fill="#eafaf0" opacity="0.75" />

    {/* body */}
    <ellipse cx="60" cy="56" rx="26" ry="22" fill="#ffcb3d" />
    <path d="M36 50c6-6 42-6 48 0" stroke="#2b2116" strokeWidth="7" strokeLinecap="round" />
    <path d="M35 62c8-5 42-5 50 0" stroke="#2b2116" strokeWidth="7" strokeLinecap="round" />
    <path d="M38 73c7-4 38-4 45 0" stroke="#2b2116" strokeWidth="6" strokeLinecap="round" />

    {/* head */}
    <circle cx="60" cy="32" r="15" fill="#ffcb3d" />
    <circle cx="54" cy="31" r="4.2" fill="#20180f" />
    <circle cx="66" cy="31" r="4.2" fill="#20180f" />
    <circle cx="52.6" cy="29.6" r="1.3" fill="white" />
    <circle cx="64.6" cy="29.6" r="1.3" fill="white" />
    <path d="M55 39c3 2 7 2 10 0" stroke="#2b2116" strokeWidth="1.6" strokeLinecap="round" />

    {/* antennae */}
    <path d="M52 20c-3-6-3-10 0-13" stroke="#2b2116" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <path d="M68 20c3-6 3-10 0-13" stroke="#2b2116" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <circle cx="51.5" cy="6.5" r="2.4" fill="#2b2116" />
    <circle cx="68.5" cy="6.5" r="2.4" fill="#2b2116" />
  </svg>
);



export default function SplashScreen({ onFinish, duration = 4200 }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onFinish && onFinish();
    }, duration);
    return () => clearTimeout(timerRef.current);
  }, [duration, onFinish]);

  const handleSkip = () => {
    clearTimeout(timerRef.current);
    onFinish && onFinish();
  };

  return (
    <div className="cb-splash">
      <div className="cb-leaf l1">{LEAF_SVG}</div>
      <div className="cb-leaf l2">{LEAF_SVG}</div>
      <div className="cb-leaf l3">{LEAF_SVG}</div>
      <div className="cb-leaf l4">{LEAF_SVG}</div>

      <div className="cb-stage">
        <header className="cb-header">
          {/* leaf mark above the logo intentionally removed */}
          <h1 className="cb-logo">
            <span className="clean">Clean</span>
            <span className="bee">Bee</span>
          </h1>
          <p className="cb-tagline">Clean Today, Green Tomorrow</p>
        </header>

        <div className="cb-scene">
          <div className="cb-city">{CITY_SVG}</div>
          <div className="cb-glow-ring" />
          <div className="cb-ground">{GROUND_SVG}</div>

          <div className="cb-bin">{BIN_SVG}</div>

          <div className="cb-bee-fly">
            <div className="cb-bee-idle">{BEE_SVG}</div>
          </div>
        </div>

        <footer className="cb-footer">
          <p className="cb-footer-text">Building a cleaner future...</p>
          <button className="cb-skip" onClick={handleSkip} aria-label="Skip splash screen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </footer>
      </div>
    </div>
  );
}
