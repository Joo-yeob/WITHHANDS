import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function ShareButton({ creature, className = '' }) {
  const { toast } = useToast();

  async function handleShare() {
    const shareData = {
      title: `데일리덱스 - ${creature.name}`,
      text: `${creature.name} (${creature.species})을(를) 발견했어요! ${creature.description || ''}`,
      url: `${window.location.origin}/creature/${creature.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast({ title: '링크를 복사했어요' });
      } catch {
        toast({ title: '공유할 수 없어요', variant: 'destructive' });
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full bg-black/30 text-white hover:bg-black/50 ${className}`}
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4" />
    </Button>
  );
}