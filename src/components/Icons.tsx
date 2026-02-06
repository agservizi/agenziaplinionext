const iconClass = "h-6 w-6";

export function PaymentsIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none">
      <path
        d="M6 4h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4c0 1-1 2-2 2C10.4 22 2 13.6 2 3c0-1 1-2 2-2h2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EnergyIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none">
      <path
        d="M13 2 5 14h6l-1 8 9-14h-6l0-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogisticsIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none">
      <path d="M3 7h11v10H3z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 9h4l3 3v5h-7z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function DigitalIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none">
      <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function WebIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3c3 4 3 14 0 18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3c-3 4-3 14 0 18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
