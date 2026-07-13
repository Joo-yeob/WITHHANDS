import React, { useState, useEffect } from 'react';
import { db } from '@/api/dbClient';
import { Link } from 'react-router-dom';
import { Plus, Flame, BookOpen, Sparkles, Star } from 'lucide-react';
import CreatureCardSmall from '@/components/creatures/CreatureCardSmall';
import { motion } from 'framer-motion';
import { RARITY_CONFIG, getRarityLabel } from '@/lib/creatureUtils';
import { getCurrentProfile } from '@/lib/session';

export default function Home() {
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const p = await getCurrentProfile();
        setProfile(p);
        const c = p
          ? await db.entities.Creature.filter({ owner_profile_id: p.id }, '-created_date', 50)
          : [];
        setCreatures(c);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todaysCount = creatures.filter(
    (c) => c.created_date && c.created_date.startsWith(today)
  ).length;
  const favoriteCreatures = creatures.filter((c) => c.is_favorite);
  const recentCreatures = creatures.slice(0, 10);

  const updateCreature = (updated) => {
    setCreatures((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const uniqueDays = [...new Set(creatures.map((c) => c.created_date?.split('T')[0]).filter(Boolean))].sort().reverse();
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(d);
    expected.setDate(expected.getDate() - i);
    if (uniqueDays[i] === expected.toISOString().split('T')[0]) {
      streak++;
    } else {
      break;
    }
  }

  const rarityCounts = {};
  creatures.forEach((c) => { rarityCounts[c.rarity] = (rarityCounts[c.rarity] || 0) + 1; });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground font-medium">다시 오신 걸 환영해요,</p>
          <h1 className="font-heading text-2xl font-bold">
            {profile?.nickname || '탐험가'}
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 rounded-full px-3 py-1.5">
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-700">{streak}</span>
          <span className="text-xs text-amber-600">일 연속</span>
        </div>
      </div>

      {/* Quick capture CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/capture">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-700 p-6 mb-6 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-violet-200">
                  HANDS — 손으로 만드는 도감
                </span>
              </div>
              <h2 className="font-heading text-xl font-bold mb-1">
                손으로 찍는 모든 것
              </h2>
              <p className="text-sm text-violet-200">
                뭐든 찍으면 당신의 도감에 기록돼요
              </p>
            </div>
            <div className="absolute right-4 bottom-4 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-border/50">
          <p className="font-heading text-2xl font-bold text-violet-600">{creatures.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">발견</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-border/50">
          <p className="font-heading text-2xl font-bold text-emerald-600">{todaysCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium">오늘</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-border/50">
          <p className="font-heading text-2xl font-bold text-amber-600">
            {rarityCounts['Legendary'] || 0}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">전설</p>
        </div>
      </div>

      {/* Favorites */}
      {favoriteCreatures.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-base flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              즐겨찾기
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {favoriteCreatures.map((c) => (
              <CreatureCardSmall key={c.id} creature={c} onFavoriteToggle={updateCreature} />
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      {recentCreatures.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-base">최근 생물</h3>
            <Link to="/encyclopedia" className="text-xs text-violet-600 font-semibold">
              전체보기 →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {recentCreatures.map((c) => (
              <CreatureCardSmall key={c.id} creature={c} onFavoriteToggle={updateCreature} />
            ))}
          </div>
        </section>
      )}

      {/* Collection breakdown */}
      {creatures.length > 0 && (
        <section>
          <h3 className="font-heading font-bold text-base mb-3">컬렉션</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 space-y-2.5">
            {Object.entries(RARITY_CONFIG).map(([rarity, conf]) => {
              const count = rarityCounts[rarity] || 0;
              return (
                <div key={rarity} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: conf.color }} />
                  <span className="text-sm font-medium flex-1">{getRarityLabel(rarity)}</span>
                  <span className="text-sm font-bold" style={{ color: conf.color }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {creatures.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🌟</div>
          <h3 className="font-heading font-bold text-lg mb-2">도감이 비어 있어요</h3>
          <p className="text-sm text-muted-foreground mb-4">
            첫 사진을 올려 첫 생물을 발견해 보세요!
          </p>
          <Link to="/capture">
            <button className="bg-violet-600 text-white px-6 py-3 rounded-full font-heading font-bold text-sm hover:bg-violet-700 transition-colors">
              탐험 시작하기
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}