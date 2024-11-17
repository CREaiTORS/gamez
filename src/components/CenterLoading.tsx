import React from "react";
import { PiSpinnerBold } from "react-icons/pi";
import { twMerge } from "tailwind-merge";

interface props extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export const CenterLoading: React.FC<props> = ({ className, size = 72, ...props }) => (
  <div className={twMerge("h-full w-full flex items-center justify-center", className)} {...props}>
    <PiSpinnerBold size={size} className="animate-spin" />
  </div>
);
