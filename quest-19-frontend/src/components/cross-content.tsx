import type React from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import Markdown from "react-markdown";

interface CrossContentProps {
  data: string;
  isLoading: boolean;
}

interface MarkdownComponents {
  [key: string]: React.ComponentType<any>;
}

const CrossContent: React.FC<CrossContentProps> = ({ data, isLoading }) => {
  const components: MarkdownComponents = {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6 mt-8 first:mt-0 border-b border-gray-200 dark:border-gray-700 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-8 first:mt-0 border-b border-gray-200 dark:border-gray-700 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6 first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4 first:mt-0">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4 first:mt-0">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4 first:mt-0">
        {children}
      </h6>
    ),

    p: ({ children }) => (
      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300 ml-4">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300 ml-4">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,

    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    strong: ({ children }) => (
      <strong className="font-bold text-gray-900 dark:text-gray-100">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-800 dark:text-gray-200">{children}</em>
    ),

    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 mb-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-r">
        {children}
      </blockquote>
    ),

    hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,

    img: ({ src, alt }) => (
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="max-w-full h-auto rounded-lg shadow-sm mb-4 mx-auto"
      />
    ),
  };
  if (isLoading) {
    return <CrossContentSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            No related content available
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="p-4 space-y-6 h-full"
    >
      {data && <Markdown components={components}>{data}</Markdown>}
    </motion.div>
  );
};

function CrossContentSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <>
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export { CrossContent };
