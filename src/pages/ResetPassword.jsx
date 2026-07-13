import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';

export default function ResetPassword() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않아요');
      return;
    }
    setLoading(true);
    try {
      await supabase.auth.updateUser({ password });
      window.location.href = '/login';
    } catch (err) {
      setError(err.message || '재설정에 실패했어요');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-violet-50 to-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold mb-6">새 비밀번호 설정</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="새 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-12 rounded-xl bg-white border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full h-12 rounded-xl bg-white border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 font-heading font-bold"
          >
            {loading ? '재설정 중...' : '비밀번호 재설정'}
          </Button>
        </form>
      </div>
    </div>
  );
}