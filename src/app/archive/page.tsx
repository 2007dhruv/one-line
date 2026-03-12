"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { NewsCard } from "../../components/NewsCard";
import { cn } from "../../lib/utils";

export default function ArchivePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async (date: Date) => {
    setLoading(true);
    const dateString = date.toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("published_at", dateString)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching archive news:", error);
      setNewsItems([]);
    } else {
      setNewsItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews(selectedDate);
  }, [selectedDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold premium-gradient-text tracking-tight flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-secondary" />
          News Archive
        </h1>
        
        <div className="flex items-center justify-between glass-card p-4">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <p className="text-2xl font-bold text-slate-100">
              {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <button
            onClick={() => changeDate(1)}
            disabled={selectedDate.toDateString() === new Date().toDateString()}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6"
            >
              {newsItems.length > 0 ? (
                newsItems.map((news, index) => (
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
                  <div className="bg-slate-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-500/20">
                    <AlertCircle className="w-8 h-8 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-300">No news found for this date.</h3>
                    <p className="text-slate-500">Try selecting a different date from the archive.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
