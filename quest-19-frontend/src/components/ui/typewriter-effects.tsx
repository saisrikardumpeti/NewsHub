"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: "easeInOut",
        }
      );
    }
  }, [isInView]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{}}
                  key={`char-${index}`}
                  className={cn(
                    `dark:text-white text-black opacity-0 hidden`,
                    word.className
                  )}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </motion.div>
    );
  };
  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};
interface CharacterData {
  char: string
  isSpace: boolean
  isNewline: boolean
  lineIndex: number
  charIndex: number
}

export const TypewriterEffectSmooth = ({
  text,
  className,
  cursorClassName,
  typeSpeed = 50,
  startDelay = 1000,
  showCursor = true,
}: {
  text: string
  className?: string
  cursorClassName?: string
  typeSpeed?: number
  startDelay?: number
  showCursor?: boolean
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Process text into structured data
  const processText = (inputText: string): CharacterData[] => {
    const lines = inputText.split("\n")
    const characters: CharacterData[] = []

    lines.forEach((line, lineIndex) => {
      const words = line.split(" ")

      words.forEach((word, wordIndex) => {
        // Add characters of the word
        word.split("").forEach((char, charIndex) => {
          characters.push({
            char,
            isSpace: false,
            isNewline: false,
            lineIndex,
            charIndex: characters.filter((c) => c.lineIndex === lineIndex).length,
          })
        })

        // Add space after word (except last word in line)
        if (wordIndex < words.length - 1) {
          characters.push({
            char: " ",
            isSpace: true,
            isNewline: false,
            lineIndex,
            charIndex: characters.filter((c) => c.lineIndex === lineIndex).length,
          })
        }
      })

      // Add newline after line (except last line)
      if (lineIndex < lines.length - 1) {
        characters.push({
          char: "\n",
          isSpace: false,
          isNewline: true,
          lineIndex,
          charIndex: characters.filter((c) => c.lineIndex === lineIndex).length,
        })
      }
    })

    return characters
  }

  const allCharacters = processText(text)

  // Start typing after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true)
    }, startDelay)

    return () => clearTimeout(timer)
  }, [startDelay])

  // Handle typing animation
  useEffect(() => {
    if (!isTyping) return

    if (currentIndex < allCharacters.length) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
      }, typeSpeed)

      return () => clearTimeout(timer)
    } else {
      setIsComplete(true)
    }
  }, [currentIndex, isTyping, typeSpeed, allCharacters.length])

  // Get currently visible characters
  const visibleCharacters = allCharacters.slice(0, currentIndex)

  // Group characters by line for rendering
  const lineGroups: { [key: number]: CharacterData[] } = {}
  visibleCharacters.forEach((char) => {
    if (!lineGroups[char.lineIndex]) {
      lineGroups[char.lineIndex] = []
    }
    if (!char.isNewline) {
      lineGroups[char.lineIndex].push(char)
    }
  })

  // Determine cursor position
  const getCursorPosition = () => {
    if (currentIndex === 0) return { lineIndex: 0, charIndex: 0 }

    const lastChar = allCharacters[currentIndex - 1]
    if (lastChar?.isNewline) {
      return { lineIndex: lastChar.lineIndex + 1, charIndex: 0 }
    }

    return {
      lineIndex: lastChar?.lineIndex || 0,
      charIndex: (lastChar?.charIndex || 0) + 1,
    }
  }

  const cursorPosition = getCursorPosition()

  const renderLines = () => {
    const maxLineIndex = Math.max(...Object.keys(lineGroups).map(Number), cursorPosition.lineIndex)
    const lines = []

    for (let lineIndex = 0; lineIndex <= maxLineIndex; lineIndex++) {
      const lineChars = lineGroups[lineIndex] || []
      const isCursorOnThisLine = cursorPosition.lineIndex === lineIndex
      console.log(lineIndex)
      lines.push(
        <div key={lineIndex} className={`relative min-h-[1em] ${lineIndex === 1 ? 'hidden': ''}`}>
          <span className="inline-block">
            {lineChars.map((charData, index) => (
              <motion.span
                key={`${lineIndex}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="dark:text-white text-black"
              >
                {charData.char}
              </motion.span>
            ))}

            {/* Render cursor on current line */}
            {isCursorOnThisLine && showCursor && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1,
                  repeat: isComplete ? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
                className={cn(
                  "inline-block align-top w-[2px] bg-blue-500 ml-[1px]",
                  "h-[1em]", // Match text height
                  cursorClassName,
                )}
                style={{
                  height: "1em",
                  verticalAlign: "top",
                }}
              />
            )}
          </span>
        </div>,
      )
    }

    return lines
  }

  return (
    <div ref={containerRef} className={cn(className)}>
      <div className="text-base md:text-lg font-bold leading-relaxed p-4">
        {renderLines()}
      </div>
    </div>
  )
}
