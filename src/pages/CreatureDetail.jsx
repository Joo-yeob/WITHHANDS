import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '@/api/dbClient';
import { ArrowLeft, MapPin, Calendar, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRarityConfig, getRarityLabel, getTypeIcon, formatDate } from '@/lib/creatureUtils';
import { motion } from 'framer-motion';
import CreatureCardSmall from '@/components/creatures/CreatureCardSmall';
import FavoriteButton from '@/components/creatures/FavoriteButton';
import ShareButton from '@/components/creatures/ShareButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

export default function CreatureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creature, setCreature] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await db.entities.Creature.get(id);
        setCreature(c);

        if (c.types?.length) {
          const all = await db.entities.Creature.list('-created_date', 50);
          const matches = all.filter(
            (x) => x.id !== c.id && (x.types || []).some((t) => c.types.includes(t))
          ).slice(0, 6);
          setSimilar(matches);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDelete() {
    await db.entities.Creature.delete(id);
    toast({ title: '도감에서 생물이 삭제되었어요' });
    navigate('/encyclopedia');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!creature) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg font-heading font-bold">생물을 찾을 수 없어요</p>
        <Link to="/encyclopedia">
          <Button variant="outline" className="rounded-xl">도감으로</Button>
        </Link>
      </div>
    );
  }

  const rarityConf = getRarityConfig(creature.rarity);

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Hero image */}
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={creature.image_url}
            alt={creature.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Favorite + Delete buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <FavoriteButton
              creature={creature}
              onToggle={(updated) => setCreature(updated)}
              className="w-full h-full"
            />
          </div>
          <ShareButton creature={creature} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/30 text-white hover:bg-red-600/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>{creature.name}을(를) 방출할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 생물이 도감에서 영구히 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-red-600 hover:bg-red-700">
                  방출
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2"
              style={{ background: rarityConf.color }}
            >
              {Array.from({ length: rarityConf.stars }).map(() => '★').join('')} {getRarityLabel(creature.rarity)}
            </div>
            <h1 className="font-heading text-3xl font-bold text-white">{creature.name}</h1>
            <p className="text-white/80 text-sm">{creature.species}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-2 relative z-10 space-y-5">
        {/* Type badges */}
        <div className="flex flex-wrap gap-2">
          {(creature.types || []).map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 text-sm bg-white px-3 py-1.5 rounded-full font-semibold shadow-sm border border-border/50"
            >
              {getTypeIcon(type)} {type}
            </span>
          ))}
        </div>

        {/* Color palette */}
        {creature.primary_colors?.length > 0 && (
          <div className="flex gap-2">
            {creature.primary_colors.map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full shadow-sm border-2 border-white"
                style={{ background: color }}
              />
            ))}
          </div>
        )}

        {/* Encyclopedia entry */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/50">
          <h3 className="font-heading font-bold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
            도감 항목
          </h3>
          <p className="text-sm leading-relaxed">{creature.description}</p>
        </div>

        {/* World info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">위치</span>
            </div>
            <p className="font-heading font-bold text-sm">{creature.fantasy_location}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">발견일</span>
            </div>
            <p className="font-heading font-bold text-sm">
              {formatDate(creature.capture_date || creature.created_date)}
            </p>
          </div>
        </div>

        {/* World description */}
        {creature.world_description && (
          <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
            <h3 className="font-heading font-bold text-sm mb-2 text-violet-700">🌍 세계 관</h3>
            <p className="text-sm text-violet-900/80 leading-relaxed">{creature.world_description}</p>
          </div>
        )}

        {/* Scene summary */}
        {creature.scene_summary && (
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <h3 className="font-heading font-bold text-sm mb-2 text-amber-700">📸 장면 분석</h3>
            <p className="text-sm text-amber-900/80 leading-relaxed">{creature.scene_summary}</p>
          </div>
        )}

        {/* Similar creatures */}
        {similar.length > 0 && (
          <section>
            <h3 className="font-heading font-bold text-base mb-3">비슷한 생물</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {similar.map((c) => (
                <CreatureCardSmall key={c.id} creature={c} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}