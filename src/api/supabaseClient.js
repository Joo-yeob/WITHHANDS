import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

let supabase;

try {
  supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  );
} catch (e) {
  console.error('Supabase 클라이언트 초기화 실패:', e);
  // Fallback dummy client so db.entities stays defined
  supabase = {
    from: () => {
      throw new Error('Supabase가 설정되지 않았습니다. .env 파일을 확인해주세요.');
    },
  };
}

export { supabase };