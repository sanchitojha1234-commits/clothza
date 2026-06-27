import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, Building2, 
  MapPin, FileText, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploader } from './ImageUploader';

const THEME_PRESETS = [
  {
    id: 'minimalist',
    name: 'Minimalist Luxury',
    description: 'Clean monochrome tones, sleek tailoring, premium wools.',
    logo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'streetwear',
    name: 'Urban Streetwear',
    description: 'Technical silhouettes, bold graphics, heavyweight loopback fits.',
    logo: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'linen',
    name: 'Relaxed Linen',
    description: 'Breathable organic textures, warm sand palettes, holiday vibes.',
    logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'leather',
    name: 'Classic Leather',
    description: 'Vegetable-tanned leather goods, raw edges, geometric jewelry.',
    logo: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1441984969893-c5a6e5057d4c?w=1200&auto=format&fit=crop&q=80',
  }
];

export const BoutiqueWizard: React.FC = () => {
  const { registerStore, linkUserToDemoStore } = useMarketplace();

  // Wizard Step: 1 | 2 | 3 | 4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [logo, setLogo] = useState(THEME_PRESETS[0].logo);
  const [banner, setBanner] = useState(THEME_PRESETS[0].banner);
  const [selectedThemeId, setSelectedThemeId] = useState('minimalist');

  // Form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const generatedSlug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const validateStep = (currentStep: number) => {
    const stepErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!name.trim()) stepErrors.name = 'Boutique name is required';
      if (name.trim().length < 3) stepErrors.name = 'Name must be at least 3 characters';
      if (!description.trim()) stepErrors.description = 'Brand description is required';
    }

    if (currentStep === 2) {
      if (!location.trim()) stepErrors.location = 'Boutique location is required';
      if (!whatsapp.trim() || whatsapp.length < 8) stepErrors.whatsapp = 'Valid WhatsApp line is required';
    }

    if (currentStep === 3) {
      if (!logo.trim()) stepErrors.logo = 'Logo URL is required';
      if (!banner.trim()) stepErrors.banner = 'Cover banner URL is required';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev + 1) as any);
    }
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as any);
  };

  const handleThemeSelect = (theme: typeof THEME_PRESETS[0]) => {
    setSelectedThemeId(theme.id);
    setLogo(theme.logo);
    setBanner(theme.banner);
  };

  const handleLaunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    registerStore({
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim(),
      logo,
      banner,
      location: location.trim(),
      instagram: instagram.trim().replace(/^@/, ''),
      whatsapp: whatsapp.trim(),
      theme: selectedThemeId as any
    });
  };

  // Steps details
  const stepsMetadata = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Aesthetics' },
    { num: 4, label: 'Launch' }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-left">
      
      {/* Stepper Header */}
      <div className="space-y-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-text-primary flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <span>Boutique Creator Wizard</span>
        </h2>
        <p className="text-xs text-text-secondary max-w-sm mx-auto">
          Establish your curated boutique store, customize assets, and publish items in Nepalese Rupees.
        </p>

        {/* Visual Progress Stepper */}
        <div className="flex items-center justify-center max-w-md mx-auto pt-4 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border-main -translate-y-1/2 z-0" />
          {stepsMetadata.map((sMetadata) => {
            const isCompleted = step > sMetadata.num;
            const isActive = step === sMetadata.num;
            return (
              <div key={sMetadata.num} className="flex-1 flex flex-col items-center relative z-10">
                <div 
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted ? 'bg-text-primary text-bg-primary border-text-primary' :
                    isActive ? 'bg-card-main text-text-primary border-text-primary ring-4 ring-text-primary/10' :
                    'bg-bg-secondary text-text-tertiary border-border-main'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : sMetadata.num}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 capitalize tracking-wide transition-all ${
                  isActive || isCompleted ? 'text-text-primary' : 'text-text-tertiary'
                }`}>
                  {sMetadata.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer demo quick link option */}
      <div className="mb-6 p-4 rounded-2xl bg-accent-main/5 border border-accent-main/20 flex flex-col sm:flex-row items-center justify-between text-left gap-4 font-sans">
        <div>
          <span className="text-[10px] tracking-wider uppercase font-bold text-accent-main block mb-0.5">Developer Demo Mode</span>
          <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
            Want to skip store configuration? Link this account directly to the pre-seeded demo boutique (**Noir & Co.**) with instant pre-configured products, orders, and inbox messages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm('Link account to Noir & Co. and skip store onboarding?')) {
              linkUserToDemoStore().then(() => {
                alert('Account successfully connected to Noir & Co.!');
              });
            }
          }}
          className="px-4 py-2 bg-text-primary text-bg-primary hover:opacity-90 transition-opacity rounded-xl text-xs font-bold shrink-0 shadow-sm cursor-pointer"
        >
          Connect to Demo Boutique
        </button>
      </div>

      {/* Main wizard card container */}
      <div className="bg-card-main border border-border-main rounded-3xl p-6 sm:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          
          {/* Step 1: Brand Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-main pb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-text-secondary" />
                <span>1. Define Brand Identity</span>
              </h3>

              {/* Boutique Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Boutique Name</label>
                <input
                  type="text"
                  placeholder="e.g. Atelier Noir"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs bg-bg-secondary border text-text-primary focus:outline-none focus:border-text-primary transition-all ${
                    errors.name ? 'border-red-500/50' : 'border-border-main'
                  }`}
                />
                {name.trim() && (
                  <p className="text-[10px] text-text-tertiary">
                    Generated Store Slug: <span className="font-semibold text-text-secondary">/store/{generatedSlug}</span>
                  </p>
                )}
                {errors.name && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.name}</p>
                )}
              </div>

              {/* Bio / Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Brand Story / Bio</label>
                <textarea
                  placeholder="Describe your boutique wardrobe designs, tailoring focus, or organic materials..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs bg-bg-secondary border text-text-primary focus:outline-none focus:border-text-primary transition-all resize-none ${
                    errors.description ? 'border-red-500/50' : 'border-border-main'
                  }`}
                />
                <div className="flex justify-between items-center text-[10px] text-text-tertiary">
                  <span>Describe what makes your boutiques unique</span>
                  <span>{description.length} / 300 chars</span>
                </div>
                {errors.description && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.description}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Location & Contact */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-main pb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-text-secondary" />
                <span>2. Contact Details</span>
              </h3>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Physical Store Location</label>
                <input
                  type="text"
                  placeholder="e.g. Lazimpat, Kathmandu"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs bg-bg-secondary border text-text-primary focus:outline-none focus:border-text-primary transition-all ${
                    errors.location ? 'border-red-500/50' : 'border-border-main'
                  }`}
                />
                {errors.location && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.location}</p>
                )}
              </div>

              {/* Social Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Instagram Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="atelier.noir"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs bg-bg-secondary border border-border-main text-text-primary focus:outline-none focus:border-text-primary transition-all"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-tertiary">@</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">WhatsApp Contact</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. +9779841234567"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className={`w-full pl-14 pr-4 py-2.5 rounded-xl text-xs bg-bg-secondary border text-text-primary focus:outline-none focus:border-text-primary transition-all ${
                        errors.whatsapp ? 'border-red-500/50' : 'border-border-main'
                      }`}
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-tertiary border-r border-border-main pr-2">+977</span>
                  </div>
                  {errors.whatsapp && (
                    <p className="text-[10px] text-red-500 font-semibold">{errors.whatsapp}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Brand Aesthetics */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-main pb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-text-secondary" />
                <span>3. Brand Aesthetics Preset</span>
              </h3>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEME_PRESETS.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'border-text-primary bg-bg-secondary/50 shadow-sm ring-1 ring-text-primary/15' 
                          : 'border-border-main bg-card-main hover:bg-bg-secondary/20'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-text-primary">{theme.name}</h4>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-text-primary text-bg-primary flex items-center justify-center text-[9px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-secondary mt-1 leading-normal pr-4">{theme.description}</p>
                      </div>
                      
                      {/* Presets preview strip */}
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-border-main/50">
                        <img src={theme.logo} alt="logo" className="w-6 h-6 rounded-md border border-border-main object-cover" />
                        <div className="h-4 flex-grow rounded bg-bg-tertiary overflow-hidden">
                          <img src={theme.banner} alt="cover" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Overrides */}
              <div className="p-4 rounded-2xl bg-bg-secondary border border-border-main space-y-3 mt-4">
                <h4 className="text-xs font-bold text-text-primary">Customize Brand Assets</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploader
                    label="Custom Logo Image"
                    aspectRatio="square"
                    folder="boutique-logos"
                    initialPreview={logo}
                    onUploadSuccess={(url) => {
                      setLogo(url);
                      setSelectedThemeId('custom');
                    }}
                  />
                  <ImageUploader
                    label="Custom Banner Image"
                    aspectRatio="banner"
                    folder="boutique-banners"
                    initialPreview={banner}
                    onUploadSuccess={(url) => {
                      setBanner(url);
                      setSelectedThemeId('custom');
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Live Mockups Preview & Submit */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-main pb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-text-secondary" />
                <span>4. Verify & Launch Boutique</span>
              </h3>

              <div className="space-y-4">
                {/* Store Header Showcase Preview */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Header Banner Preview</h4>
                  <div className="h-32 rounded-2xl overflow-hidden relative border border-border-main bg-bg-tertiary">
                    <img src={banner} alt="Cover Preview" className="w-full h-full object-cover opacity-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center space-x-3 text-white text-left z-10">
                      <img src={logo} alt="Logo Preview" className="w-10 h-10 rounded-xl border border-white/20 bg-white object-cover" />
                      <div>
                        <p className="text-sm font-serif font-bold leading-tight">{name || 'Atelier Boutique'}</p>
                        <p className="text-[10px] text-white/80 leading-none">{location || 'Paris, France'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card discovery Grid Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Boutique Card Preview</h4>
                    <div className="p-4 rounded-3xl bg-bg-secondary border border-border-main space-y-4 text-left flex flex-col justify-between h-[150px] shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-border-main bg-white">
                          <img src={logo} alt="logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[9px] tracking-wider uppercase font-semibold bg-bg-tertiary text-text-secondary px-2 py-0.5 rounded-full border border-border-main">
                          Featured
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-serif text-sm font-bold text-text-primary line-clamp-1">{name || 'Atelier Boutique'}</h4>
                        <p className="text-[10px] text-text-secondary line-clamp-1">{description || 'Premium clothing.'}</p>
                        <p className="text-[9px] text-text-tertiary">{location || 'Paris, France'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Settings confirmation checklist */}
                  <div className="p-4 rounded-3xl bg-bg-secondary border border-border-main space-y-3 flex flex-col justify-center text-xs">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Summary Checklist</h4>
                    <ul className="space-y-1.5 text-text-secondary font-medium">
                      <li className="flex items-center gap-1.5 text-[11px]"><Check className="w-3.5 h-3.5 text-green-500" /> Store Slug: <code>/{generatedSlug}</code></li>
                      <li className="flex items-center gap-1.5 text-[11px]"><Check className="w-3.5 h-3.5 text-green-500" /> Instagram handle: <code>@{instagram.replace(/^@/, '') || 'none'}</code></li>
                      <li className="flex items-center gap-1.5 text-[11px]"><Check className="w-3.5 h-3.5 text-green-500" /> WhatsApp inquiry: <code>+977 {whatsapp}</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Wizard Footer Controls */}
        <div className="mt-8 border-t border-border-main pt-5 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-border-main bg-bg-secondary hover:bg-bg-tertiary text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-text-primary text-bg-primary hover:opacity-90 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <form onSubmit={handleLaunchSubmit}>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-text-primary text-bg-primary hover:opacity-95 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <span>Launch Boutique Store</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
};
