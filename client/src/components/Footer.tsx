import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/80 backdrop-blur-md mt-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-['Orbitron'] font-bold text-amber-400 mb-4">Dubai to the Stars</h3>
            <p className="text-sm text-slate-300/70">The Ultimate Space Travel Experience for the discerning explorer. Luxury journeys beyond Earth since 2024.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-50 mb-4">Destinations</h4>
            <ul className="space-y-2 text-sm text-slate-300/70">
              <li><Link href="/book" className="hover:text-amber-400 transition-colors">Mercury</Link></li>
              <li><Link href="/book" className="hover:text-amber-400 transition-colors">Venus</Link></li>
              <li><Link href="/book" className="hover:text-amber-400 transition-colors">Earth Orbit</Link></li>
              <li><Link href="/book" className="hover:text-amber-400 transition-colors">Mars</Link></li>
              <li><Link href="/book" className="hover:text-amber-400 transition-colors">Saturn Rings Tour</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-50 mb-4">Travel Options</h4>
            <ul className="space-y-2 text-sm text-slate-300/70">
              <li><Link href="/book" className="hover:text-amber-400 transition-colors">Economy Shuttles</Link></li>
              <li><Link href="/book" className="hover:text-amber-400 transition-colors">Luxury Cabins</Link></li>
              <li><Link href="/book" className="hover:text-amber-400 transition-colors">VIP Zero-Gravity</Link></li>
              <li><Link href="/packages" className="hover:text-amber-400 transition-colors">Family Packages</Link></li>
              <li><Link href="/packages" className="hover:text-amber-400 transition-colors">Group Adventures</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-50 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-300/70">
              <li className="flex items-center"><i className="ri-map-pin-line text-amber-400 mr-2"></i> Dubai Spaceport, UAE</li>
              <li className="flex items-center"><i className="ri-phone-line text-amber-400 mr-2"></i> +971 800 STARS</li>
              <li className="flex items-center"><i className="ri-mail-line text-amber-400 mr-2"></i> info@dubaitothestars.com</li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-slate-300/70 hover:text-amber-400 transition-colors">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-slate-300/70 hover:text-amber-400 transition-colors">
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
              <a href="#" className="text-slate-300/70 hover:text-amber-400 transition-colors">
                <i className="ri-facebook-circle-line text-xl"></i>
              </a>
              <a href="#" className="text-slate-300/70 hover:text-amber-400 transition-colors">
                <i className="ri-youtube-line text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-slate-300/50">© 2024 Dubai to the Stars. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-xs text-slate-300/50 hover:text-amber-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-300/50 hover:text-amber-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-slate-300/50 hover:text-amber-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
