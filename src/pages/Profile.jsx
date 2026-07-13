import React, { useState, useEffect } from 'react';
import { db } from '@/api/dbClient';
import { LogOut, BookOpen, Star, Flame, ChevronRight, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RARITY_CONFIG, getRarityLabel } from '@/lib/creatureUtils';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { getCurrentProfile, clearSession } from '@/lib/session';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await getCurrentProfile();
        setProfile(p);
        const c = p
          ? await db.entities.Creature.filter({ owner_profile_id: p.id }, '-created_date', 500)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const rarityCounts = {};
  const typeCounts = {};
  creatures.forEach((c) => {
    rarityCounts[c.rarity] = (rarityCounts[c.rarity] || 0) + 1;
    (c.types || []).forEach((t) => { typeCounts[t] = (typeCounts[t] || 0) + 1; });
  });

  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const uniqueDays = new Set(creatures.map((c) => c.created_date?.split('T')[0]).filter(Boolean));

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-heading text-2xl font-bold overflow-hidden shrink-0">
          {profile?.profile_image_url ? (
            <img src={profile.profile_image_url} alt="프로필" className="w-full h-full object-cover" />
          ) : (
            (profile?.nickname || '탐')[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-xl font-bold truncate">{profile?.nickname || '탐험가'}</h1>
          <p className="text-sm text-muted-foreground truncate">{profile?.status_message || '상태메시지를 설정해 보세요'}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0"
          onClick={() => setShowEditModal(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-border/50">
          <BookOpen className="w-5 h-5 text-violet-500 mx-auto mb-1" />
          <p className="font-heading text-xl font-bold">{creatures.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">종</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-border/50">
          <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="font-heading text-xl font-bold">{rarityCounts['Legendary'] || 0}</p>
          <p className="text-[10px] text-muted-foreground font-medium">전설</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-border/50">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="font-heading text-xl font-bold">{uniqueDays.size}</p>
          <p className="text-[10px] text-muted-foreground font-medium">활동 일수</p>
        </div>
      </div>

      {/* Rarity breakdown */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 mb-4">
        <h3 className="font-heading font-bold text-sm mb-3">등급별 컬렉션</h3>
        <div className="space-y-2">
          {Object.entries(RARITY_CONFIG).map(([rarity, conf]) => {
            const count = rarityCounts[rarity] || 0;
            const pct = creatures.length ? (count / creatures.length) * 100 : 0;
            return (
              <div key={rarity} className="flex items-center gap-3">
                <div className="w-16 text-xs font-semibold" style={{ color: conf.color }}>{getRarityLabel(rarity)}</div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: conf.color }} />
                </div>
                <span className="text-xs font-bold w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top types */}
      {topTypes.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 mb-6">
          <h3 className="font-heading font-bold text-sm mb-3">선호 타입</h3>
          <div className="flex flex-wrap gap-2">
            {topTypes.map(([type, count]) => (
              <span key={type} className="inline-flex items-center gap-1 text-sm bg-secondary px-3 py-1.5 rounded-full font-medium">
                {type} <span className="text-xs text-muted-foreground">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <Link to="/friends">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-violet-500" />
            <span className="font-medium text-sm">친구</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>

      <Link to="/encyclopedia">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-violet-500" />
            <span className="font-medium text-sm">전체 도감 보기</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>

      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl h-12"
        onClick={() => { clearSession(); window.location.href = '/login'; }}
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium text-sm">로그아웃</span>
      </Button>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => {
            setProfile(updated);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}