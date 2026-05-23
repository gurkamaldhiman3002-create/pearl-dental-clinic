import type { ServiceIconName } from "@/app/lib/clinicContent";

export default function ServiceIcon({ type }: { type: ServiceIconName }) {
  const iconProps = {
    className: "h-7 w-7",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
  };

  switch (type) {
    case "xray":
      return (
        <svg {...iconProps}>
          <path d="M7 4H5a1 1 0 0 0-1 1v2M17 4h2a1 1 0 0 1 1 1v2M7 20H5a1 1 0 0 1-1-1v-2M17 20h2a1 1 0 0 0 1-1v-2" />
          <path d="M9.5 9.25c.55-1 1.35-1.5 2.5-1.5s1.95.5 2.5 1.5c.65 1.2.3 2.65-.2 3.75-.45 1-.55 3.25-1.4 3.25-.55 0-.45-2.25-.9-2.25s-.35 2.25-.9 2.25c-.85 0-.95-2.25-1.4-3.25-.5-1.1-.85-2.55-.2-3.75Z" />
        </svg>
      );
    case "implant":
      return (
        <svg {...iconProps}>
          <path d="M9 6.5a3 3 0 0 1 6 0c0 1.5-1 2.5-1.25 3.25h-3.5C10 9 9 8 9 6.5Z" />
          <path d="M10 11h4M10 14h4M10.75 17h2.5M12 10v10" />
        </svg>
      );
    case "root":
      return (
        <svg {...iconProps}>
          <path d="M8 6c1-2 2.25-2 4-1.25C13.75 4 15 4 16 6c1.1 2.2-.25 4.15-1.05 5.55-.85 1.5-.55 6.45-2.05 6.45-.85 0-.4-4-1.4-4s-.55 4-1.4 4c-1.5 0-1.2-4.95-2.05-6.45C7.25 10.15 5.9 8.2 7 6" />
          <path d="M12 7v5" />
        </svg>
      );
    case "crown":
      return (
        <svg {...iconProps}>
          <path d="m5 8 4 3 3-6 3 6 4-3-2 9H7L5 8Z" />
          <path d="M7 19h10" />
        </svg>
      );
    case "laser":
      return (
        <svg {...iconProps}>
          <path d="m4 20 6.5-6.5M8 20l4.5-4.5M4 16l4.5-4.5" />
          <path d="M12 12h7M13.5 9.5l5-3M13.5 14.5l5 3" />
        </svg>
      );
    case "polish":
      return (
        <svg {...iconProps}>
          <path d="M5 15c3.25 2.5 10.75 2.5 14 0" />
          <path d="M7 12c.7-3.4 2.35-5 5-5s4.3 1.6 5 5" />
          <path d="M18.5 4.5v3M17 6h3" />
        </svg>
      );
    case "whitening":
      return (
        <svg {...iconProps}>
          <path d="M8 7c1-2 2.25-2 4-1.25C13.75 5 15 5 16 7c1 2-.1 3.9-.9 5.25-.9 1.5-.65 5.75-2.1 5.75-.85 0-.45-3.5-1-3.5s-.15 3.5-1 3.5c-1.45 0-1.2-4.25-2.1-5.75C8.1 10.9 7 9 8 7Z" />
          <path d="M19 4v4M17 6h4" />
        </svg>
      );
    case "denture":
      return (
        <svg {...iconProps}>
          <path d="M5 11c2-4.25 12-4.25 14 0M5 13c2 4.25 12 4.25 14 0" />
          <path d="M8 11v3M12 10v5M16 11v3" />
        </svg>
      );
    case "camera":
      return (
        <svg {...iconProps}>
          <path d="M4 8.5h4l1.5-2h5l1.5 2h4v9H4v-9Z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "cosmetic":
      return (
        <svg {...iconProps}>
          <path d="M5 14c3 4 11 4 14 0" />
          <path d="M8 10h.01M16 10h.01" />
          <path d="M12 3v4M10 5h4" />
        </svg>
      );
    case "extraction":
      return (
        <svg {...iconProps}>
          <path d="M8 7c1-2 2.25-2 4-1.25C13.75 5 15 5 16 7c1 2-.1 3.9-.9 5.25-.9 1.5-.65 5.75-2.1 5.75-.85 0-.45-3.5-1-3.5s-.15 3.5-1 3.5c-1.45 0-1.2-4.25-2.1-5.75C8.1 10.9 7 9 8 7Z" />
          <path d="m4 20 16-16" />
        </svg>
      );
    case "equipment":
      return (
        <svg {...iconProps}>
          <path d="M7 4H5v3M17 4h2v3M7 20H5v-3M17 20h2v-3" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      );
    case "gentle":
      return (
        <svg {...iconProps}>
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
        </svg>
      );
    case "family":
      return (
        <svg {...iconProps}>
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="15.5" cy="9" r="2" />
          <path d="M4.5 18c.5-3.25 2-5 4.5-5s4 1.75 4.5 5M14 14c2.35 0 3.75 1.35 4.25 4" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M9 9h6M9 13h6M9 17h3" />
        </svg>
      );
  }
}
