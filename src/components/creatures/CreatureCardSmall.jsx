import React from 'react';
import { Link } from 'react-router-dom';
import { getRarityConfig } from '@/lib/creatureUtils';
import FavoriteButton from '@/components/creatures/FavoriteButton';

export default function CreatureCardSmall({ creature, onFavoriteToggle }) {
  const rarityConf = getRarityConfig(creature.rarity);

  return (
    <Link to={`/creature/${creature.id}`} className="block flex-shrink-0">
      <div className="w-28 rounded-2xl overflow-hidden bg-white shadow-sm border border-border/50 relative">
        <div className="aspect-square overflow-hidden relative">
          <img
            src={creature.image_url}
            alt={creature.name}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: rarityConf.bg }}
          />
        </div>
        <div className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <FavoriteButton creature={creature} onToggle={onFavoriteToggle} />
        </div>
        <div className="p-2">
          <p className="font-heading font-bold text-xs truncate">{creature.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{creature.species}</p>
        </div>
      </div>
    </Link>
  );
}