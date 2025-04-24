import React from "react";
import { PiSpinnerBold } from "react-icons/pi";
import { twMerge } from "tailwind-merge";

export interface CenterLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function CenterLoading({ className, size = 72, ...props }: CenterLoadingProps) {
  return (
    <div className={twMerge("h-full w-full flex items-center justify-center", className)} {...props}>
      <PiSpinnerBold size={size} className="animate-spin" />
    </div>
  );
}
