import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/api/dbClient';
import { Search } from 'lucide-react';
import CreatureCard from '@/components/creatures/CreatureCard';
import { getTypeIcon } from '@/lib/creatureUtils';
import { getCurrentProfile } from '@/lib/session';

export default function SearchPage() {
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);

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

  const usedTypes = useMemo(() => {
    const types = new Set();
    creatures.forEach((c) => (c.types || []).forEach((t) => types.add(t)));
    return [...types].sort();
  }, [creatures]);

  const results = useMemo(() => {
    let list = [...creatures];

    if (selectedType) {
      list = list.filter((c) => (c.types || []).includes(selectedType));
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.species?.toLowerCase().includes(q) ||
          c.fantasy_location?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [creatures, query, selectedType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <h1 className="font-heading text-2xl font-bold mb-4">검색</h1>

      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="이름, 종, 장소로 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-11 rounded-xl bg-white border border-border pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
        />
      </div>

      {/* Type chips */}
      {usedTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
          <button
            onClick={() => setSelectedType(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !selectedType ? 'bg-violet-600 text-white' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            전체
          </button>
          {usedTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
                selectedType === type
                  ? 'bg-violet-600 text-white'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {getTypeIcon(type)} {type}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {results.map((c, i) => (
            <CreatureCard key={c.id} creature={c} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-heading font-bold text-base mb-1">결과 없음</p>
          <p className="text-sm text-muted-foreground">다른 검색어를 시도해 보세요</p>
        </div>
      )}
    </div>
  );
}