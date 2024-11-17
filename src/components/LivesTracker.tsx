import { FaHeart } from "react-icons/fa";

export function Heart({ filled = false }) {
  return <FaHeart className={`w-6 h-6 stroke-2 stroke-red-500 ${filled && "fill-red-500"}`} />;
}

export interface LivesTrackerProps {
  totalLives: number;
  remainingLives: number;
}

export function LivesTracker({ remainingLives, totalLives }: LivesTrackerProps) {
  return (
    <div className="flex flex-row-reverse gap-2">
      {Array(totalLives)
        .fill(0)
        .map((_, index) => (
          <Heart key={index} filled={index < remainingLives} />
        ))}
    </div>
  );
}
