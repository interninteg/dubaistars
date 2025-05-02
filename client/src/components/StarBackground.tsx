import { useEffect, useRef } from "react";

const StarBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const count = 200;
    
    // Clear any existing stars
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      // Random size between 1-3px
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Random twinkle animation duration between 3-8s
      star.style.animationDuration = `${Math.random() * 5 + 3}s`;
      
      container.appendChild(star);
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden"
    />
  );
};

export default StarBackground;
