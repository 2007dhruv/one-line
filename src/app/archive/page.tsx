"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, Loader2, Lock, ArrowRight, Search, Filter, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { NewsCard } from "../../components/NewsCard";
import Link from "next/link";
import { cn } from "../../lib/utils";

export default function ArchivePage() {
  const [view, setView] = useState<'years' | 'months' | 'days'>('years');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) fetchCategories();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchCategories();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("name").order("name");
    if (data) setCategories(data.map(c => c.name));
  }

  const fetchNews = async (year: number, month: number, day?: number) => {
    setLoading(true);
    let query = supabase.from("news").select("*");
    
    if (day) {
      const dateString = new Date(year, month, day).toISOString().split("T")[0];
      query = query.eq("published_at", dateString);
    } else {
      // Fetch whole month
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
      query = query.gte("published_at", startDate).lte("published_at", endDate);
    }

    const { data, error } = await query.order("published_at", { ascending: false }).order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching archive news:", error);
      setNewsItems([]);
    } else {
      setNewsItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session && view === 'days') {
      fetchNews(selectedYear, selectedMonth); // Default to whole month first
    }
  }, [session, view, selectedYear, selectedMonth]);

  const filteredNews = useMemo(() => {
    return newsItems.filter((item) => {
      const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [newsItems, searchQuery, selectedCategory]);

  const groupedNews = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredNews.forEach(item => {
      if (!groups[item.published_at]) groups[item.published_at] = [];
      groups[item.published_at].push(item);
    });
    return groups;
  }, [filteredNews]);

  const handleYearPick = (year: number) => {
    setSelectedYear(year);
    setView('months');
  };

  const handleMonthPick = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    const newDate = new Date(selectedYear, monthIndex, 1);
    setSelectedDate(newDate);
    setView('days');
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (authLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="glass-card p-12 md:p-20 text-center space-y-12 relative overflow-hidden group/wall max-w-2xl mx-auto mt-20">
        <div className="space-y-4 max-w-md mx-auto">
          <h3 className="text-3xl font-serif italic text-white tracking-wide">Refinement Awaits</h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
            Sign in to access the full historical intelligence archive.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/login" 
            className="w-full sm:w-auto bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] px-10 py-4 rounded-xl transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1"
          >
            Enter Briefing
          </Link>
          <Link 
            href="/" 
            className="w-full sm:w-auto text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] py-2 transition-colors border-b border-white/5 hover:border-white/20"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 pt-10">
      {/* Breadcrumbs / Navigation */}
      <nav className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
        <button 
          onClick={() => setView('years')}
          className={cn(
            "transition-colors",
            view === 'years' ? "text-primary" : "text-slate-500 hover:text-white"
          )}
        >
          Archive
        </button>
        {view !== 'years' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-800" />
            <button 
              onClick={() => setView('months')}
              className={cn(
                "transition-colors",
                view === 'months' ? "text-primary" : "text-slate-500 hover:text-white"
              )}
            >
              {selectedYear}
            </button>
          </>
        )}
        {view === 'days' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-800" />
            <span className="text-primary">{months[selectedMonth]}</span>
          </>
        )}
      </nav>

      <AnimatePresence mode="wait">
        {view === 'years' && (
          <motion.div
            key="years"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {years.map(year => (
              <button
                key={year}
                onClick={() => handleYearPick(year)}
                className="glass-card group p-12 text-center transition-all duration-500 hover:bg-white/[0.03] hover:translate-y-[-4px]"
              >
                <div className="mb-6 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all duration-500">
                  <CalendarIcon className="w-10 h-10 mx-auto" />
                </div>
                <span className="text-4xl font-serif italic text-slate-300 group-hover:text-white transition-colors tracking-tight">{year}</span>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-primary transition-colors">Select Volume</p>
              </button>
            ))}
          </motion.div>
        )}

        {view === 'months' && (
          <motion.div
            key="months"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {months.map((month, idx) => (
              <button
                key={month}
                onClick={() => handleMonthPick(idx)}
                className="glass-card group p-8 text-center transition-all duration-500 hover:bg-white/[0.03] flex flex-col items-center gap-4"
              >
                <div className="w-px h-8 bg-white/10 group-hover:bg-primary/40 group-hover:h-12 transition-all duration-500" />
                <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-400 group-hover:text-white">{month}</span>
                <span className="text-[10px] font-black text-slate-600 group-hover:text-primary uppercase tracking-widest">{String(idx + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </motion.div>
        )}

        {view === 'days' && (
          <motion.div
            key="days"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <header className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="space-y-4 text-center lg:text-left">
                <div className="inline-block">
                  <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase border-b border-primary/20 pb-2">
                    Monthly Intelligence
                  </span>
                </div>
                <h2 className="text-5xl font-serif italic text-white tracking-tight">
                  {months[selectedMonth]} {selectedYear}
                </h2>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-6 w-full lg:w-auto">
                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-full px-6 py-2">
                  <button
                    onClick={() => fetchNews(selectedYear, selectedMonth)}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                      !newsItems.some(n => n.published_at === selectedDate.toISOString().split('T')[0]) 
                      ? "text-primary" : "text-slate-500 hover:text-white"
                    )}
                  >
                    All
                  </button>
                  <div className="w-px h-3 bg-white/10" />
                  <input 
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      setSelectedDate(newDate);
                      fetchNews(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                    }}
                    className="bg-transparent text-[10px] font-black text-slate-300 uppercase tracking-widest focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within/search:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="SEARCH BRIEFINGS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-full py-3 pl-11 pr-6 text-[10px] font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/40 text-slate-200 placeholder:text-slate-600 w-48 sm:w-64 transition-all"
                    />
                  </div>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 focus:outline-none hover:bg-white/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="All">All Topics</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </header>

            <div className="space-y-16">
              {loading ? (
                <div className="flex items-center justify-center p-20">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              ) : Object.keys(groupedNews).length > 0 ? (
                Object.entries(groupedNews).map(([date, items]: [string, any]) => (
                  <div key={date} className="space-y-8">
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] whitespace-nowrap">
                        {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-primary/20 via-white/5 to-transparent" />
                    </div>
                    <div className="grid gap-8">
                      {items.map((news: any, index: number) => (
                        <NewsCard
                          key={news.id}
                          content={news.content}
                          category={news.category}
                          date={news.published_at}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-20 text-center space-y-6">
                  <div className="w-px h-12 bg-white/10 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif italic text-slate-300">No entries found.</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Consider adjusting your filters.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
