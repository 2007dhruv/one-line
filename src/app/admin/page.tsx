"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Send, AlertCircle, CheckCircle2, Loader2, Trash2, LogOut, Edit2, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utils";


export default function AdminPage() {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [todaysNews, setTodaysNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchCategories();
    fetchTodaysNews();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .order("name");
    
    if (data) {
      setCategories(data.map(c => c.name));
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setCategoryLoading(true);
    const { error } = await supabase
      .from("categories")
      .insert([{ name: newCategory.trim() }]);

    if (!error) {
      setNewCategory("");
      fetchCategories();
    } else {
      alert(error.message);
    }
    setCategoryLoading(false);
  }

  async function handleDeleteCategory(name: string) {
    if (name === "General") {
      alert("Common categories like 'General' cannot be deleted.");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("name", name);

    if (!error) {
      fetchCategories();
      if (category === name) setCategory("General");
    } else {
      alert(error.message);
    }
  }

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
    } else {
      setAuthLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  async function fetchTodaysNews() {
    setNewsLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("published_at", today)
      .order("created_at", { ascending: false });

    if (data) {
      setTodaysNews(data);
    }
    setNewsLoading(false);
  }

  async function handleDeleteNews(id: string) {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    const { error } = await supabase.from("news").delete().eq("id", id);
    if (!error) {
      setMessage({ type: "success", text: "News deleted successfully." });
      fetchTodaysNews();
    } else {
      setMessage({ type: "error", text: error.message });
    }
  }

  async function handleUpdateNews(id: string) {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from("news")
      .update({ content: editContent.trim() })
      .eq("id", id);

    if (!error) {
      setMessage({ type: "success", text: "News updated successfully." });
      setEditingId(null);
      fetchTodaysNews();
    } else {
      setMessage({ type: "error", text: error.message });
    }
  }

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setMessage(null);

    // Placeholder for actual auth check
    // In a real app, we would use Supabase Auth and RLS
    const { error } = await supabase.from("news").insert([
      {
        content: content.trim(),
        category: category,
        published_at: new Date().toISOString().split("T")[0],
      },
    ]);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "News published successfully!" });
      setContent("");
      setCategory("General");
      fetchTodaysNews(); // Refresh the list after publishing
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold premium-gradient-text tracking-tight flex items-center gap-3">
            <Plus className="w-8 h-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Add and manage daily quick updates for today.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors text-sm font-medium border border-white/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">
              News Content (One Line)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g., Government announces new simplified recruitment process for civil services..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[120px] resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    category === cat
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publish News
              </>
            )}
          </button>
        </form>

        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={cn(
              "mt-6 p-4 rounded-xl flex items-center gap-3",
              message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
            )}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}
      </motion.div>

      <div className="pt-8 border-t border-white/5 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            Manage Categories
          </h2>
          <div className="space-y-4">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={categoryLoading || !newCategory.trim()}
                className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl text-sm font-medium border border-primary/20 transition-all flex items-center gap-2"
              >
                {categoryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div 
                  key={cat} 
                  className="group flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-slate-400"
                >
                  {cat}
                  {cat !== "General" && (
                    <button 
                      onClick={() => handleDeleteCategory(cat)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            Admin Troubleshooting
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Ensure your <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs text-primary">.env.local</code> 
              file contains your Supabase credentials.
            </p>
            
            {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <h3 className="text-amber-500 text-sm font-bold flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Environment Error
                </h3>
                <p className="text-xs text-amber-500/70">
                  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are missing. 
                  Please restart your terminal and run <code className="bg-white/5 px-1 py-0.5 rounded">npm run dev</code> again.
                </p>
              </div>
            )}
            
            {(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <h3 className="text-emerald-500 text-sm font-bold flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Environment Connected
                </h3>
                <p className="text-xs text-emerald-500/70">
                  Supabase credentials loaded successfully.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW SECTION: Manage Today's News */}
      <div className="pt-8 border-t border-white/5 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-200">Manage Today's News</h2>
          <span className="bg-white/5 text-slate-400 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
            {todaysNews.length} items
          </span>
        </div>

        {newsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : todaysNews.length === 0 ? (
          <div className="text-center py-8 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-slate-400 text-sm">No news published today yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysNews.map((item) => (
              <div key={item.id} className="group glass-card p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {editingId === item.id ? (
                  <div className="flex-1 w-full space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-900/50 border border-primary/30 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-primary transition-colors min-h-[80px]"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateNews(item.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded flex w-fit">
                        {item.category}
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed pr-4">
                        {item.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-start border border-white/5 bg-slate-900/50 rounded-lg p-1">
                      <button
                        onClick={() => startEditing(item)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors"
                        title="Edit News"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-white/10" />
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                        title="Delete News"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
