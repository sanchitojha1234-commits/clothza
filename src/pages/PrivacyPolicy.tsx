import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 font-sans animate-fade-in">
      {/* Editorial Header */}
      <div className="text-center space-y-4 mb-16">
        <span className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-bold bg-bg-secondary px-3 py-1.5 rounded-full border border-border-main">
          Legal Agreement
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-tight text-text-primary">
          Privacy Policy
        </h1>
        <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed">
          Last updated: June 2026. This policy outlines how Clothza collects, protects, and utilizes information across our multi-tenant boutique network.
        </p>
        <div className="w-12 h-[1px] bg-border-main mx-auto mt-6"></div>
      </div>

      {/* Policy Content */}
      <div className="p-8 sm:p-12 rounded-3xl border border-border-main bg-card-main shadow-xl space-y-10 text-xs text-text-secondary leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="text-text-tertiary font-light">01 /</span> Information Collection
          </h3>
          <p>
            Clothza operates as a multi-tenant platform bridging buyers with independent fashion designers. We collect details necessary to facilitate this ecosystem:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-text-secondary">
            <li><strong>Account Profiles:</strong> Names, email addresses, and roles collected via secure Supabase Authentication.</li>
            <li><strong>Boutique Catalog Data:</strong> Store images, product descriptions, configurations, and pricing uploaded by registered merchants.</li>
            <li><strong>Transactional Data:</strong> Billing details, shipping addresses, and purchase histories collected during split invoice checkout processing.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="text-text-tertiary font-light">02 /</span> Data Usage & Synchronization
          </h3>
          <p>
            We use your data strictly to maintain platform operations, improve seller metrics, and synchronize boutique permissions:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-text-secondary">
            <li>To display real-time view counts, clicks, and conversion rates inside the interactive Seller Dashboard.</li>
            <li>To route private chat messages between shoppers and boutique designers instantly via secure PostgreSQL event subscriptions.</li>
            <li>To verify billing subscription status and instantly grant permissions to elite features (like Lookbooks, Coupons, and Inbox channels).</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="text-text-tertiary font-light">03 /</span> Data Security & RLS Safeguards
          </h3>
          <p>
            We deploy strict database-level security to keep your information safe:
          </p>
          <p>
            Your private order history, styling chat threads, and seller credentials are protected by **Supabase Row Level Security (RLS)**. Only authorized users with valid JWT session tokens matching the target records can read or write transactional information. Public catalog data remains open to support search-engine crawling.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-text-primary flex items-center gap-2">
            <span className="text-text-tertiary font-light">04 /</span> Third-Party Connections
          </h3>
          <p>
            Clothza links with third-party service providers (such as Supabase for database hosting, OAuth providers for Google Social Sign-In, and Unsplash for demo curation visuals). These integrations operate under their respective privacy policies.
          </p>
        </section>

        {/* Contact Section */}
        <div className="pt-6 border-t border-border-main text-center space-y-2">
          <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
            Questions regarding our policy?
          </p>
          <p className="text-text-primary">
            legal@clothza.com &bull; support@clothza.com
          </p>
        </div>

      </div>
    </div>
  );
};
