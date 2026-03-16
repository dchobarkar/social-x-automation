import { cn } from "@/utils/cn";

export type LoadingScreenProps = {
  message?: string;
  className?: string;
};

const LoadingScreen = ({
  message = "Loading…",
  className,
}: LoadingScreenProps) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-background flex items-center justify-center",
        className,
      )}
    >
      <p className="text-muted">{message}</p>
    </div>
  );
};

export default LoadingScreen;
