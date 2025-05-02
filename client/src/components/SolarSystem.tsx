import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

type Destination = {
  id: string;
  name: string;
  description: string;
  distance: string;
  travelTime: string;
  temperature: string;
  color: string;
  activities: string[];
};

type Planet = {
  id: string;
  name: string;
  color: string;
  size: number;
  orbit: number;
  orbitDuration: number;
  position: number;
  rings?: boolean;
};

type SolarSystemProps = {
  onSelectPlanet: (destination: Destination | null) => void;
  selectedPlanetId?: string;
};

const SolarSystem: React.FC<SolarSystemProps> = ({ onSelectPlanet, selectedPlanetId }) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false); // Don't animate by default
  const [currentTime, setCurrentTime] = useState(0);
  
  // Animation timer
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      if (isAnimating) {
        setCurrentTime(prev => prev + 0.5); // Increment time for animation
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    if (isAnimating) {
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isAnimating]);
  
  const { data: destinations = [] } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });

  // Create planets data with fixed positions for better interaction
  const planets: (Planet & { position: number })[] = [
    {
      id: "mercury",
      name: "Mercury",
      color: "#A9A9A9",
      size: 10,
      orbit: 60,
      orbitDuration: 40,
      position: 0, // Position in degrees (0 = right, 90 = bottom, 180 = left, 270 = top)
    },
    {
      id: "venus",
      name: "Venus",
      color: "#E6A727",
      size: 15,
      orbit: 100,
      orbitDuration: 60,
      position: 75, // Positioned at roughly 2 o'clock
    },
    {
      id: "earth",
      name: "Earth",
      color: "#2E86C1",
      size: 16,
      orbit: 140,
      orbitDuration: 80,
      position: 155, // Positioned at roughly 7 o'clock
    },
    {
      id: "mars",
      name: "Mars",
      color: "#C0392B",
      size: 13,
      orbit: 180,
      orbitDuration: 100,
      position: 225, // Positioned at roughly 10 o'clock
    },
    {
      id: "saturn",
      name: "Saturn",
      color: "#F5CBA7",
      size: 24,
      orbit: 210,
      orbitDuration: 140,
      position: 305, // Positioned at roughly 4 o'clock
      rings: true,
    }
  ];

  // Handle planet click
  const handlePlanetClick = (planetId: string) => {
    const destination = destinations.find(d => d.id.toLowerCase() === planetId.toLowerCase());
    if (destination) {
      onSelectPlanet(destination);
    }
  };

  // Preselect planet if needed
  useEffect(() => {
    if (selectedPlanetId && destinations.length > 0 && !hoveredPlanet) {
      const destination = destinations.find(d => d.id === selectedPlanetId);
      if (destination) {
        onSelectPlanet(destination);
      }
    }
  }, [destinations, selectedPlanetId, onSelectPlanet, hoveredPlanet]);

  return (
    <div className="solar-system-container relative h-[500px] mb-4 overflow-hidden border border-white/10 rounded-lg">
      {/* Pause/Play Button */}
      <button 
        className="absolute top-4 right-4 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-xs border border-white/20 hover:bg-black/70 transition-colors"
        onClick={() => setIsAnimating(!isAnimating)}
      >
        {isAnimating ? 'Pause' : 'Play'} Animation
      </button>
      
      {/* Sun */}
      <div className="sun absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-400 z-10 shadow-[0_0_30px_rgba(255,215,0,0.7)]"></div>
      
      {/* Orbits and Planets */}
      {planets.map((planet) => (
        <div key={planet.id}>
          {/* Orbit */}
          <div 
            className="orbit absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            style={{
              width: `${planet.orbit * 2}px`,
              height: `${planet.orbit * 2}px`,
            }}
          ></div>
          
          {/* Planet with fixed position or animated */}
          <div 
            className={`
              planet absolute rounded-full cursor-pointer
              ${selectedPlanetId === planet.id ? 'shadow-[0_0_15px_rgba(255,215,0,0.7)]' : ''}
            `}
            style={{
              width: `${planet.size}px`,
              height: `${planet.size}px`,
              backgroundColor: planet.color,
              zIndex: 5,
              // Calculate position based on initial position plus animation time
              left: `calc(50% + ${planet.orbit * Math.cos((planet.position + (isAnimating ? currentTime / planet.orbitDuration * 360 : 0)) * Math.PI / 180)}px)`,
              top: `calc(50% + ${planet.orbit * Math.sin((planet.position + (isAnimating ? currentTime / planet.orbitDuration * 360 : 0)) * Math.PI / 180)}px)`,
              transform: 'translate(-50%, -50%)',
              boxShadow: hoveredPlanet === planet.id ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
              transition: isAnimating ? 'none' : 'box-shadow 0.2s ease'
            }}
            onClick={() => handlePlanetClick(planet.id)}
            onMouseEnter={() => setHoveredPlanet(planet.id)}
            onMouseLeave={() => setHoveredPlanet(null)}
            data-planet-id={planet.id}
          >
            {/* Saturn rings */}
            {planet.rings && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full border-[4px] border-[rgba(245,203,167,0.2)] -z-10"></div>
            )}
            
            {/* Planet label */}
            <div className="absolute top-[120%] left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap opacity-70">
              {planet.name}
            </div>
          </div>
        </div>
      ))}

      {/* Selection Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs text-center bg-black/30 px-3 py-1 rounded-full">
        Click on a planet to select your destination
      </div>
    </div>
  );
};

export default SolarSystem;
