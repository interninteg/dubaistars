import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AccommodationCard, { Accommodation } from "@/components/AccommodationCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const Accommodations: React.FC = () => {
  const [location, setLocation] = useState<string>("all");
  const [amenity, setAmenity] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const { data: accommodations = [], isLoading, isError } = useQuery<Accommodation[]>({
    queryKey: [`/api/accommodations`, { location, amenity, priceRange }],
  });

  const amenityOptions = [
    "Zero-G Gym",
    "Lunar Terrace",
    "Panoramic Views",
    "Private Airlock",
    "Artificial Gravity",
    "Hydroponic Garden",
    "VR Entertainment",
    "Earth View",
    "Luxury Spa",
    "Gourmet Dining",
    "Science Lab Access",
    "Observatory"
  ];

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "location") setLocation(value);
    if (type === "amenity") setAmenity(value);
    if (type === "priceRange") setPriceRange(value);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] font-bold text-center mb-2">
          <span className="text-amber-400">Space</span> <span className="text-slate-100">Accommodations</span>
        </h1>
        <p className="text-center text-slate-300/70 max-w-2xl mx-auto">
          Discover our range of luxurious space habitats, from orbital hotels to planetary bases, each offering unique amenities and experiences.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm mb-6">
        <h2 className="text-xl font-['Orbitron'] font-bold mb-4 text-amber-400">Filter Accommodations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="location-filter" className="block text-sm font-medium mb-1">Location</Label>
            <select
              id="location-filter"
              value={location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full bg-black border border-white/20 rounded-md p-2 text-slate-100 focus:border-amber-400 focus:ring focus:ring-amber-400/20 focus:outline-none"
            >
              <option value="all">All Locations</option>
              <option value="orbit">Earth Orbit</option>
              <option value="moon">Lunar Surface</option>
              <option value="mars">Martian Colonies</option>
              <option value="saturn">Saturn Orbital Station</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="amenities-filter" className="block text-sm font-medium mb-1">Amenities</Label>
            <select
              id="amenities-filter"
              value={amenity}
              onChange={(e) => handleFilterChange("amenity", e.target.value)}
              className="w-full bg-black border border-white/20 rounded-md p-2 text-slate-100 focus:border-amber-400 focus:ring focus:ring-amber-400/20 focus:outline-none"
            >
              <option value="all">All Amenities</option>
              <option value="zero-g">Zero-G Gym</option>
              <option value="panoramic">Panoramic Views</option>
              <option value="airlock">Private Airlock</option>
              <option value="gravity">Artificial Gravity</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="price-filter" className="block text-sm font-medium mb-1">Price Range</Label>
            <select
              id="price-filter"
              value={priceRange}
              onChange={(e) => handleFilterChange("priceRange", e.target.value)}
              className="w-full bg-black border border-white/20 rounded-md p-2 text-slate-100 focus:border-amber-400 focus:ring focus:ring-amber-400/20 focus:outline-none"
            >
              <option value="all">All Prices</option>
              <option value="budget">Budget (Under $10,000/night)</option>
              <option value="standard">Standard ($10,000-$25,000/night)</option>
              <option value="luxury">Luxury ($25,000-$50,000/night)</option>
              <option value="ultra">Ultra-Luxury (Over $50,000/night)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {amenityOptions.map((option) => (
            <button
              key={option}
              onClick={() => toggleAmenity(option)}
              className={`px-3 py-1 text-xs rounded-full 
                ${selectedAmenities.includes(option)
                  ? "bg-amber-400/20 text-amber-400"
                  : "bg-white/10 hover:bg-amber-400/20 text-slate-100 hover:text-amber-400"
                } transition-colors`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Accommodations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {isLoading ? (
          Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-black/50 rounded-xl overflow-hidden border border-white/5 backdrop-blur-sm h-[350px] animate-pulse">
              <div className="h-48 bg-gray-800/50"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-800/50 rounded w-3/4"></div>
                <div className="h-4 bg-gray-800/50 rounded w-1/2"></div>
                <div className="flex gap-1">
                  <div className="h-6 bg-gray-800/50 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-800/50 rounded w-1/4"></div>
                </div>
                <div className="flex justify-between pt-2">
                  <div className="h-6 bg-gray-800/50 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-800/50 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="col-span-3 text-center py-8">
            <p className="text-red-400">Error loading accommodations. Please try again later.</p>
          </div>
        ) : accommodations.length === 0 ? (
          <div className="col-span-3 text-center py-8">
            <p className="text-slate-400">No accommodations found with the selected filters.</p>
            <Button 
              className="mt-4 bg-purple-700 hover:bg-purple-700/80"
              onClick={() => {
                setLocation("all");
                setAmenity("all");
                setPriceRange("all");
                setSelectedAmenities([]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          accommodations.map((accommodation) => (
            <AccommodationCard key={accommodation.id} accommodation={accommodation} />
          ))
        )}
      </div>
      
      {/* Load More */}
      {accommodations.length > 0 && accommodations.length % 6 === 0 && (
        <div className="text-center">
          <Button className="bg-white/10 hover:bg-white/20 text-slate-100">
            Load More Accommodations
          </Button>
        </div>
      )}
    </div>
  );
};

export default Accommodations;
