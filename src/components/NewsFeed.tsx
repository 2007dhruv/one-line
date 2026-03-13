"use client";

import { useState, useMemo } from "react";
import { NewsCard } from "./NewsCard";
import { Search, Filter, AlertCircle, X } from "lucide-react";
import { cn } from "../lib/utils";

interface NewsItem {
  id: string;
  content: string;
  category: string;
  published_at: string;
}

interface NewsFeedProps {
  initialNews: NewsItem[];
  categories: string[];
}

export function NewsFeed({ initialNews, categories }: NewsFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredNews = useMemo(() => {
    return initialNews.filter((item) => {
      const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialNews, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search news by keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <button
              onClick={() => setSelectedCategory("All")}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                selectedCategory === "All"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-500">
          Showing <span className="text-slate-300 font-bold">{filteredNews.length}</span> news items
          {selectedCategory !== "All" && <span> in <span className="text-primary">{selectedCategory}</span></span>}
        </p>
      </div>

      {/* News Grid */}
      <div className="grid gap-6">
        {filteredNews.length > 0 ? (
          filteredNews.map((news, index) => (
            <NewsCard
              key={news.id}
              content={news.content}
              category={news.category}
              date={news.published_at}
              index={index}
            />
          ))
        ) : (
          <div className="glass-card p-12 text-center space-y-4">
            <div className="bg-slate-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-white/5">
              <AlertCircle className="w-8 h-8 text-slate-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-300">No matching news found.</h3>
              <p className="text-slate-500">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
