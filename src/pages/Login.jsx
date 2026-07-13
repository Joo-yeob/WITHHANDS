import React, { useState, useRef } from 'react';
import { uploadImage } from '@/services/storageService';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { loginWithCredentials, createProfileWithCredentials, getStoredProfileId } from '@/lib/session';

export default function Login() {
  const [step, setStep] = useState('credentials');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const { toast } = useToast();

  if (getStoredProfileId()) {
    return <Navigate to="/" replace />;
  }

  async function handleCredentialsSubmit(e) {
    e.preventDefault();
    setError('');
    if (!loginId.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const result = await loginWithCredentials(loginId.trim(), password);
      if (result.status === 'ok') {
        toast({ title: '다시 오신 걸 환영해요!' });
        window.location.href = '/';
      } else if (result.status === 'wrong_password') {
        setError('비밀번호가 일치하지 않아요');
      } else {
        setStep('profile');
      }
    } catch (err) {
      setError(err.message || '로그인에 실패했어요');
    } finally {
      setLoading(false);
    }
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'profile');
      setProfileImageUrl(url);
    } catch {
      setError('이미지 업로드에 실패했어요');
    } finally {
      setUploading(false);
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setError('');
    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요');
      return;
    }
    setLoading(true);
    try {
      await createProfileWithCredentials({
        loginId: loginId.trim(),
        password,
        nickname: nickname.trim(),
        status_message: statusMessage.trim(),
        profile_image_url: profileImageUrl,
      });
      toast({ title: '환영해요, ' + nickname.trim() + '!' });
      window.location.href = '/';
    } catch (err) {
      setError(err.message || '프로필 생성에 실패했어요');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-violet-50 to-background px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold">WITHHANDS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 'credentials' ? '로그인 또는 새로 가입' : '프로필을 만들어 주세요'}
          </p>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">아이디</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                placeholder="아이디"
                className="w-full h-12 rounded-xl bg-white border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호"
                className="w-full h-12 rounded-xl bg-white border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 font-heading font-bold text-base"
            >
              {loading ? '확인 중...' : '시작하기'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              기존 아이디/비밀번호면 다시 로그인, 새 아이디면 프로필 설정으로 진행돼요
            </p>
          </form>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="flex justify-center mb-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-heading text-3xl font-bold"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : profileImageUrl ? (
                  <img src={profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  (nickname || '?')[0].toUpperCase()
                )}
                <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5 text-violet-600" />
                </div>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
                required
                placeholder="닉네임을 입력하세요"
                className="w-full h-12 rounded-xl bg-white border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">상태메시지</label>
              <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                maxLength={30}
                placeholder="상태메시지를 입력하세요 (선택)"
                className="w-full h-12 rounded-xl bg-white border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button
              type="submit"
              disabled={loading || uploading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 font-heading font-bold text-base"
            >
              {loading ? '생성 중...' : '모험 시작하기'}
            </Button>

            <button
              type="button"
              onClick={() => { setStep('credentials'); setError(''); }}
              className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-violet-600"
            >
              <ArrowLeft className="w-4 h-4" /> 뒤로
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
