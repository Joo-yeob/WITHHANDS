import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email);
    } catch (err) {
      // Always show success
    } finally {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-violet-50 to-background px-6">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
        </Link>

        <h1 className="font-heading text-2xl font-bold mb-2">비밀번호 재설정</h1>
        <p className="text-sm text-muted-foreground mb-6">이메일을 입력하면 재설정 링크를 보내드려요.</p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-sm text-green-800">해당 이메일로 계정이 존재하면, 곧 재설정 링크를 받으실 거예요.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 rounded-xl bg-white border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 font-heading font-bold"
            >
              {loading ? '전송 중...' : '재설정 링크 보내기'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}