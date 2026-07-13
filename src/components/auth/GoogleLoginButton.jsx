import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertCircle } from 'lucide-react';

function isInWebview() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  // iOS in-app browsers (not Safari)
  if (/iPad|iPhone|iPod/.test(ua) && !/Safari\/\d/.test(ua) && !/CriOS/.test(ua)) return true;
  // Android WebView
  if (/Android/.test(ua) && /;\swv\)/.test(ua)) return true;
  if (/Android/.test(ua) && /Version\/\d/.test(ua) && /Chrome\/\d/.test(ua) && !/Chrome\/\d+\.\d+\.\d+\.\d+\sMobile/.test(ua)) {
    // Could be webview — check for wv flag
    if (/wv/.test(ua)) return true;
  }
  // In-app browsers
  if (/KAKAOTALK/.test(ua)) return true;
  if (/Instagram/.test(ua)) return true;
  if (/\bFB(AN|AV|RV|SV|BV)\b/.test(ua)) return true;
  if (/Line\/|NAVER/.test(ua)) return true;
  // PWA standalone
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if (window.navigator.standalone === true) return true;

  return false;
}

export default function GoogleLoginButton({ redirectUrl = '/', className = '' }) {
  const [showGuide, setShowGuide] = useState(false);

  function handleGoogleLogin() {
    if (isInWebview()) {
      setShowGuide(true);
      return;
    }
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
  }

  function openInBrowser() {
    // Try multiple methods to open in system browser
    const url = window.location.href;
    // For iOS
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  if (showGuide) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
          <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-amber-800 font-medium mb-1">
            이 브라우저에서는 Google 로그인이 차돼요
          </p>
          <p className="text-xs text-amber-700/80 leading-relaxed">
            인앱 브라우저나 앱 내 웹뷰에서는 Google 보안 정책으로 인해 로그인할 수 없어요. 아래 버튼을 눌러 기본 브라우저(Safari, Chrome)로 열어서 로그인해 주세요.
          </p>
        </div>
        <Button
          variant="outline"
          className={`w-full h-12 rounded-xl font-medium ${className}`}
          onClick={openInBrowser}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          기본 브라우저로 열기
        </Button>
        <button
          className="w-full text-sm text-violet-600 font-medium"
          onClick={() => setShowGuide(false)}
        >
          이메일로 로그인하기
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className={`w-full h-12 rounded-xl font-medium ${className}`}
      onClick={handleGoogleLogin}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Google로 계속하기
    </Button>
  );
}