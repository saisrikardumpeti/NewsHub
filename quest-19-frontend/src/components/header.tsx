import { useState } from "react";
import { Cog, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { PREDEFINED_CATEGORIES } from "@/lib/constants";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";

export default function Header({ q }: { q?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const placeholders = [
    "Latest news",
    "Some news on apple",
    "Latest Sports News",
  ];

  function handleSearchSubmit(
    e: React.FormEvent<HTMLFormElement>,
    query: string,
  ) {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/search", search: () => ({ q: query }) });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to={"/"}
            search={(prev) => ({})}
            className="flex items-center space-x-2"
          >
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                N
              </span>
            </div>
            <span className="font-bold text-xl">NewsHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {PREDEFINED_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={"/news"}
                search={() => ({ category: category.name })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
            <div className="relative flex-1">
              <PlaceholdersAndVanishInput
                onSubmit={handleSearchSubmit}
                placeholders={placeholders}
                q={q || ""}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer"
                onClick={() => (navigate({ to: "/preferences" }))}
              >
                <Cog className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen
                ? <X className="h-4 w-4" />
                : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <PlaceholdersAndVanishInput
                  onSubmit={() => {}}
                  placeholders={["Hellw"]}
                  q="Hell"
                />
              </div>
              {PREDEFINED_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  to={"/"}
                  search={(prev) => ({ ...prev, category: category.id })}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
