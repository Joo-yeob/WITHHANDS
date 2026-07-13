import React, { useState, useRef } from 'react';
import { uploadImage } from '@/services/storageService';
import { X, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { updateCurrentProfile } from '@/lib/session';

export default function EditProfileModal({ profile, onClose, onSave }) {
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [statusMessage, setStatusMessage] = useState(profile?.status_message || '');
  const [profileImageUrl, setProfileImageUrl] = useState(profile?.profile_image_url || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const { toast } = useToast();

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'profile');
      setProfileImageUrl(url);
    } catch {
      toast({ title: '이미지 업로드 실패', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateCurrentProfile({
        nickname,
        status_message: statusMessage,
        profile_image_url: profileImageUrl,
      });
      toast({ title: '프로필을 수정했어요' });
      onSave(updated);
    } catch {
      toast({ title: '저장 실패', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-28 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-bold">프로필 수정</h2>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-heading text-3xl font-bold"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : profileImageUrl ? (
              <img src={profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              (nickname || '탐')[0].toUpperCase()
            )}
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-violet-600" />
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            placeholder="닉네임을 입력하세요"
            className="w-full h-11 rounded-xl bg-white border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
          />
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">상태메시지</label>
          <input
            type="text"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            maxLength={30}
            placeholder="상태메시지를 입력하세요"
            className="w-full h-11 rounded-xl bg-white border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || uploading || !nickname.trim()}
          className="w-full h-12 rounded-xl font-heading font-bold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : '저장하기'}
        </Button>
      </div>
    </div>
  );
}