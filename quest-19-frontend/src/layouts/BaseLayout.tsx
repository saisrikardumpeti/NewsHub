import { ModeToggle } from "@/components/theme-toggle";
import {
  Navbar,
  NavBody, MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu
} from "@/components/ui/resizable-navbar";
import { Toaster } from "@/components/ui/sonner";
import type { NewsArticle } from "@/hooks/use-news";
import { cn } from "@/lib/utils";
import type { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { RefreshCcw, UserRoundPen } from "lucide-react";
import { useState, type ReactNode } from "react";

type BaseLayoutType = {
  className: string;
  children: ReactNode;
  refetch?: (options?: RefetchOptions) => Promise<QueryObserverResult<NewsArticle[], Error>>;
  isFetching?: boolean
}

export function BaseLayout({ className, children, isFetching, refetch }: BaseLayoutType) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate()
  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <div className="flex items-center gap-4">
            <NavbarButton variant="primary" className="inline-flex size-10 items-center justify-center p-1" onClick={() => refetch && refetch()}>
              <RefreshCcw className={`${isFetching ? 'animate-spin': ''} size-6`}/>
            </NavbarButton>
            <NavbarButton variant="primary" className="inline-flex gap-x-2 items-center" onClick={() => navigate({
              to: '/preferences'
            })}>
              <UserRoundPen /> Preferences
            </NavbarButton>
            <ModeToggle />
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex w-full flex-col gap-4">
              <NavbarButton variant="secondary" className="inline-flex gap-x-2 items-center"><RefreshCcw /> Refresh</NavbarButton>
              <NavbarButton variant="primary" className="inline-flex gap-x-2 items-center" onClick={() => navigate({
              to: '/preferences'
            })}><UserRoundPen /> Preferences</NavbarButton>

            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      <div className={cn("container mx-auto p-8 pt-6", className)}>
        {children}
      </div>
      <Toaster />
    </div>
  );
}