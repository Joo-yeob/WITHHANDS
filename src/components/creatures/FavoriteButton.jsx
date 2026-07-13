import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { db } from '@/api/dbClient';
import { useToast } from '@/components/ui/use-toast';

export default function FavoriteButton({ creature, onToggle, className = '' }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isFav = creature.is_favorite;

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const next = !isFav;
    try {
      await db.entities.Creature.update(creature.id, { is_favorite: next });
      onToggle?.({ ...creature, is_favorite: next });
      toast({
        title: next ? '즐겨찾기에 추가했어요' : '즐겨찾기를 해제했어요',
      });
    } catch (err) {
      toast({
        title: '실패했어요',
        description: err?.message || '다시 시도해주세요',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label="즐겨찾기"
      className={`flex items-center justify-center transition-transform active:scale-90 ${className}`}
    >
      <Star
        className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-white/70'}`}
        strokeWidth={2}
      />
    </button>
  );
}