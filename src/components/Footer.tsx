import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ExternalLink, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateToHome, navigateToDashboard } = useMarketplace();

  return (
    <footer className="w-full bg-bg-secondary border-t border-border-main mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <span 
              onClick={navigateToHome} 
              className="font-serif text-xl font-bold tracking-tight text-text-primary cursor-pointer"
            >
              Clothza<span className="text-text-tertiary">.</span>
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              A refined, editorial fashion marketplace bridging independent design houses with discerning tastemakers. Discover bespoke seasonal apparel and connect directly with boutique creators.
            </p>
          </div>

          {/* SaaS Core Structure */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-4">
              SaaS Engine
            </h5>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Multi-tenant Stores</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Smart Rankings</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Paid Placements</span>
              </li>
            </ul>
          </div>

          {/* Future Upgrades */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-4">
              Monetization Mockup
            </h5>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <span className="hover:text-text-primary transition-colors cursor-pointer">
                  Featured Placements
                </span>
              </li>
              <li>
                <span className="hover:text-text-primary transition-colors cursor-pointer">
                  Sponsored Products
                </span>
              </li>
              <li>
                <span className="hover:text-text-primary transition-colors cursor-pointer text-text-tertiary flex items-center space-x-1">
                  <span>Ad Impressions</span>
                  <span className="text-[9px] bg-bg-tertiary text-text-secondary border border-border-main px-1.5 py-0.5 rounded">Future</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-4">
              Architecture Details
            </h5>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>Vite React Engine</li>
              <li>TypeScript Integration</li>
              <li>Tailwind CSS v4 Design</li>
              <li>Local Client-side Database</li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-8 border-t border-border-main flex flex-col sm:flex-row items-center justify-between text-xs text-text-tertiary gap-4">
          <div>
            &copy; {new Date().getFullYear()} Clothza Inc. Built with love and architectural precision.
          </div>
          <div className="flex items-center space-x-4">
            <span 
              onClick={navigateToDashboard} 
              className="hover:text-text-primary hover:underline cursor-pointer"
            >
              Seller Hub
            </span>
            <span className="hover:text-text-primary hover:underline cursor-pointer flex items-center space-x-1">
              <span>Developer API</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
