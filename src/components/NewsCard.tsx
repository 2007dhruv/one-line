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
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card p-6 news-card-hover group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
      
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full">
          <Tag className="w-3 h-3" />
          {category}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          {formatDate(date)}
        </div>
      </div>

      <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed">
        {content}
      </p>
    </motion.div>
  );
}
