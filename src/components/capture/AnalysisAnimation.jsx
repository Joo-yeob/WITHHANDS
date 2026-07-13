import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Brain, Sparkle, BookOpen, Check } from 'lucide-react';

const ANALYSIS_STEPS = [
  { label: '사진 스캔 중...', icon: Scan },
  { label: '장면 이해 중...', icon: Brain },
  { label: '생물 발견 중...', icon: Sparkle },
  { label: '도감 항목 작성 중...', icon: BookOpen },
];

export default function AnalysisAnimation({ step = 0 }) {
  const CurrentIcon = ANALYSIS_STEPS[step]?.icon || Sparkle;

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-12">
      {/* Elegant orb */}
      <div className="relative w-36 h-36">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-violet-200"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
        {/* Rotating arc */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#8B5CF6', borderRightColor: '#8B5CF6' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Pulse glow */}
        <motion.div
          className="absolute inset-4 rounded-full bg-violet-400/10 blur-md"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Inner circle with icon */}
        <motion.div
          className="absolute inset-6 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-600/10 flex items-center justify-center border border-violet-100"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <CurrentIcon className="w-7 h-7 text-violet-600" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {ANALYSIS_STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: i <= step ? 1 : 0.35, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  i < step
                    ? 'bg-violet-600 text-white'
                    : i === step
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-muted text-muted-foreground/50'
                }`}
              >
                {i < step ? (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                )}
              </div>
              <span
                className={`text-sm tracking-wide transition-colors ${
                  i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
              {i === step && (
                <div className="flex gap-1 ml-1">
                  {[0, 1, 2].map((d) => (
                    <motion.div
                      key={d}
                      className="w-1 h-1 rounded-full bg-violet-500"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}