type DtmLogoProps = {
  className?: string;
};

export const DtmLogo = ({ className }: DtmLogoProps) => {
  return (
    <svg
      viewBox="0 0 300 72"
      role="img"
      aria-label="DTM"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(2 6)">
        <path
          d="M16 6L4 30L16 54H28L16 30L28 6H16Z"
          fill="var(--logo-primary)"
        />
        <path
          d="M38 6L26 30L38 54H50L38 30L50 6H38Z"
          fill="var(--logo-accent)"
          opacity="0.9"
        />
        <rect
          x="56"
          y="6"
          width="10"
          height="48"
          rx="5"
          fill="var(--logo-secondary)"
          opacity="0.25"
        />
      </g>
      <g fill="var(--logo-secondary)">
        <path d="M88 16H110C124 16 134 26 134 36C134 46 124 56 110 56H88V16ZM101 27V45H110C116 45 121 41 121 36C121 31 116 27 110 27H101Z" />
        <path d="M139 16H184V27H168V56H155V27H139V16Z" />
        <path d="M189 16H203L218 37L233 16H247V56H234V35L218 55L202 35V56H189V16Z" />
      </g>
      <text
        x="88"
        y="67"
        fill="var(--logo-primary)"
        style={{ fontSize: 10, letterSpacing: "0.18em", fontWeight: 700 }}
      >
        LOGISTICS
      </text>
    </svg>
  );
};
