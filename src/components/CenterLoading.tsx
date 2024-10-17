import React from "react";
import { PiSpinnerBold } from "react-icons/pi";
import { twMerge } from "tailwind-merge";

interface props extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export const CenterLoading: React.FC<props> = ({ className, size = 72, ...props }) => (
  <div className={twMerge("c full", className)} {...props}>
    <PiSpinnerBold size={size} className="animate-spin" />
  </div>
);
