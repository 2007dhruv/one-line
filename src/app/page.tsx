import { NewsCard } from "../components/NewsCard";
import { Zap, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export const revalidate = 3600; // Revalidate every hour

async function getTodayNews() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("published_at", today)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching news:", error);
    return [];
  }
  return data;
}

export default async function Home() {
  const newsItems = await getTodayNews();

  return (
    <div className="space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-pulse">
          <Zap className="w-4 h-4" />
          Today's Quick Updates
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-100">
          Read <span className="premium-gradient-text">Everything</span> <br />
          In One Line.
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          The essential news for government exam preparation, 
          delivered daily in a quick-read format.
        </p>
      </header>

      <div className="grid gap-6">
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
            <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-200">No news for today yet.</h3>
              <p className="text-slate-400">Check back later for today's top 10 updates.</p>
            </div>
          </div>
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
