interface ChiliIconProps {
  className?: string;
  size?: number;
}

export default function ChiliIcon({ className = '', size = 24 }: ChiliIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Chili pepper icon"
    >
      {/* Green stem */}
      <path
        d="M11 4 L11 1.5"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Green calyx (the star-shaped top) */}
      <path
        d="M11 4 L9 5 L8 3.5 L11 4 Z"
        fill="#16a34a"
      />
      <path
        d="M11 4 L13 5 L14 3.5 L11 4 Z"
        fill="#16a34a"
      />
      <path
        d="M11 4 L11 6"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Chili pepper body - elongated and curved */}
      <path
        d="M11 6
           C9.5 6 8.5 7 8 8.5
           C7 11 7.5 14 9 17
           C10 19 12 21 13.5 21
           C15 21 16.5 19 17 16
           C18 12 17.5 9 16 7
           C15 6 13 6 11 6Z"
        fill="#dc2626"
        stroke="#b91c1c"
        strokeWidth="0.5"
      />

      {/* Highlight curve for 3D effect */}
      <path
        d="M9.5 9 C9 11 9.5 13 10.5 15"
        stroke="#fca5a5"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Small shine spot */}
      <ellipse
        cx="10"
        cy="11"
        rx="0.8"
        ry="1.2"
        fill="#fecaca"
        opacity="0.7"
      />
    </svg>
  );
}
