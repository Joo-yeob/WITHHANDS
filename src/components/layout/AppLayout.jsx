import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, BookOpen, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/encyclopedia', icon: BookOpen, label: '도감' },
  { path: '/capture', icon: Plus, label: '', isCenter: true },
  { path: '/search', icon: Search, label: '검색' },
  { path: '/profile', icon: User, label: '내 정보' },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-24 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative -mt-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-300/50 active:scale-95 transition-transform"
                >
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-0.5 py-1 px-3"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-violet-600' : 'text-muted-foreground'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-violet-600' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}