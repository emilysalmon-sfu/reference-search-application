import * as React from "react"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useGetTypeColor } from "@/hooks/use-type-styles";

export interface Article {
  author: string;
  title: string;
  type_of_study: string;
  year_published: number;
  journal_name: string;
  keywords: string | string[] | null;
  abstract: string;
  doi: string;
}

interface ArticleCardProps {
  article: Article;
}

function ArticleCard({ article }: ArticleCardProps) {
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);
  const [isKeywordsExpanded, setIsKeywordsExpanded] = useState(false);
  const getTypeColor = useGetTypeColor();

  const keywordsArray = React.useMemo(() => {
    const k = article?.keywords;


    if (!k) return [];

    if (Array.isArray(k)) {
      return k.map(s => String(s).trim()).filter(Boolean);
    }

    return k
      .split(/[\r\n,;]+/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [article?.keywords]);

  const displayedKeywords = isKeywordsExpanded ? keywordsArray : keywordsArray.slice(0, 7);
  const hasMoreKeywords = keywordsArray.length > 7;

  return (
    <Card className="w-full min-h-[500px] flex flex-col">
      <CardHeader>
        <h2 className="text-blue-600 dark:text-blue-400 mb-2 font-bold">{article?.title}</h2>
        {article?.type_of_study && (
          <div className="mb-3">
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium",
                getTypeColor(article?.type_of_study)
              )}
            >
              {article?.type_of_study}
            </span>
          </div>)}
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
          <span className="text-gray-700 dark:text-gray-300 italic">{article?.journal_name}</span>
          <span>•</span>
          <span>{article?.year_published ?? 'Forthcoming'}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mt-4">
          {article?.author && (
            <>
              <span>{article?.author}</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="w-full space-y-4 overflow-hidden flex-1">
        <div>
          <h3 className="text-gray-900 dark:text-gray-100 mb-2 font-bold">Abstract</h3>
          <div className="relative">
            <p className={`text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-300 ease-in-out ${!isAbstractExpanded
                ? "max-h-20 overflow-hidden"
                : "max-h-none"
              }`}>
              {article?.abstract ?? "No abstract available."}
            </p>
            {!isAbstractExpanded && article?.abstract && article.abstract.length > 150 && (
              <div className="absolute bottom-8 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-card to-transparent pointer-events-none" />
            )}
            {article?.abstract && (
              <button
                onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                className="cursor-pointer flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2"
              >
                <span>{isAbstractExpanded ? "Show less" : "Read more"}</span>
                {isAbstractExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>)}
          </div>
        </div>

        <div className="w-full">
          <h3 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {displayedKeywords.length ? (
              displayedKeywords.map((keyword, index) => (
                <Badge key={`${keyword}-${index}`} variant="secondary">
                  {keyword}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400 text-sm">No keywords available</span>
            )}
          </div>
          {hasMoreKeywords && (
            <button
              onClick={() => setIsKeywordsExpanded(!isKeywordsExpanded)}
              className="cursor-pointer flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 text-sm"
            >
              <span>{isKeywordsExpanded ? "Show less" : `Show ${keywordsArray.length - 5} more`}</span>
              {isKeywordsExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <div>
          {article?.doi ? (
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
            >
              <span>DOI: {article.doi}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">DOI link not available.</p>
          )}
        </div>

      </CardContent>
    </Card>
  );
}

export { ArticleCard }

