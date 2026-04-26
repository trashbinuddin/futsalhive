import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-5xl font-display font-black text-white mb-6 tracking-tighter uppercase">
            GET IN <span className="text-hive-yellow">TOUCH</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Have questions about bookings or events? Reach out to us. 
            We're located in the heart of Aftabnagar, ready to host your next match.
          </p>

          <div className="space-y-8">
            <a 
              href="https://maps.app.goo.gl/iNTViqqgGsroaYMn8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow flex-shrink-0 group-hover:bg-hive-yellow group-hover:text-hive-black transition-all">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1 uppercase tracking-wider">Location</h4>
                <p className="text-white/40 text-sm">China Project, Aftabnagar, Dhaka, Bangladesh</p>
                <span className="text-[10px] text-hive-yellow font-black uppercase tracking-widest mt-1 block">Open in Maps ↗</span>
              </div>
            </a>
            <a 
              href="tel:+8801894433325"
              className="flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow flex-shrink-0 group-hover:bg-hive-yellow group-hover:text-hive-black transition-all">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1 uppercase tracking-wider">Phone</h4>
                <p className="text-white/40 text-sm hover:text-hive-yellow transition-colors">+880 1894 43 3325</p>
                <span className="text-[10px] text-hive-yellow font-black uppercase tracking-widest mt-1 block">Click to Call ↗</span>
              </div>
            </a>
            <a 
              href="https://wa.me/8801894433325"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0 group-hover:bg-green-500 group-hover:text-white transition-all">
                <MessageCircle size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1 uppercase tracking-wider">WhatsApp</h4>
                <p className="text-white/40 text-sm">+880 1894 43 3325</p>
                <span className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-1 block">Message Us ↗</span>
              </div>
            </a>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow flex-shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1 uppercase tracking-wider">Email</h4>
                <p className="text-white/40 text-sm">info@futsalhive.com</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <a href="https://www.facebook.com/share/18g6LbxbX7/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-hive-yellow hover:text-hive-black transition-all">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/futsalhive" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-hive-yellow hover:text-hive-black transition-all">
              <Instagram size={20} />
            </a>
          </div>
        </div>

        <div className="glass-card p-8 md:p-12">
          <div className="card-title-hive text-white uppercase tracking-wider">Find Us</div>
          <div className="space-y-4 text-sm mb-10">
            <p><span className="text-hive-yellow font-bold mr-2">Location:</span> China Project, Aftabnagar, Dhaka</p>
            <p><span className="text-hive-yellow font-bold mr-2">Phone:</span> +880 1894 43 3325</p>
            <p><span className="text-hive-yellow font-bold mr-2">Web:</span> www.futsalhive.com</p>
          </div>

          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Name</label>
                <input type="text" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Email</label>
                <input type="email" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Message</label>
              <textarea rows={4} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow transition-colors resize-none"></textarea>
            </div>
            <button className="w-full bg-hive-yellow text-hive-black py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-transform active:scale-95">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
