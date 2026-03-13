"use client";

import { useState, useEffect } from "react";
import { NewsFeed } from "../components/NewsFeed";
import { Zap, AlertCircle, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAllData();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAllData();
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchAllData() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    
    const [newsRes, catsRes] = await Promise.all([
      supabase
        .from("news")
        .select("*")
        .eq("published_at", today)
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("name")
        .order("name")
    ]);

    if (newsRes.data) setNewsItems(newsRes.data);
    if (catsRes.data) setCategories(catsRes.data.map(c => c.name));
    setLoading(false);
  }

  return (
    <div className="space-y-12">
      <header className="text-center space-y-8 py-12">
        <div className="inline-block">
          <span className="text-primary text-[10px] md:text-xs font-black tracking-[0.4em] uppercase border-b border-primary/20 pb-2">
            The Daily Curated Brief
          </span>
        </div>
        <h1 className="premium-gradient-text font-serif italic text-6xl md:text-8xl leading-[1.1] tracking-tight group">
          The World in a <br className="hidden md:block"/>
          <span className="relative inline-block transition-transform duration-500 group-hover:translate-x-4">Single Line.</span>
        </h1>
        <p className="text-slate-400 font-sans font-light text-base md:text-lg tracking-[0.3em] max-w-2xl mx-auto leading-relaxed uppercase">
          Sophisticated News Curation for the Modern Mind.
        </p>
      </header>

      <div className="grid gap-6 min-h-[350px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : !user ? (
          <div className="glass-card p-12 md:p-20 text-center space-y-12 relative overflow-hidden group/wall">
            <div className="space-y-4 max-w-md mx-auto">
              <h3 className="text-3xl font-serif italic text-white tracking-wide">Refinement Awaits</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                Sign in to access your personalized intelligence brief and the full historical archive.
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
                href="/login" 
                className="w-full sm:w-auto text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] py-2 transition-colors border-b border-white/5 hover:border-white/20"
              >
                Request Access
              </Link>
            </div>
          </div>
        ) : (
          <NewsFeed initialNews={newsItems} categories={categories} />
        )}
      </div>

      <footer className="text-center pt-8 border-t border-white/5">
        <p className="text-sm text-slate-500">
          Updated daily for focused preparation.
        </p>
      </footer>
    </div>
  );
}
