import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/api/dbClient';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import CreatureCard from '@/components/creatures/CreatureCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRarityLabel } from '@/lib/creatureUtils';
import { getCurrentProfile } from '@/lib/session';

const RARITY_OPTIONS = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

export default function Encyclopedia() {
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await getCurrentProfile();
        const c = p
          ? await db.entities.Creature.filter({ owner_profile_id: p.id }, '-created_date', 200)
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

  const updateCreature = (updated) => {
    setCreatures((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const filtered = useMemo(() => {
    let result = [...creatures];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.species?.toLowerCase().includes(q) ||
          (c.types || []).some((t) => t.toLowerCase().includes(q)) ||
          c.fantasy_location?.toLowerCase().includes(q)
      );
    }

    if (rarityFilter !== 'All') {
      result = result.filter((c) => c.rarity === rarityFilter);
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'rarity') {
      const order = { Legendary: 0, Epic: 1, Rare: 2, Uncommon: 3, Common: 4 };
      result.sort((a, b) => (order[a.rarity] ?? 5) - (order[b.rarity] ?? 5));
    }

    return result;
  }, [creatures, search, rarityFilter, sortBy]);

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl font-bold">도감</h1>
        <span className="text-sm text-muted-foreground font-medium">{creatures.length}종</span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="생물, 타입, 장소 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl bg-white border border-border pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          className="rounded-full text-xs gap-1"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          필터
        </Button>
        {rarityFilter !== 'All' && (
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full text-xs gap-1"
            onClick={() => setRarityFilter('All')}
          >
            {getRarityLabel(rarityFilter)} <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-border/50 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">등급</label>
            <div className="flex flex-wrap gap-1.5">
              {RARITY_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRarityFilter(r)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    rarityFilter === r
                      ? 'bg-violet-600 text-white'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {r === 'All' ? '전체' : getRarityLabel(r)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">정렬</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">최신순</SelectItem>
                <SelectItem value="oldest">오래된순</SelectItem>
                <SelectItem value="name">이름순</SelectItem>
                <SelectItem value="rarity">등급순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((c, i) => (
            <CreatureCard key={c.id} creature={c} index={i} onFavoriteToggle={updateCreature} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-heading font-bold text-base mb-1">생물을 찾을 수 없어요</p>
          <p className="text-sm text-muted-foreground">
            {creatures.length === 0
              ? '사진을 올려 생물을 발견해 보세요!'
              : '검색어나 필터를 조정해 보세요'}
          </p>
        </div>
      )}
    </div>
  );
}