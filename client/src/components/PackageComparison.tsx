import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type Package = {
  id: string;
  name: string;
  description: string;
  price: number;
  accommodation: string;
  meals: string;
  spacewalk: boolean | string;
  surfaceTours: string;
  training: string;
  medicalSupport: string;
  souvenirs: string;
};

const PackageComparison: React.FC = () => {
  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading packages...</div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm mb-10">
      <h2 className="text-xl font-['Orbitron'] font-bold mb-6 text-amber-400 text-center">Package Comparison</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="p-4 border-b border-white/10"></th>
              {packages.map(pkg => (
                <th key={pkg.id} className="p-4 border-b border-white/10 text-center">
                  <div className="text-lg font-['Orbitron'] text-slate-100">{pkg.name}</div>
                  <div className="text-sm text-slate-300/70">{pkg.description}</div>
                  <div className="text-amber-400 text-2xl font-bold mt-2">{formatPrice(pkg.price)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 border-b border-white/10 font-medium">Accommodation</td>
              {packages.map(pkg => (
                <td key={pkg.id} className="p-4 border-b border-white/10 text-center">{pkg.accommodation}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b border-white/10 font-medium">Meals</td>
              {packages.map(pkg => (
                <td key={pkg.id} className="p-4 border-b border-white/10 text-center">{pkg.meals}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b border-white/10 font-medium">Spacewalk</td>
              {packages.map(pkg => (
                <td key={pkg.id} className="p-4 border-b border-white/10 text-center">
                  {pkg.spacewalk === false ? (
                    <i className="ri-close-line text-red-500"></i>
                  ) : (
                    pkg.spacewalk
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b border-white/10 font-medium">Surface Tours</td>
              {packages.map(pkg => (
                <td key={pkg.id} className="p-4 border-b border-white/10 text-center">{pkg.surfaceTours}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b border-white/10 font-medium">Training</td>
              {packages.map(pkg => (
                <td key={pkg.id} className="p-4 border-b border-white/10 text-center">{pkg.training}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b border-white/10 font-medium">Medical Support</td>
              {packages.map(pkg => (
                <td key={pkg.id} className="p-4 border-b border-white/10 text-center">{pkg.medicalSupport}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b border-white/10 font-medium">Souvenirs</td>
              {packages.map(pkg => (
                <td key={pkg.id} className="p-4 border-b border-white/10 text-center">{pkg.souvenirs}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4"></td>
              {packages.map(pkg => (
                <td key={pkg.id} className="p-4 text-center">
                  <Link href={`/book?package=${pkg.id}`}>
                    <Button 
                      className={`py-2 px-6 rounded transition-colors ${
                        pkg.id === 'basic' 
                          ? 'bg-slate-300/20 hover:bg-slate-300/30 text-slate-100' 
                          : pkg.id === 'premium'
                          ? 'bg-purple-700 hover:bg-purple-700/80 text-white'
                          : 'bg-amber-400 hover:bg-amber-400/80 text-black font-bold'
                      }`}
                    >
                      Select {pkg.name}
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PackageComparison;
