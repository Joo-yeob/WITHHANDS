import React, { useState, useEffect } from 'react';
import { db } from '@/api/dbClient';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatureCard from '@/components/creatures/CreatureCard';
import { getRarityLabel, RARITY_CONFIG } from '@/lib/creatureUtils';

export default function FriendCollection() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [friendRecord, friendProfile] = await Promise.all([
          db.entities.Friend.get(friendId),
          db.entities.Friend.get(friendId).then((f) =>
            db.entities.UserProfile.get(f.friend_profile_id)
          ),
        ]);
        setFriend(friendProfile);
        const c = await db.entities.Creature.filter(
          { owner_profile_id: friendRecord.friend_profile_id },
          '-created_date',
          200
        );
        setCreatures(c);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [friendId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const rarityCounts = {};
  creatures.forEach((c) => {
    rarityCounts[c.rarity] = (rarityCounts[c.rarity] || 0) + 1;
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-heading text-xl font-bold">친구 도감</h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-heading text-2xl font-bold overflow-hidden shrink-0">
          {friend?.profile_image_url ? (
            <img src={friend.profile_image_url} alt={friend.nickname} className="w-full h-full object-cover" />
          ) : (
            (friend?.nickname || '?')[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-xl font-bold truncate">{friend?.nickname || '친구'}</h2>
          <p className="text-sm text-muted-foreground">코드: {friend?.friend_code}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-border/50">
          <BookOpen className="w-5 h-5 text-violet-500 mx-auto mb-1" />
          <p className="font-heading text-xl font-bold">{creatures.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">발견</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-border/50">
          <p className="font-heading text-xl font-bold text-amber-600">{rarityCounts['Legendary'] || 0}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">전설</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-border/50">
          <p className="font-heading text-xl font-bold text-emerald-600">
            {Object.keys(rarityCounts).length}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">등급</p>
        </div>
      </div>

      {creatures.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {creatures.map((c, i) => (
            <CreatureCard key={c.id} creature={c} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📖</div>
          <p className="font-heading font-bold text-base mb-1">아직 발견한 생물이 없어요</p>
          <p className="text-sm text-muted-foreground">친구가 사진을 올리면 여기에 표시돼요</p>
        </div>
      )}
    </div>
  );
}