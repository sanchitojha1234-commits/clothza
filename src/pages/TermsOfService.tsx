import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 font-sans animate-fade-in">
      {/* Editorial Header */}
      <div className="text-center space-y-4 mb-16">
        <span className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-bold bg-bg-secondary px-3 py-1.5 rounded-full border border-border-main">
          Platform Rules
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-tight text-text-primary">
          Terms & Conditions
        </h1>
        <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed">
          Last updated: June 2026. By accessing or utilizing the Clothza multi-tenant marketplace platform, you agree to these structural terms.
        </p>
        <div className="w-12 h-[1px] bg-border-main mx-auto mt-6"></div>
      </div>

      {/* Terms Content */}
      <div className="p-8 sm:p-12 rounded-3xl border border-border-main bg-card-main shadow-xl space-y-10 text-xs text-text-secondary leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="text-text-tertiary font-light">01 /</span> Scope of Service
          </h3>
          <p>
            Clothza operates as an architectural SaaS infrastructure for independent boutiques. We provide the tools for merchants to customize digital storefronts, upload products, define coupons, organize lookbooks, and communicate with buyers. 
          </p>
          <p>
            We are not direct sellers of items cataloged by individual boutiques. Transactions, fulfillment, and customer styling satisfaction are the responsibility of the respective boutique owners.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="text-text-tertiary font-light">02 /</span> Merchant Accounts & Subscriptions
          </h3>
          <p>
            To activate seller capabilities, merchants must select a SaaS subscription tier (Bronze, Silver, or Gold):
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-text-secondary">
            <li><strong>Bronze (Starter):</strong> Exposes standard inventory controls, limited to 5 cataloged products. Premium features (Inbox, Coupons, Lookbooks) are locked.</li>
            <li><strong>Silver & Gold (Premium/Elite):</strong> Unlocks infinite inventories, customer styling chats, coordinate-mapped hotspot lookbook curation, and home page feature spots.</li>
            <li><strong>Simulated Payments:</strong> Tiers are simulated using mock OTP card validation routines. Upgrades reflect in state databases instantly.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="text-text-tertiary font-light">03 /</span> Catalog Moderation & Admin Control
          </h3>
          <p>
            Clothza retains super-administrative authority over the marketplace catalog:
          </p>
          <p>
            The Platform Administrator console is authorized to review all stores, products, reviews, and lookbook edits. The admin may delete listings or stores violating catalog guidelines or adjust promotional listings (Sponsored / Featured) to moderate platform traffic.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="text-text-tertiary font-light">04 /</span> Acceptable Curation Use
          </h3>
          <p>
            Merchants uploading photos for **Editorial Curation Lookbooks** must own the intellectual rights to all photography. Pin mapping must accurately reflect the specific inventory item linked to avoid misleading shoppers.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="text-text-tertiary font-light">05 /</span> Disclaimers
          </h3>
          <p>
            Clothza is provided "as is" without express warranties. While we integrate database backups and RLS security policies, we do not guarantee uninterrupted server uptimes.
          </p>
        </section>

        {/* Footer */}
        <div className="pt-6 border-t border-border-main text-center space-y-2">
          <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
            Contact Legal Department
          </p>
          <p className="text-text-primary">
            legal@clothza.com &bull; support@clothza.com
          </p>
        </div>

      </div>
    </div>
  );
};
