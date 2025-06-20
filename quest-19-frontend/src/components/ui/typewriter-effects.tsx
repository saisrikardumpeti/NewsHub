import { useEffect, useState } from "react";

interface TypewriterEffectSmoothProps {
  text: string;
  showCursor?: boolean;
  typeSpeed?: number;
}

export function TypewriterEffectSmooth(
  { text, showCursor = true, typeSpeed = 50 }: TypewriterEffectSmoothProps,
) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typeSpeed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typeSpeed]);

  return (
    <div className="text-white">
      {displayedText}
      {showCursor && <span className="animate-pulse">|</span>}
    </div>
  );
}
