import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

const IMAGES = [
  {
    url: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0266698151.firebasestorage.app/o/performance.jpg?alt=media",
    title: "Elite Performance",
    category: "Action"
  },
  {
    url: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0266698151.firebasestorage.app/o/slot_price.jpg?alt=media",
    title: "Slot Pricing",
    category: "Promotions"
  },
  {
    url: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0266698151.firebasestorage.app/o/easy_location.jpg?alt=media",
    title: "Easy Location",
    category: "Facilities"
  },
  {
    url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80",
    title: "Main Arena",
    category: "Night Match"
  },
  {
    url: "https://images.unsplash.com/photo-1510531704581-5b2870972060?auto=format&fit=crop&q=80",
    title: "Elite Training",
    category: "Action"
  },
  {
    url: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80",
    title: "Golden Hour Vibes",
    category: "Atmosphere"
  }
];

export default function Gallery() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div>
          <h2 className="text-5xl font-display font-black text-white tracking-tighter uppercase mb-4">
            THE <span className="text-hive-yellow">SIGHTS 📸</span>
          </h2>
          <p className="text-white/60 max-w-md">Step into the future of futsal. Our arena is designed for peak performance and maximum intensity.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-2 rounded-full border border-hive-yellow text-hive-yellow text-[10px] font-black uppercase tracking-widest">All Shots</div>
          <div className="px-6 py-2 rounded-full border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:border-white/20 transition-colors cursor-pointer">Arena</div>
          <div className="px-6 py-2 rounded-full border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:border-white/20 transition-colors cursor-pointer">Action</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {IMAGES.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-white/5 border border-white/10"
          >
            <img 
              src={img.url} 
              alt={img.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 grayscale group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-hive-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <span className="text-[10px] font-black text-hive-yellow uppercase tracking-[0.3em] mb-2 block opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                {img.category}
              </span>
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">
                {img.title}
              </h3>
            </div>

            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-hive-yellow/90 flex items-center justify-center text-hive-black opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
              <Zap size={20} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
