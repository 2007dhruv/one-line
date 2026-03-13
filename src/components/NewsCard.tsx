"use client";

import { motion } from "framer-motion";
import { Clock, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface NewsCardProps {
  content: string;
  category: string;
  date: string;
  index: number;
}

export function NewsCard({ content, category, date, index }: NewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-8 group relative overflow-hidden transition-all duration-500 hover:bg-white/[0.03] hover:border-white/20"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            {category}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            {formatDate(date)}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <p className="font-serif italic text-xl md:text-2xl text-slate-100 leading-relaxed tracking-tight">
        {content}
      </p>
    </motion.div>
  );
}
