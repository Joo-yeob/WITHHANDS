import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Sparkles } from 'lucide-react';
import { getRarityConfig, getRarityLabel, getTypeIcon } from '@/lib/creatureUtils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function RevealAnimation({ creature, onDone }) {
  const rarityConf = getRarityConfig(creature.rarity);

  useEffect(() => {
    if (navigator.vibrate) navigator.vibrate(200);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-violet-950/95 to-purple-950/95 backdrop-blur-xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* New Species banner */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="flex items-center gap-2 mb-6"
      >
        <Sparkles className="w-5 h-5 text-amber-400" />
        <span className="font-heading text-amber-400 text-sm font-bold tracking-widest uppercase">
          새로운 종 발견!
        </span>
        <Sparkles className="w-5 h-5 text-amber-400" />
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 150 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden bg-white shadow-2xl"
      >
        {/* Image */}
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={creature.image_url}
            alt={creature.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2"
              style={{ background: rarityConf.color }}
            >
              {Array.from({ length: rarityConf.stars }).map((_, i) => '★').join('')} {getRarityLabel(creature.rarity)}
            </div>
            <h2 className="font-heading text-3xl font-bold text-white">{creature.name}</h2>
            <p className="text-white/80 text-sm">{creature.species}</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(creature.types || []).map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 text-xs bg-secondary px-2.5 py-1 rounded-full font-semibold"
              >
                {getTypeIcon(type)} {type}
              </span>
            ))}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            "{creature.description}"
          </p>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{creature.fantasy_location}</span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex gap-3 mt-8 w-full max-w-sm"
      >
        <Link to={`/creature/${creature.id}`} className="flex-1">
          <Button className="w-full rounded-xl h-12 font-heading font-bold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
            항목 보기
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={onDone}
          className="rounded-xl h-12 px-6 font-heading font-bold border-white/20 text-white hover:bg-white/10 bg-transparent"
        >
          완료
        </Button>
      </motion.div>
    </motion.div>
  );
}