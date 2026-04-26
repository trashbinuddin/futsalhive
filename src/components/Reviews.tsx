import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: "Rahat Ahmed",
    role: "Regular Player",
    text: "The best turf in Aftabnagar! The lighting is professional and the grass quality is top-notch. Highly recommended for 5v5 matches.",
    rating: 5
  },
  {
    name: "Samiul Islam",
    role: "Team Captain",
    text: "Booking is so smooth now. The new website is super fast and the advance payment option is very convenient.",
    rating: 5
  },
  {
    name: "Tanvir Hossain",
    role: "Football Enthusiast",
    text: "Great atmosphere and friendly staff. The arena feels futuristic with the new design. Love playing here at night!",
    rating: 5
  }
];

export default function Reviews() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-black text-white mb-4 tracking-tighter">WHAT THE PLAYERS SAY</h2>
        <p className="text-white/60">Real feedback from our regular hive members.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {REVIEWS.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="glass-card p-8 relative group hover:scale-[1.02] transition-transform"
          >
            <Quote className="absolute top-6 right-6 text-hive-yellow/20 w-12 h-12" />
            <div className="flex gap-1 mb-4">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} size={16} className="fill-hive-yellow text-hive-yellow" />
              ))}
            </div>
            <p className="text-white/80 italic mb-6 leading-relaxed">"{review.text}"</p>
            <div>
              <div className="text-white font-bold">{review.name}</div>
              <div className="text-xs text-hive-yellow uppercase tracking-widest font-black">{review.role}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
