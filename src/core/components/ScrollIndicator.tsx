import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/style';


//! Not working, needs to be fixed

interface ScrollIndicatorProps {
  scrollElement?: React.RefObject<HTMLDivElement | null>;
}

export function ScrollIndicator({ scrollElement }: ScrollIndicatorProps) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const el = scrollElement?.current;
    if (!el) return;

    const update = () => {
      const canScroll = el.scrollHeight > el.clientHeight;
      const atTop     = el.scrollTop <= 10;
      setHidden(!(canScroll && atTop));
    };

    const onScroll = () => window.requestAnimationFrame(update);

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollToBottom = () => {
    const el = scrollElement?.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToBottom}
      aria-label="Scroll to bottom"
      className={cn(
        'absolute bottom-6 left-1/2 transform -translate-x-1/2',
        'w-8 h-8 rounded-full bg-background shadow-sm flex',
        'justify-center items-center cursor-pointer hover:bg-muted/20 transition-colors',
        'animate-bounce transition-opacity opacity-70',
        hidden && 'opacity-0 pointer-events-none'
      )}
    >
      <ChevronDown />
    </button>
  );
}
