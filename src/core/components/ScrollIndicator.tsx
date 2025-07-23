import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/style';

export function ScrollIndicator() {
  const [hidden, setHidden] = useState(true);

  const updateVisibility = () => {
    const isScrollable = document.body.scrollHeight > window.innerHeight;
    const isAtTop = window.scrollY <= 10;
    setHidden(!(isScrollable && isAtTop));
  };

  useEffect(() => {
    const handleScroll = () => {
      updateVisibility();
    };
    const handleResize = () => {
      updateVisibility();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    updateVisibility();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToBottom}
      className={cn(
        "fixed bottom-6 size-8 rounded-full bg-background shadow-sm flex",
        "justify-center items-center cursor-pointer hover:bg-muted/20 transition-colors",
        "left-1/2 transform -translate-x-1/2 animate-bounce transition-opacity opacity-70",
        hidden && "opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to bottom"
    >
      <ChevronDown />
    </button>
  );
}
