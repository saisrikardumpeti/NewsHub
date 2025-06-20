import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

export const TextLoadingSkeleton = (
  { lines = 3, className = "", skeletonClassName = "" },
) => {
  return (
    <div className={cn(`space-y-3 w-full`, className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            `h-4 ${index === lines - 1 ? "w-2/3" : "w-full"}`,
            skeletonClassName,
          )}
        />
      ))}
    </div>
  );
};
