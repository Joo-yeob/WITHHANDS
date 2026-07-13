import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getRarityConfig, getRarityLabel, getTypeIcon } from '@/lib/creatureUtils';
import { motion } from 'framer-motion';
import FavoriteButton from '@/components/creatures/FavoriteButton';

export default function CreatureCard({ creature, index = 0, onFavoriteToggle }) {
  const rarityConf = getRarityConfig(creature.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/creature/${creature.id}`} className="block group">
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-border/50 hover:shadow-md transition-shadow">
          {/* Image */}
          <div className="aspect-square overflow-hidden relative">
            <img
              src={creature.image_url}
              alt={creature.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Rarity badge */}
            <div
              className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white backdrop-blur-sm"
              style={{ background: rarityConf.color + 'CC' }}
            >
              {getRarityLabel(creature.rarity)}
            </div>
            {/* Favorite button */}
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <FavoriteButton creature={creature} onToggle={onFavoriteToggle} />
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-heading font-bold text-sm truncate">{creature.name}</h3>
            <p className="text-[11px] text-muted-foreground truncate">{creature.species}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {(creature.types || []).slice(0, 2).map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-0.5 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full font-medium"
                >
                  {getTypeIcon(type)} {type}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: rarityConf.stars }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 fill-current"
                  style={{ color: rarityConf.color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}