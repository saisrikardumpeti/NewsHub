import React, { useEffect } from "react";

export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement | null>,
  /* eslint-disable  @typescript-eslint/no-unsafe-function-type */
  callback: (Function),
) => {
  useEffect(() => {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const listener = (event: any) => {
      const target = event.target as Element;
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      const isDropdownClick =
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest("[data-radix-dropdown-menu-content]") ||
        target.closest("[data-radix-dropdown-menu-item]") ||
        target.closest('[role="menu"]') ||
        target.closest('[role="menuitem"]');

      // Only call handler if it's not a dropdown click
      if (isDropdownClick) return;
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};
