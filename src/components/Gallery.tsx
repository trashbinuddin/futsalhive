import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';

const DEFAULT_IMAGES = [
  {
    url: "https://picsum.photos/seed/football1/800/600",
    title: "Elite Performance",
    category: "Action"
  },
  {
    url: "https://picsum.photos/seed/arena_night/800/600",
    title: "Night Match",
    category: "Promotions"
  },
  {
    url: "https://picsum.photos/seed/sports_facility/800/600",
    title: "Easy Location",
    category: "Facilities"
  },
  {
    url: "https://picsum.photos/seed/stadium_main/800/600",
    title: "Main Arena",
    category: "Night Match"
  },
  {
    url: "https://picsum.photos/seed/training_session/800/600",
    title: "Elite Training",
    category: "Action"
  }
];

function GalleryImageCard({ img, delayIndex }: { img: any; delayIndex: number; key?: string | number }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: delayIndex * 0.1 }}
      viewport={{ once: true, margin: "100px" }}
      className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-white/5 border border-white/10"
    >
      {/* Skeleton Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
      )}

      <img 
        src={img.url} 
        alt={img.title}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 grayscale group-hover:grayscale-0 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
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
  );
}

export default function Gallery() {
  const { images, loading } = useGallery();
  const [filter, setFilter] = useState('All Shorts');
  
  // Use DB images if available, fallback to default placeholders if empty
  const rawImages = images.length > 0 ? images : DEFAULT_IMAGES;

  // Clean up any trailing spaces from the DB data during render so "Facilities " and "Facilities" merge
  const displayImages = rawImages.map(img => ({ ...img, category: img.category.trim() }));

  const categories = ['All Shorts', ...Array.from(new Set(displayImages.map(img => img.category)))];

  const filteredImages = filter === 'All Shorts' ? displayImages : displayImages.filter(img => img.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div>
          <h2 className="text-5xl font-display font-black text-white tracking-tighter uppercase mb-4">
            THE <span className="text-hive-yellow">SIGHTS</span>
          </h2>
          <p className="text-white/60 max-w-md">Step into the future of futsal. Our arena is designed for peak performance and maximum intensity.</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto">
          {categories.map((cat, idx) => (
             <div 
               key={idx}
               onClick={() => setFilter(cat)}
               className={`px-6 py-2 rounded-full whitespace-nowrap border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors ${
                 filter === cat 
                   ? 'border-hive-yellow text-hive-yellow' 
                   : 'border-white/10 text-white/40 hover:border-white/20'
               }`}
             >
               {cat}
             </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img, i) => (
            <GalleryImageCard key={i} img={img} delayIndex={i} />
          ))}
        </div>
      )}
    </div>
  );
}
