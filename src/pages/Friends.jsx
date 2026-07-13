import React, { useState, useEffect } from 'react';
import { db } from '@/api/dbClient';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Copy, Check, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentProfile } from '@/lib/session';

export default function Friends() {
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const p = await getCurrentProfile();
        setProfile(p);
        if (p) {
          const f = await db.entities.Friend.filter({ owner_profile_id: p.id });
          setFriends(f);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCopyCode() {
    if (!profile?.friend_code) return;
    try {
      await navigator.clipboard.writeText(profile.friend_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: '복사 실패', variant: 'destructive' });
    }
  }

  async function handleShareCode() {
    if (!profile?.friend_code) return;
    const shareData = {
      title: '데일리덱스 친구 추가',
      text: `${profile?.nickname || '친구'}님의 데일리덱스 친구 코드: ${profile.friend_code}`,
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // cancelled
      }
    } else {
      handleCopyCode();
    }
  }

  async function handleAddFriend(e) {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code || !profile) return;

    if (code === profile.friend_code) {
      toast({ title: '자기 자신은 추가할 수 없어요', variant: 'destructive' });
      return;
    }

    setAdding(true);
    try {
      const results = await db.entities.UserProfile.filter({ friend_code: code });
      if (results.length === 0) {
        toast({ title: '존재하지 않는 코드예요', variant: 'destructive' });
        return;
      }

      const friendProfile = results[0];

      const existing = await db.entities.Friend.filter({
        owner_profile_id: profile.id,
        friend_profile_id: friendProfile.id,
      });
      if (existing.length > 0) {
        toast({ title: '이미 추가한 친구예요' });
        return;
      }

      const newFriend = await db.entities.Friend.create({
        owner_profile_id: profile.id,
        friend_profile_id: friendProfile.id,
        friend_code: friendProfile.friend_code,
        friend_nickname: friendProfile.nickname,
        friend_profile_image_url: friendProfile.profile_image_url || '',
      });

      // 상대방에게도 자동 추가 (이미 친구가 아닌 경우에만)
      const reverseExisting = await db.entities.Friend.filter({
        owner_profile_id: friendProfile.id,
        friend_profile_id: profile.id,
      });
      if (reverseExisting.length === 0) {
        await db.entities.Friend.create({
          owner_profile_id: friendProfile.id,
          friend_profile_id: profile.id,
          friend_code: profile.friend_code,
          friend_nickname: profile.nickname,
          friend_profile_image_url: profile.profile_image_url || '',
        });
      }

      setFriends([newFriend, ...friends]);
      setCodeInput('');
      toast({ title: `${friendProfile.nickname}님과 친구가 되었어요!` });
    } catch (e) {
      toast({ title: '추가에 실패했어요', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  }

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
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-violet-600" />
        <h1 className="font-heading text-2xl font-bold">친구</h1>
      </div>

      {/* My code */}
      {profile && (
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 mb-6 text-white">
          <p className="text-xs font-semibold text-violet-200 uppercase tracking-wide mb-2">내 친구 코드</p>
          <div className="flex items-center justify-between">
            <p className="font-heading text-3xl font-bold tracking-widest">{profile.friend_code}</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={handleShareCode}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-violet-200 mt-2">코드를 공유해서 친구를 추가하세요</p>
        </div>
      )}

      {/* Add friend */}
      <form onSubmit={handleAddFriend} className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">친구 코드로 추가</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            maxLength={5}
            placeholder="코드 입력"
            className="flex-1 h-12 rounded-xl bg-white border border-border px-4 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          <Button
            type="submit"
            disabled={adding || !codeInput.trim()}
            className="h-12 px-5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 font-heading font-bold"
          >
            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : '추가'}
          </Button>
        </div>
      </form>

      {/* Friends list */}
      <div>
        <h3 className="font-heading font-bold text-base mb-3">
          친구 목록 <span className="text-muted-foreground text-sm">({friends.length})</span>
        </h3>
        {friends.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border/50">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">아직 친구가 없어요</p>
            <p className="text-xs text-muted-foreground mt-1">코드를 공유해서 친구를 추가해 보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <Link
                key={f.id}
                to={`/friend/${f.id}`}
                className="bg-white rounded-2xl p-3 shadow-sm border border-border/50 flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-heading font-bold overflow-hidden shrink-0">
                  {f.friend_profile_image_url ? (
                    <img src={f.friend_profile_image_url} alt={f.friend_nickname} className="w-full h-full object-cover" />
                  ) : (
                    (f.friend_nickname || '?')[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-sm truncate">{f.friend_nickname}</p>
                  <p className="text-xs text-muted-foreground">코드: {f.friend_code}</p>
                </div>
                <div className="flex items-center gap-1 text-violet-600">
                  <BookOpen className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}