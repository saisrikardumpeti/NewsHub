import { Skeleton } from "./ui/skeleton";

export function LoadingArticles() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array(10).fill(0).map((el, idx) => (
        <div
          key={`loading-${el}-${idx}`}
          className="p-4 flex flex-col rounded-xl w-[350px] h-[388] dark:bg-neutral-900 bg-white"
        >
          <div className="flex gap-2 flex-col w-full">
            <Skeleton className="h-52 w-full" />
            <div className="flex justify-center space-y-2 items-center flex-col w-full">
              <div className="w-full">
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="w-full space-y-2">
                <div className="w-full flex gap-x-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="w-full flex gap-x-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
