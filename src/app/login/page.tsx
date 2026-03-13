"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { LogIn, Lock, Mail, AlertCircle, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check user role
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

          if (profile?.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.user?.identities?.length === 0) {
          throw new Error("User already exists. Please sign in instead.");
        }

        if (data.session) {
          router.push("/"); // normal user
        } else {
          setMessage("Registration successful! You can now sign in.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-16 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-block">
          <span className="text-primary text-[10px] md:text-xs font-black tracking-[0.4em] uppercase border-b border-primary/20 pb-2">
            The Daily Curated Brief
          </span>
        </div>
        <h1 className="premium-gradient-text font-serif italic text-6xl md:text-8xl leading-[1.1] tracking-tight">
          The World in a <br className="hidden md:block"/>Single Line
        </h1>
        <p className="text-slate-400 font-sans font-light text-base md:text-lg tracking-widest max-w-xl mx-auto uppercase">
          Elegance in Brevity.
        </p>
      </div>

      {/* Auth Module */}
      <div className="w-full max-w-lg">
        <div className="glass-card p-10 md:p-14 space-y-10 relative group">
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-serif text-white italic tracking-wide">
              {isLogin ? "Welcome Back" : "Refinement Begins Here"}
            </h3>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
              {isLogin ? "Sign in to access your intelligence brief" : "Join our sophisticated reader community"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2 group/input">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 transition-colors group-focus-within/input:text-primary">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within/input:text-primary" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-4 text-slate-200 focus:border-primary outline-none transition-all text-sm font-medium placeholder:text-slate-700"
                    placeholder="name@intelligence.com"
                  />
                </div>
              </div>

              <div className="space-y-2 group/input">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 transition-colors group-focus-within/input:text-primary">
                  Secret Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within/input:text-primary" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-4 text-slate-200 focus:border-primary outline-none transition-all text-sm font-medium placeholder:text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">{message}</p>
              </div>
            )}

            <div className="space-y-6">
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  isLogin ? "Enter Briefing" : "Confirm Membership"
                )}
              </button>
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] border-b border-white/5 pb-1 transition-all"
                >
                  {isLogin ? "Become a Member" : "Return to Log In"}
                </button>
              </div>
            </div>
          </form>

          {/* Minimal Footer Inside Card */}
          <div className="pt-4 text-center">
            <a href="#" className="text-[9px] font-medium text-slate-700 hover:text-slate-400 uppercase tracking-[0.4em] transition-colors">
              View Public Preview
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
