import * as React from "react";

export function Spinner({ size = 20, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      {...props}
    >
      <path
        d="M12 3V6M3 12H6M5.63607 5.63604L7.75739 7.75736M5.63604 18.3639L7.75736 16.2426M21 12.0005H18M18.364 5.63639L16.2427 7.75771M11.9998 21.0002V18.0002M18.3639 18.3642L16.2426 16.2429"
        strokeWidth="2"
        strokeLinecap="round"
        stroke="currentColor"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
