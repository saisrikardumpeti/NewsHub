import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type BaseLayoutType = {
  children: ReactNode;
  className?: string;
  q?: string;
};

export function BaseLayout({ className, children, q }: BaseLayoutType) {
  return (
    <div className="relative w-full">
      <Header q={q} />
      <div className={cn("container mx-auto p-8 pt-6", className)}>
        {children}
      </div>
      <Toaster />
    </div>
  );
}
