import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const iconProps = {
  "aria-hidden": true,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.8,
  viewBox: "0 0 24 24",
} as const;

export function ArrowDownIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M12 5v14M6.5 13.5 12 19l5.5-5.5" />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M12 19V5m5.5 5.5L12 5l-5.5 5.5" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z" />
    </svg>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M4 21h16M6 21V7l6-4 6 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M6 2v3M18 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function CashIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M6 9H4v6h2M18 9h2v6h-2M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
    </svg>
  );
}

export function ExitIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5M14 8l4 4-4 4M8 12h10" />
    </svg>
  );
}

export function DatabaseIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function PurchaseIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M3 6h18M5 6l1 15h12l1-15M9 10v7M15 10v7M8 3h8l1 3H7l1-3Z" />
    </svg>
  );
}

export function SaleIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6M10 21h.01M18 21h.01" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}

export function WeightIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M6 7h12l3 14H3L6 7Z" />
      <path d="M9 7a3 3 0 1 1 6 0M10 12h4" />
    </svg>
  );
}
