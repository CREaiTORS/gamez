import { FaHeart } from "react-icons/fa";

export function Heart({ filled = false }) {
  return <FaHeart className={`w-6 h-6 stroke-2 stroke-red-500 ${filled && "fill-red-500"}`} />;
}

export interface LivesTrackerProps {
  lives: number;
  avlLives: number;
}

export function LivesTracker({ avlLives, lives }: LivesTrackerProps) {
  return (
    <div className="flex flex-row gap-2">
      {Array(lives)
        .fill(0)
        .map((_, index) => (
          <Heart key={index} filled={index < avlLives} />
        ))}
      {Array(avlLives - lives)
        .fill(0)
        .map((_, index) => (
          <Heart key={lives + index} />
        ))}
    </div>
  );
}
