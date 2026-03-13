"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Send, AlertCircle, CheckCircle2, Loader2, Trash2, LogOut, Edit2, X, Archive } from "lucide-react";
import Link from "next/link";
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
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/");
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
    <div className="max-w-2xl mx-auto space-y-12 pt-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="inline-block">
            <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase border-b border-primary/20 pb-2">
              Editorial Control
            </span>
          </div>
          <h1 className="text-5xl font-serif italic text-white tracking-tight">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/archive"
            className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white/10 transition-all"
          >
            Archive
          </Link>
          <button
            onClick={handleLogout}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-rose-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 md:p-12 space-y-10"
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-1">
              Brief Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="THE WORLD IN A SINGLE LINE..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-6 text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all min-h-[140px] resize-none font-serif italic text-lg"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-1">
              Select Category
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border",
                    category === cat
                      ? "bg-primary border-primary text-white shadow-xl shadow-primary/20"
                      : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/10"
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
            className="w-full bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-2xl transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Publish Intelligence"
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

      <div className="pt-12 border-t border-white/5 space-y-12">
        <section className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
            Topic Management
          </h2>
          <div className="space-y-6">
            <form onSubmit={handleAddCategory} className="flex gap-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="NEW VOLUME..."
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-full px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-slate-700"
              />
              <button
                type="submit"
                disabled={categoryLoading || !newCategory.trim()}
                className="bg-white/5 hover:bg-white/10 text-slate-300 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
              >
                {categoryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <div 
                  key={cat} 
                  className="group flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-600"
                >
                  {cat}
                  {cat !== "General" && (
                    <button 
                      onClick={() => handleDeleteCategory(cat)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-700 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
              Live Intelligence Briefs
            </h2>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
              {todaysNews.length} SECTIONS
            </span>
          </div>

          {newsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : todaysNews.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">Waiting for publication...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysNews.map((item) => (
                <div key={item.id} className="group glass-card p-6 flex flex-col gap-6 transition-all duration-500 hover:bg-white/[0.03]">
                  {editingId === item.id ? (
                    <div className="w-full space-y-4">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-slate-900/50 border border-primary/30 rounded-2xl px-6 py-4 text-sm text-slate-200 focus:outline-none focus:border-primary transition-colors min-h-[100px] font-serif italic"
                      />
                      <div className="flex items-center gap-4 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateNews(item.id)}
                          className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(item)}
                            className="p-1 text-slate-600 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-1 text-slate-600 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="font-serif italic text-lg text-slate-300 leading-relaxed pr-10">
                        {item.content}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
