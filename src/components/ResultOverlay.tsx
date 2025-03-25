import { cn } from "../utils";
import { useGameService } from "./GameServiceWrapper";

interface ResultOverlayProps {
  imageClassName?: string;
  containerClassName?: string;
  successImg?: string;
  errorImg?: string;
}

export function ResultOverlay({
  containerClassName,
  imageClassName,
  successImg = "./images/success.png",
  errorImg = "./images/error.png",
}: ResultOverlayProps) {
  const gs = useGameService();
  const result = gs.useResult();

  if (!result) return null;

  return (
    <div className={cn("absolute z-50 full c", containerClassName)}>
      <img className={imageClassName} src={result === "success" ? successImg : errorImg} />
    </div>
  );
}
