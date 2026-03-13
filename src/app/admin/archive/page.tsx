"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit2, Trash2, CheckCircle2, X, Archive, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { cn } from "../../../lib/utils";

export default function AdminArchivePage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

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
      fetchAllNews();
    }
  }

  async function fetchAllNews() {
    setLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) setNews(data);
    setLoading(false);
  }

  async function handleDeleteNews(id: string) {
    if (!confirm("Are you sure you want to delete this historic news item?")) return;

    const { error } = await supabase.from("news").delete().eq("id", id);
    if (!error) {
      setMessage({ type: "success", text: "News deleted successfully." });
      fetchAllNews();
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
      fetchAllNews();
    } else {
      setMessage({ type: "error", text: error.message });
    }
  }

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="space-y-1">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors mb-2 w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Archive className="w-8 h-8 text-primary" />
            News Archive
          </h1>
          <p className="text-slate-400 text-sm">
            Manage all historical news entries across the platform.
          </p>
        </div>
      </header>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl flex items-center gap-3",
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <p className="text-slate-400">No news entries found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.id}
              className="group glass-card p-5 flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
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
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded flex w-fit">
                        {item.category}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(item.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed pr-8">
                      {item.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity self-end md:self-start border border-white/5 bg-slate-900/50 rounded-lg p-1 shrink-0">
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
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
