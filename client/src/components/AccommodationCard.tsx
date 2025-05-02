import { Button } from "@/components/ui/button";

export type Accommodation = {
  id: number;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  image: string;
  tier: string;
  amenities: string[];
};

type AccommodationCardProps = {
  accommodation: Accommodation;
};

const AccommodationCard: React.FC<AccommodationCardProps> = ({ accommodation }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTierBadge = (tier: string) => {
    const tiers: Record<string, { bg: string, text: string }> = {
      "budget": { bg: "bg-slate-300/90", text: "text-black" },
      "standard": { bg: "bg-purple-700/90", text: "text-white" },
      "premium": { bg: "bg-amber-400/90", text: "text-black" },
      "luxury": { bg: "bg-amber-400/90", text: "text-black" },
      "ultra-luxury": { bg: "bg-amber-400/90", text: "text-black" },
    };

    const style = tiers[tier.toLowerCase()] || tiers.standard;
    const label = tier.toUpperCase();
    
    return (
      <span className={`${style.bg} ${style.text} text-xs font-bold px-2 py-1 rounded`}>
        {label}
      </span>
    );
  };

  return (
    <div className="bg-black/50 rounded-xl overflow-hidden border border-white/5 backdrop-blur-sm">
      <div className="relative h-48">
        <img 
          src={accommodation.image} 
          alt={accommodation.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent"></div>
        <div className="absolute top-2 right-2">
          {getTierBadge(accommodation.tier)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-['Orbitron'] text-lg font-bold mb-1">{accommodation.name}</h3>
        <div className="flex items-center mb-2">
          <i className="ri-map-pin-line text-amber-400 mr-1"></i>
          <span className="text-sm text-slate-300/70">{accommodation.location}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {accommodation.amenities.map((amenity, index) => (
            <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-slate-300/80">
              {amenity}
            </span>
          ))}
        </div>
        <div className="flex items-end justify-between mt-4">
          <div>
            <div className="text-amber-400 font-bold">{formatPrice(accommodation.pricePerNight)}</div>
            <div className="text-xs text-slate-300/50">per night</div>
          </div>
          <Button className="bg-purple-700 hover:bg-purple-700/80 text-white px-3 py-1 rounded text-sm transition-colors">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccommodationCard;
