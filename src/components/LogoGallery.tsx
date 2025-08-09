'use client';

import { useState } from 'react';

interface LogoVariant {
  id: string;
  name: string;
  description: string;
  clipPath?: string;
  background?: string;
  category: string;
  symbolism: string;
}

const logoVariants: LogoVariant[] = [
  // CREATIVE "NN" TYPOGRAPHY
  {
    id: 'nn-connected',
    name: 'Connected NN',
    description: 'Two Ns connected with a bridge representing network connection',
    category: 'NN Typography',
    symbolism: 'Connection, Network, Unity'
  },
  {
    id: 'nn-mirror',
    name: 'Mirror NN',
    description: 'Mirrored N design creating symmetrical visual impact',
    category: 'NN Typography',
    symbolism: 'Balance, Reflection, Symmetry'
  },
  {
    id: 'nn-stacked',
    name: 'Stacked NN',
    description: 'Vertically stacked Ns with interlocking design',
    category: 'NN Typography',
    symbolism: 'Foundation, Strength, Layered Information'
  },
  {
    id: 'nn-gradient',
    name: 'Gradient Flow NN',
    description: 'NN with flowing gradient transition between letters',
    category: 'NN Typography',
    symbolism: 'Smooth Flow, Transition, Continuity'
  },

  // GEOMETRIC "NN" DESIGNS
  {
    id: 'nn-cubic',
    name: 'Cubic NN',
    description: 'NN designed with 3D cubic letter forms',
    category: 'Geometric NN',
    symbolism: 'Dimension, Structure, Modern'
  },
  {
    id: 'nn-angular',
    name: 'Angular NN',
    description: 'Sharp, angular interpretation of NN letters',
    category: 'Geometric NN',
    symbolism: 'Precision, Clarity, Sharp Focus'
  },
  {
    id: 'nn-circuit',
    name: 'Circuit NN',
    description: 'NN designed as electronic circuit paths',
    category: 'Geometric NN',
    symbolism: 'Technology, AI, Digital Innovation'
  },
  {
    id: 'nn-hexagonal',
    name: 'Hexagonal NN',
    description: 'NN letters built from hexagonal segments',
    category: 'Geometric NN',
    symbolism: 'Neural Networks, Efficiency, Structure'
  },

  // DYNAMIC "NN" EFFECTS
  {
    id: 'nn-glitch',
    name: 'Glitch NN',
    description: 'NN with digital glitch effect for breaking news feel',
    category: 'Dynamic NN',
    symbolism: 'Breaking News, Digital, Instant Updates'
  },
  {
    id: 'nn-motion',
    name: 'Motion Blur NN',
    description: 'NN with motion blur effect suggesting speed',
    category: 'Dynamic NN',
    symbolism: 'Speed, Fast News, Rapid Delivery'
  },
  {
    id: 'nn-pulse',
    name: 'Pulse NN',
    description: 'NN with heartbeat-like pulse animation',
    category: 'Dynamic NN',
    symbolism: 'Live Updates, Heartbeat of News, Vital Information'
  },
  {
    id: 'nn-wave',
    name: 'Wave NN',
    description: 'NN letters with wave-like flowing design',
    category: 'Dynamic NN',
    symbolism: 'Flow, Broadcasting Waves, Communication'
  },

  // MINIMAL "NN" DESIGNS
  {
    id: 'nn-thin',
    name: 'Thin Line NN',
    description: 'Ultra-thin, minimalist NN design',
    category: 'Minimal NN',
    symbolism: 'Elegance, Simplicity, Clean Design'
  },
  {
    id: 'nn-dots',
    name: 'Dotted NN',
    description: 'NN formed by connected dots',
    category: 'Minimal NN',
    symbolism: 'Connection Points, Network Nodes, Digital'
  },
  {
    id: 'nn-outline',
    name: 'Outline NN',
    description: 'NN with just outline strokes',
    category: 'Minimal NN',
    symbolism: 'Transparency, Clarity, Modern'
  },
  {
    id: 'nn-negative',
    name: 'Negative Space NN',
    description: 'NN created using negative space technique',
    category: 'Minimal NN',
    symbolism: 'Hidden Truth, Revealing Information, Depth'
  },

  // ARTISTIC "NN" STYLES
  {
    id: 'nn-brush',
    name: 'Brush Stroke NN',
    description: 'NN with artistic brush stroke effect',
    category: 'Artistic NN',
    symbolism: 'Human Touch, Artistry, Personal'
  },
  {
    id: 'nn-neon',
    name: 'Neon NN',
    description: 'NN with neon light tube effect',
    category: 'Artistic NN',
    symbolism: 'Night News, Urban, Modern Energy'
  },
  {
    id: 'nn-paper',
    name: 'Paper Fold NN',
    description: 'NN designed as folded paper/origami style',
    category: 'Artistic NN',
    symbolism: 'Traditional Media, Crafted News, Dimension'
  },
  {
    id: 'nn-crystal',
    name: 'Crystal NN',
    description: 'NN with crystalline, faceted surfaces',
    category: 'Artistic NN',
    symbolism: 'Clarity, Precision, Multi-faceted Truth'
  },

  // TRUST & VERIFICATION LOGOS
  {
    id: 'shield-classic',
    name: 'Classic Shield',
    description: 'Traditional shield shape for protection and trust',
    clipPath: 'polygon(50% 0%, 80% 15%, 100% 35%, 85% 85%, 50% 100%, 15% 85%, 0% 35%, 20% 15%)',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    category: 'Trust & Verification',
    symbolism: 'Protection, Security, Trust'
  },
  {
    id: 'security-badge',
    name: 'Security Badge',
    description: 'Official badge shape for authentic and secure news',
    clipPath: 'polygon(50% 0%, 80% 15%, 95% 40%, 80% 85%, 50% 100%, 20% 85%, 5% 40%, 20% 15%)',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    category: 'Trust & Verification',
    symbolism: 'Official Authentication, Security, Credibility'
  },
  {
    id: 'checkmark-seal',
    name: 'Verification Seal',
    description: 'Circular seal with implied checkmark for verified content',
    clipPath: 'polygon(15% 15%, 85% 15%, 95% 25%, 95% 75%, 85% 85%, 15% 85%, 5% 75%, 5% 25%)',
    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
    category: 'Trust & Verification',
    symbolism: 'Verified, Approved, Quality Assured'
  },

  // GEOMETRIC SHAPES
  {
    id: 'hexagon',
    name: 'Neural Hexagon',
    description: 'Six-sided shape like neural networks and honeycomb efficiency',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)',
    category: 'Geometric',
    symbolism: 'Neural Networks, Efficiency, Structure'
  },
  {
    id: 'diamond',
    name: 'Speed Diamond',
    description: 'Diamond shape for speed and breaking news urgency',
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #d97706 100%)',
    category: 'Geometric',
    symbolism: 'Speed, Breaking News, Precision'
  },
  {
    id: 'octagon',
    name: 'Global Octagon',
    description: 'Eight-sided comprehensive coverage from all angles',
    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
    category: 'Geometric',
    symbolism: '360° Coverage, Comprehensive, Global'
  },

  // AUTHORITY & CREDIBILITY
  {
    id: 'crown-authority',
    name: 'Authority Crown',
    description: 'Crown representing premium, authoritative news source',
    clipPath: 'polygon(10% 70%, 20% 30%, 30% 50%, 40% 20%, 50% 40%, 60% 20%, 70% 50%, 80% 30%, 90% 70%, 85% 85%, 15% 85%)',
    background: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #fbbf24 100%)',
    category: 'Authority & Credibility',
    symbolism: 'Premium Authority, Elite Journalism, Crowned Excellence'
  },
  {
    id: 'star-excellence',
    name: 'Excellence Star',
    description: 'Five-pointed star for award-winning journalism',
    clipPath: 'polygon(50% 0%, 60% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 40% 35%)',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ddd6fe 100%)',
    category: 'Authority & Credibility',
    symbolism: 'Award-Winning, Excellence, 5-Star Quality'
  },

  // CURRENT NEWSNERVE LOGO VARIATIONS
  {
    id: 'current-star',
    name: 'Current NewsNerve Star',
    description: 'Your current star logo with neural network pattern',
    clipPath: 'polygon(50% 0%, 60% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 40% 35%)',
    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    category: 'Current Logo Variations',
    symbolism: 'Neural Networks, Excellence, Innovation'
  },
  {
    id: 'current-shield',
    name: 'NewsNerve Shield',
    description: 'Your neural network design in shield shape for trust',
    clipPath: 'polygon(50% 0%, 80% 15%, 100% 35%, 85% 85%, 50% 100%, 15% 85%, 0% 35%, 20% 15%)',
    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    category: 'Current Logo Variations',
    symbolism: 'Protection, Trust, Neural Intelligence'
  },
  {
    id: 'current-hexagon',
    name: 'NewsNerve Neural Hex',
    description: 'Your design in hexagon for neural network emphasis',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    category: 'Current Logo Variations',
    symbolism: 'Neural Networks, Connectivity, Structure'
  },
  {
    id: 'current-diamond',
    name: 'NewsNerve Speed Diamond',
    description: 'Your neural pattern in diamond for breaking news speed',
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    category: 'Current Logo Variations',
    symbolism: 'Speed, Breaking News, AI Intelligence'
  },
  {
    id: 'current-circle',
    name: 'NewsNerve Neural Circle',
    description: 'Your design in perfect circle for global reach',
    clipPath: 'circle(50% at 50% 50%)',
    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    category: 'Current Logo Variations',
    symbolism: 'Global Reach, Completeness, Unity'
  },
  {
    id: 'current-badge',
    name: 'NewsNerve Authority Badge',
    description: 'Your neural network in official badge shape',
    clipPath: 'polygon(50% 0%, 80% 15%, 95% 40%, 80% 85%, 50% 100%, 20% 85%, 5% 40%, 20% 15%)',
    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    category: 'Current Logo Variations',
    symbolism: 'Authority, Verification, Neural Trust'
  },
  {
    id: 'current-crown',
    name: 'NewsNerve Royal Crown',
    description: 'Your neural design in crown for premium authority',
    clipPath: 'polygon(10% 70%, 20% 30%, 30% 50%, 40% 20%, 50% 40%, 60% 20%, 70% 50%, 80% 30%, 90% 70%, 85% 85%, 15% 85%)',
    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    category: 'Current Logo Variations',
    symbolism: 'Premium Authority, Royal Quality, Neural Excellence'
  },
  {
    id: 'current-octagon',
    name: 'NewsNerve Global Octagon',
    description: 'Your neural pattern in octagon for comprehensive coverage',
    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    category: 'Current Logo Variations',
    symbolism: '360° Coverage, Global Intelligence, Comprehensive'
  }
];

const LogoGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLogo, setSelectedLogo] = useState<string>('');

  const categories = ['All', ...Array.from(new Set(logoVariants.map(logo => logo.category)))];

  const filteredLogos = selectedCategory === 'All' 
    ? logoVariants 
    : logoVariants.filter(logo => logo.category === selectedCategory);

  const copyLogoCode = (logo: LogoVariant) => {
    let logoCode = '';
    
    // Handle "NN" typography designs
    if (logo.id.startsWith('nn-')) {
      logoCode = getNNLogoCode(logo.id);
    } else {
      // Handle older shape-based logos
      logoCode = `<div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden" 
     style={{
       background: '${logo.background || 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'}',
       clipPath: '${logo.clipPath || 'none'}',
       filter: 'drop-shadow(0 10px 20px rgba(37, 99, 235, 0.3))'
     }}>
  {/* ${logo.name} - ${logo.description} */}
  <div className="relative text-white font-black text-lg sm:text-xl tracking-tighter transform group-hover:scale-110 transition-transform duration-300">
    NN
  </div>
  
  {/* Neural network visualization */}
  <svg className="absolute inset-0 w-full h-full opacity-25 group-hover:opacity-40 transition-opacity duration-500" viewBox="0 0 40 40">
    <g className="animate-pulse" style={{animationDuration: '3s'}}>
      <path d="M8 8 Q20 15, 32 8" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
      <path d="M8 32 Q20 25, 32 32" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
    </g>
    <g className="animate-pulse" style={{animationDuration: '2s'}}>
      <circle cx="8" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
      <circle cx="32" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
      <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.9)"/>
    </g>
  </svg>
  
  {/* Live indicators */}
  <div className="absolute -top-0.5 -right-0.5 flex space-x-0.5">
    <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
    <div className="w-0.5 h-0.5 bg-green-400 rounded-full animate-pulse"></div>
  </div>
</div>`;
    }
    
    navigator.clipboard.writeText(logoCode);
    setSelectedLogo(logo.id);
    setTimeout(() => setSelectedLogo(''), 2000);
  };

  const getNNLogoCode = (logoId: string) => {
    switch (logoId) {
      case 'nn-connected':
        return `<div className="flex items-center space-x-1 group transition-all duration-500 hover:scale-105">
  <span className="text-blue-500 font-black text-lg sm:text-xl">N</span>
  <span className="text-gray-400 text-sm">—</span>
  <span className="text-purple-500 font-black text-lg sm:text-xl">N</span>
</div>`;
      
      case 'nn-gradient':
        return `<div className="group transition-all duration-500 hover:scale-105">
  <div className="font-black text-lg sm:text-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
    NN
  </div>
</div>`;
      
      case 'nn-glitch':
        return `<div className="flex items-center group transition-all duration-500 hover:scale-105">
  <span className="text-red-500 font-black text-lg sm:text-xl animate-pulse">N</span>
  <span className="text-cyan-500 font-black text-lg sm:text-xl animate-pulse" style={{animationDelay: '0.1s'}}>N</span>
</div>`;
      
      case 'nn-neon':
        return `<div className="group transition-all duration-500 hover:scale-105">
  <div className="relative font-black text-lg sm:text-xl text-cyan-400 filter drop-shadow-lg">
    NN
    <div className="absolute inset-0 text-cyan-300 animate-pulse blur-sm">NN</div>
  </div>
</div>`;
      
      default:
        return `<div className="group transition-all duration-500 hover:scale-105">
  <div className="font-black text-lg sm:text-xl text-blue-500">NN</div>
</div>`;
    }
  };

  const renderNNLogo = (logo: LogoVariant) => {
    // Handle "NN" typography designs
    if (logo.id.startsWith('nn-')) {
      switch (logo.id) {
        case 'nn-connected':
          return (
            <div className="flex items-center space-x-1">
              <span className="text-blue-500 font-black text-2xl">N</span>
              <span className="text-gray-400 text-sm">—</span>
              <span className="text-purple-500 font-black text-2xl">N</span>
            </div>
          );
        
        case 'nn-mirror':
          return (
            <div className="flex items-center">
              <span className="text-blue-500 font-black text-2xl">N</span>
              <span className="text-blue-400 font-black text-2xl transform scale-x-[-1]">N</span>
            </div>
          );
        
        case 'nn-stacked':
          return (
            <div className="flex flex-col items-center leading-none">
              <span className="text-blue-500 font-black text-xl">N</span>
              <span className="text-purple-500 font-black text-xl -mt-2">N</span>
            </div>
          );
        
        case 'nn-gradient':
          return (
            <div className="font-black text-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              NN
            </div>
          );
        
        case 'nn-cubic':
          return (
            <div className="font-black text-2xl text-blue-500 filter drop-shadow-lg">
              <span className="relative">
                N
                <span className="absolute top-0 left-0 text-blue-300 transform translate-x-0.5 -translate-y-0.5 -z-10">N</span>
              </span>
              <span className="relative ml-1">
                N
                <span className="absolute top-0 left-0 text-purple-300 transform translate-x-0.5 -translate-y-0.5 -z-10">N</span>
              </span>
            </div>
          );
        
        case 'nn-angular':
          return (
            <div className="font-black text-2xl text-gray-700 transform skew-x-12">
              NN
            </div>
          );
        
        case 'nn-circuit':
          return (
            <div className="relative">
              <div className="font-black text-2xl text-green-500 font-mono">NN</div>
              <div className="absolute inset-0 border border-green-400 border-dashed rounded opacity-50"></div>
            </div>
          );
        
        case 'nn-hexagonal':
          return (
            <div className="relative font-black text-2xl text-teal-500">
              <span className="relative">
                N
                <div className="absolute -inset-1 border border-teal-300 transform rotate-45 opacity-30"></div>
              </span>
              <span className="relative ml-1">
                N
                <div className="absolute -inset-1 border border-teal-300 transform rotate-45 opacity-30"></div>
              </span>
            </div>
          );
        
        case 'nn-glitch':
          return (
            <div className="relative font-black text-2xl">
              <span className="text-red-500 animate-pulse">N</span>
              <span className="text-cyan-500 animate-pulse" style={{animationDelay: '0.1s'}}>N</span>
              <div className="absolute inset-0 text-red-300 transform translate-x-0.5 opacity-50 animate-ping">NN</div>
            </div>
          );
        
        case 'nn-motion':
          return (
            <div className="relative font-black text-2xl text-blue-500">
              <span className="blur-sm opacity-30 absolute">NN</span>
              <span className="transform translate-x-1">NN</span>
            </div>
          );
        
        case 'nn-pulse':
          return (
            <div className="relative font-black text-2xl text-red-500 animate-pulse">
              NN
              <div className="absolute -inset-1 border-2 border-red-300 rounded animate-ping"></div>
            </div>
          );
        
        case 'nn-wave':
          return (
            <div className="relative font-black text-2xl text-blue-500">
              <span className="inline-block animate-bounce" style={{animationDelay: '0s'}}>N</span>
              <span className="inline-block animate-bounce" style={{animationDelay: '0.1s'}}>N</span>
            </div>
          );
        
        case 'nn-thin':
          return (
            <div className="font-thin text-2xl text-gray-600">
              NN
            </div>
          );
        
        case 'nn-dots':
          return (
            <div className="flex space-x-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          );
        
        case 'nn-outline':
          return (
            <div className="font-black text-2xl text-transparent" style={{WebkitTextStroke: '2px #3b82f6'}}>
              NN
            </div>
          );
        
        case 'nn-negative':
          return (
            <div className="relative">
              <div className="w-8 h-6 bg-gray-800 flex items-center justify-center">
                <span className="text-white font-black text-sm">NN</span>
              </div>
            </div>
          );
        
        case 'nn-brush':
          return (
            <div className="relative font-black text-2xl text-orange-600 transform -rotate-2">
              NN
              <div className="absolute inset-0 bg-orange-200 opacity-30 blur-sm rounded"></div>
            </div>
          );
        
        case 'nn-neon':
          return (
            <div className="relative font-black text-2xl text-cyan-400 filter drop-shadow-lg">
              NN
              <div className="absolute inset-0 text-cyan-300 animate-pulse blur-sm">NN</div>
            </div>
          );
        
        case 'nn-paper':
          return (
            <div className="relative font-black text-2xl text-amber-800">
              <span className="relative">
                N
                <div className="absolute inset-0 bg-amber-100 transform rotate-1 -z-10"></div>
              </span>
              <span className="relative ml-1">
                N
                <div className="absolute inset-0 bg-amber-100 transform -rotate-1 -z-10"></div>
              </span>
            </div>
          );
        
        case 'nn-crystal':
          return (
            <div className="relative font-black text-2xl text-emerald-500">
              NN
              <div className="absolute inset-0 text-emerald-300 transform scale-110 opacity-30">NN</div>
              <div className="absolute inset-0 border border-emerald-400 transform rotate-45 scale-75 opacity-50"></div>
            </div>
          );
        
        default:
          return (
            <div className="font-black text-2xl text-blue-500">
              NN
            </div>
          );
      }
    } else {
      // Handle older shape-based logos
      return (
        <div 
          className="relative w-16 h-16 flex items-center justify-center group transition-all duration-500 hover:scale-110 overflow-hidden" 
          style={{
            background: logo.background || 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            clipPath: logo.clipPath || 'none',
            filter: 'drop-shadow(0 10px 20px rgba(37, 99, 235, 0.3))'
          }}
        >
          {/* Animated particles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
          </div>
          
          {/* Logo content - Enhanced for current logo variations */}
          <div className="relative z-10 flex items-center space-x-0.5">
            <span className="text-white font-black text-sm tracking-tighter transform group-hover:scale-110 transition-transform duration-300">N</span>
            
            {/* Dynamic connecting element - DNA-like helix for current logos */}
            {logo.id.startsWith('current-') ? (
              <div className="relative w-1 h-3 flex flex-col justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-300 via-white to-purple-300 rounded-full animate-pulse"></div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 4 16">
                  <path 
                    d="M1 2 Q2.5 4, 1 6 Q-0.5 8, 1 10 Q2.5 12, 1 14" 
                    stroke="rgba(255,255,255,0.9)" 
                    strokeWidth="0.3" 
                    fill="none"
                    className="animate-pulse"
                  />
                  <path 
                    d="M3 2 Q1.5 4, 3 6 Q4.5 8, 3 10 Q1.5 12, 3 14" 
                    stroke="rgba(255,255,255,0.7)" 
                    strokeWidth="0.3" 
                    fill="none"
                    className="animate-pulse"
                    style={{animationDelay: '0.3s'}}
                  />
                </svg>
              </div>
            ) : (
              <div className="relative w-1 h-3 flex flex-col justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-300 via-white to-purple-300 rounded-full animate-pulse"></div>
              </div>
            )}
            
            <span className="text-white font-black text-sm tracking-tighter transform group-hover:scale-110 transition-transform duration-300">N</span>
          </div>

          {/* Enhanced Neural network visualization for current logos */}
          <svg className="absolute inset-0 w-full h-full opacity-25 group-hover:opacity-40 transition-opacity duration-500" viewBox="0 0 40 40">
            {/* Synaptic connections */}
            <g className="animate-pulse" style={{animationDuration: '3s'}}>
              <path d="M8 8 Q20 15, 32 8" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
              <path d="M8 32 Q20 25, 32 32" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
              {logo.id.startsWith('current-') && (
                <path d="M8 20 L32 20" stroke="rgba(255,255,255,0.4)" strokeWidth="0.2" fill="none"/>
              )}
            </g>
            
            {/* Neural nodes */}
            <g className="animate-pulse" style={{animationDuration: '2s', animationDelay: '0.5s'}}>
              <circle cx="8" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="32" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="8" cy="32" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="32" cy="32" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.9)"/>
            </g>
            
            {/* Enhanced data flow lines for current logos */}
            {logo.id.startsWith('current-') && (
              <g className="animate-pulse" style={{animationDuration: '4s', animationDelay: '1s'}}>
                <path d="M5 15 L15 12 L25 18 L35 15" stroke="rgba(0,255,255,0.5)" strokeWidth="0.4" fill="none" strokeDasharray="1,1"/>
                <path d="M5 25 L15 28 L25 22 L35 25" stroke="rgba(255,0,255,0.5)" strokeWidth="0.4" fill="none" strokeDasharray="1,1"/>
              </g>
            )}
          </svg>

          {/* Enhanced live indicators for current logos */}
          <div className="absolute -top-0.5 -right-0.5 flex space-x-0.5">
            <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
            <div className="w-0.5 h-0.5 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* Breaking news indicator for current logos */}
          {logo.id.startsWith('current-') && (
            <div className="absolute -bottom-0.5 -left-0.5 w-2 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse opacity-80"></div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            NewsNerve Logo Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            Complete collection featuring creative "NN" typography and trust-based verification logos
          </p>
          <div className="flex justify-center items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
              ✨ Typography Focus
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
              🛡️ Trust & Verification
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30">
              🎨 Creative Shapes
            </span>
          </div>
          
          <div className="flex justify-center">
            <a 
              href="/admin/logo-manager" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🔒 Admin Logo Manager
              <span className="ml-2 text-sm opacity-90">Requires Authentication</span>
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLogos.map((logo) => (
            <div
              key={logo.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="flex justify-center mb-4 min-h-[80px] items-center">
                <div 
                  className="relative flex items-center justify-center group transition-all duration-500 hover:scale-110 cursor-pointer p-4" 
                  onClick={() => copyLogoCode(logo)}
                >
                  {renderNNLogo(logo)}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {logo.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {logo.description}
                </p>
                <div className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {logo.category}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {logo.symbolism}
                </div>
              </div>

              <button
                onClick={() => copyLogoCode(logo)}
                className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-all ${
                  selectedLogo === logo.id
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {selectedLogo === logo.id ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>1. <strong>Browse</strong> the gallery and click on any "NN" design to copy its code</p>
            <p>2. <strong>Replace</strong> the logo section in your Header.tsx with the copied code</p>
            <p>3. <strong>Customize</strong> colors, fonts, and animations as needed</p>
            <p>4. <strong>Test</strong> across different screen sizes and themes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoGallery;
