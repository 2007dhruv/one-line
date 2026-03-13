"use client";

import Link from "next/link";
import { House, Calendar, Settings, Zap, LogIn, LogOut, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

const navItems = [
  { name: "Home", href: "/", icon: House },
  { name: "Archive", href: "/archive", icon: Calendar },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) checkAdmin(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    setIsAdmin(data?.role === "admin");
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-6">
      <div className="max-w-4xl mx-auto glass-card px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-primary transition-transform group-hover:scale-110 duration-500">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <span className="text-sm font-black text-white tracking-[0.4em] uppercase font-sans">
            One Line
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-8">
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300",
                    isActive
                      ? "text-primary"
                      : "text-slate-500 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300",
                  pathname.startsWith("/admin")
                    ? "text-primary"
                    : "text-slate-500 hover:text-white"
                )}
              >
                Admin
              </Link>
            )}
          </div>
          
          <div className="hidden md:block w-px h-4 bg-white/10 mx-2" />

          {session ? (
            <button
              onClick={handleLogout}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-rose-500 transition-all duration-300"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white/10 transition-all shadow-2xl shadow-black/20"
            >
              Join
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
