import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import SolarSystem from "@/components/SolarSystem";
import BookingForm from "@/components/BookingForm";

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

const BookTrip: React.FC = () => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const preselectedDestination = searchParams.get("destination");
  const packageType = searchParams.get("package");
  
  // Fetch destinations
  const { data: destinations = [] } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });
  
  // Initialize selected destination based on URL params
  useEffect(() => {
    if (destinations.length > 0) {
      if (preselectedDestination) {
        const destination = destinations.find(d => d.id === preselectedDestination);
        if (destination) {
          setSelectedDestination(destination);
        }
      }
      
      // If a package is selected, preselect Mars as the default destination
      if (packageType && !preselectedDestination) {
        const mars = destinations.find(d => d.id === "mars");
        if (mars) {
          setSelectedDestination(mars);
        }
      }
    }
  }, [destinations, preselectedDestination, packageType]);
  
  const handleSelectPlanet = (destination: Destination | null) => {
    setSelectedDestination(destination);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] font-bold text-center mb-2">
          <span className="text-amber-400">Book</span> <span className="text-slate-100">Your Space Adventure</span>
        </h1>
        <p className="text-center text-slate-300/70 max-w-2xl mx-auto">
          Select your destination, choose your dates, and pick the perfect class for your interplanetary journey.
        </p>
      </div>

      {/* Booking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solar System Map */}
        <div className="lg:col-span-2 bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
          <h2 className="text-xl font-['Orbitron'] font-bold mb-4 text-amber-400 flex items-center">
            <i className="ri-planet-line mr-2"></i> Select Destination
          </h2>
          
          <SolarSystem 
            onSelectPlanet={handleSelectPlanet} 
            selectedPlanetId={selectedDestination?.id}
          />
          
          {selectedDestination && (
            <div className="mt-6 p-4 rounded-lg bg-white/5">
              <div className="text-xl font-['Orbitron'] text-amber-400 mb-2">{selectedDestination.name}</div>
              <div className="text-sm text-slate-300/70">{selectedDestination.description}</div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2 rounded bg-white/5">
                  <div className="font-bold text-amber-400 mb-1">Distance</div>
                  <div>{selectedDestination.distance}</div>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <div className="font-bold text-amber-400 mb-1">Travel Time</div>
                  <div>{selectedDestination.travelTime}</div>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <div className="font-bold text-amber-400 mb-1">Temperature</div>
                  <div>{selectedDestination.temperature}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-bold text-amber-400 mb-1">Activities</div>
                <div className="flex flex-wrap gap-2">
                  {selectedDestination.activities.map((activity, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-white/10 text-slate-300">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <BookingForm 
            selectedDestination={selectedDestination?.id || ""}
            onBookingComplete={() => setSelectedDestination(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default BookTrip;
