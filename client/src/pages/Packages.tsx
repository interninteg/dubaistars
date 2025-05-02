import PackageComparison from "@/components/PackageComparison";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const Packages: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] font-bold text-center mb-2">
          <span className="text-amber-400">Space Travel</span> <span className="text-slate-100">Packages</span>
        </h1>
        <p className="text-center text-slate-300/70 max-w-2xl mx-auto">
          Choose from our curated packages designed to provide the ultimate space experience, from basic explorations to luxury adventures.
        </p>
      </div>

      {/* Package Comparison */}
      <PackageComparison />
      
      {/* Special Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Family Pack */}
        <div className="bg-black/50 rounded-xl overflow-hidden border border-white/5 backdrop-blur-sm">
          <div className="relative h-48">
            <img 
              src="https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
              alt="Family space experience" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <div className="text-lg font-['Orbitron'] text-amber-400 font-bold">Family Pack</div>
              <div className="text-sm text-slate-100">For the ultimate family adventure</div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">From</span>
                <span className="text-amber-400 text-lg font-bold">$880,000</span>
              </div>
              <div className="text-xs text-slate-300/50 mb-4">For a family of 4</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 mt-1 mr-2"></i>
                  <span>Private family cabin with connected rooms</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 mt-1 mr-2"></i>
                  <span>Age-appropriate activities for children</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 mt-1 mr-2"></i>
                  <span>Family spacewalk experience (ages 12+)</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 mt-1 mr-2"></i>
                  <span>Educational programs and space science workshops</span>
                </li>
              </ul>
            </div>
            <Link href="/book?package=family">
              <Button className="w-full bg-purple-700 hover:bg-purple-700/80 text-white py-2 rounded transition-colors">
                View Family Package
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Lunar Honeymoon */}
        <div className="bg-black/50 rounded-xl overflow-hidden border border-white/5 backdrop-blur-sm">
          <div className="relative h-48">
            <img 
              src="https://images.unsplash.com/photo-1534374950034-3644ddb72710?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
              alt="Lunar honeymoon experience" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <div className="text-lg font-['Orbitron'] text-amber-400 font-bold">Lunar Honeymoon</div>
              <div className="text-sm text-slate-100">Romance under the stars</div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">From</span>
                <span className="text-amber-400 text-lg font-bold">$950,000</span>
              </div>
              <div className="text-xs text-slate-300/50 mb-4">For a couple</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 mt-1 mr-2"></i>
                  <span>Luxury private suite with panoramic Earth view</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 mt-1 mr-2"></i>
                  <span>Private dinner under the stars</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 mt-1 mr-2"></i>
                  <span>Couple's spacewalk with photography session</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 mt-1 mr-2"></i>
                  <span>Lunar surface picnic with champagne</span>
                </li>
              </ul>
            </div>
            <Link href="/book?package=honeymoon">
              <Button className="w-full bg-purple-700 hover:bg-purple-700/80 text-white py-2 rounded transition-colors">
                View Honeymoon Package
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packages;
