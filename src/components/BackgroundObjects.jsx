import React, { useId, useMemo } from "react";

const objectsConfig = [
  { shape: "smartphone", top: 6, left: 15, float: 9, rotate: 18, delay: 0 },
  { shape: "headphones", top: 18, left: 70, float: 8, rotate: 16, delay: 1.5 },
  { shape: "laptop", top: 55, left: 10, float: 10, rotate: 20, delay: 0.8 },
  { shape: "circuit", top: 42, left: 58, float: 7, rotate: 14, delay: 0.6 },
  { shape: "cable", top: 68, left: 32, float: 8.5, rotate: 15, delay: 1.2 },
  { shape: "gear", top: 28, left: 38, float: 6.5, rotate: 12, delay: 2 },
  { shape: "tablet", top: 75, left: 70, float: 9.5, rotate: 19, delay: 1 },
  { shape: "chip", top: 12, left: 52, float: 7.8, rotate: 13, delay: 0.4 },
];

function renderIcon(shape, gradientId) {
  switch (shape) {
    case "smartphone":
      return (
        <svg viewBox="0 0 60 120" className="floating-icon">
          <defs>
            <linearGradient
              id={`${gradientId}-phone`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#5be0ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6d4dff" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect
            x="8"
            y="6"
            width="44"
            height="108"
            rx="14"
            fill={`url(#${gradientId}-phone)`}
            stroke="#9edbff"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          <rect
            x="15"
            y="20"
            width="30"
            height="80"
            rx="12"
            fill="#01040f"
            fillOpacity="0.6"
          />
          <circle cx="30" cy="103" r="3" fill="#8ed9ff" fillOpacity="0.8" />
        </svg>
      );
    case "headphones":
      return (
        <svg viewBox="0 0 120 120" className="floating-icon">
          <defs>
            <linearGradient
              id={`${gradientId}-hp`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#7b5dff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3ddcff" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            d="M20 70c0-25 20-45 40-45s40 20 40 45"
            fill="none"
            stroke={`url(#${gradientId}-hp)`}
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.8"
          />
          <rect
            x="12"
            y="70"
            width="18"
            height="30"
            rx="9"
            fill="#03122a"
            stroke="#54d4ff"
            strokeOpacity="0.5"
          />
          <rect
            x="90"
            y="70"
            width="18"
            height="30"
            rx="9"
            fill="#03122a"
            stroke="#54d4ff"
            strokeOpacity="0.5"
          />
        </svg>
      );
    case "laptop":
      return (
        <svg viewBox="0 0 140 90" className="floating-icon">
          <defs>
            <linearGradient
              id={`${gradientId}-lap`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#4dd7ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#8263ff" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect
            x="20"
            y="10"
            width="100"
            height="50"
            rx="8"
            fill="#010b1d"
            stroke={`url(#${gradientId}-lap)`}
            strokeWidth="4"
          />
          <rect
            x="12"
            y="65"
            width="116"
            height="12"
            rx="6"
            fill={`url(#${gradientId}-lap)`}
            opacity="0.8"
          />
        </svg>
      );
    case "circuit":
      return (
        <svg viewBox="0 0 120 120" className="floating-icon">
          <defs>
            <linearGradient
              id={`${gradientId}-circuit`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#5ce3ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8f62ff" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect
            x="20"
            y="20"
            width="80"
            height="80"
            rx="12"
            fill="#020c1d"
            stroke={`url(#${gradientId}-circuit)`}
            strokeWidth="4"
            opacity="0.7"
          />
          <path
            d="M30 60h60M60 30v60"
            stroke={`url(#${gradientId}-circuit)`}
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="30" cy="60" r="6" fill="#64e4ff" />
          <circle cx="90" cy="60" r="6" fill="#64e4ff" />
          <circle cx="60" cy="30" r="6" fill="#64e4ff" />
          <circle cx="60" cy="90" r="6" fill="#64e4ff" />
        </svg>
      );
    case "cable":
      return (
        <svg viewBox="0 0 140 60" className="floating-icon">
          <defs>
            <linearGradient
              id={`${gradientId}-cable`}
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
            >
              <stop offset="0%" stopColor="#4de3ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a373ff" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            d="M10 30c20-20 40 20 60 0s40 20 60 0"
            fill="none"
            stroke={`url(#${gradientId}-cable)`}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.8"
          />
          <rect
            x="5"
            y="22"
            width="10"
            height="16"
            rx="3"
            fill="#0b1c35"
            stroke="#4de3ff"
            strokeWidth="2"
          />
          <rect
            x="125"
            y="22"
            width="10"
            height="16"
            rx="3"
            fill="#0b1c35"
            stroke="#a373ff"
            strokeWidth="2"
          />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 120 120" className="floating-icon">
          <defs>
            <linearGradient
              id={`${gradientId}-gear`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#6af0ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#7f63ff" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path
            d="M60 35a25 25 0 1 1 0 50 25 25 0 0 1 0-50zm-38 25h8m60 0h8m-38-38v8m0 60v8m-23.5-52.5l5.6 5.6m39.8 39.8 5.6 5.6m0-50.9-5.6 5.6m-39.8 39.8-5.6 5.6"
            fill="none"
            stroke={`url(#${gradientId}-gear)`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        </svg>
      );
    case "tablet":
      return (
        <svg viewBox="0 0 80 110" className="floating-icon">
          <defs>
            <linearGradient
              id={`${gradientId}-tablet`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#4cd2ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#8456ff" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect
            x="6"
            y="6"
            width="68"
            height="98"
            rx="18"
            fill={`url(#${gradientId}-tablet)`}
            opacity="0.9"
          />
          <rect
            x="16"
            y="20"
            width="48"
            height="72"
            rx="12"
            fill="#010915"
            fillOpacity="0.65"
          />
        </svg>
      );
    case "chip":
    default:
      return (
        <svg viewBox="0 0 100 100" className="floating-icon">
          <defs>
            <linearGradient
              id={`${gradientId}-chip`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#49f0ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#a679ff" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect
            x="15"
            y="15"
            width="70"
            height="70"
            rx="10"
            fill="#030c1b"
            stroke={`url(#${gradientId}-chip)`}
            strokeWidth="6"
          />
          <rect
            x="35"
            y="35"
            width="30"
            height="30"
            rx="6"
            fill={`url(#${gradientId}-chip)`}
            opacity="0.8"
          />
          <path
            d="M50 5v20m0 70V75M5 50h20m70 0H75"
            stroke={`url(#${gradientId}-chip)`}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      );
  }
}

function BackgroundObjects() {
  const gradientBase = useId();
  const objects = useMemo(() => objectsConfig, []);

  return (
    <div className="background-objects" aria-hidden="true">
      {objects.map((item, index) => (
        <div
          key={`${item.shape}-${index}`}
          className="floating-object"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            animationDuration: `${item.float}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          <div
            className="floating-shape"
            style={{ animationDuration: `${item.rotate}s` }}
          >
            {renderIcon(item.shape, `${gradientBase}-${index}`)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BackgroundObjects;
