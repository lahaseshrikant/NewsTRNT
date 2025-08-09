'use client';

import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';

interface LogoHistory {
  id: string;
  name: string;
  timestamp: Date;
  config: LogoConfig;
  preview: string;
  dataUrl: string; // Visual representation (SVG, PNG, or code as data URL)
  format: string; // 'svg', 'png', 'image', 'html', 'css', etc.
  code?: string; // Raw code for code-based logos
}

interface LogoConfig {
  type: 'typography' | 'shape' | 'image' | 'code' | 'current';
  text: string;
  shape: string;
  background: string;
  textColor: string;
  size: 'small' | 'medium' | 'large';
  animation: 'none' | 'pulse' | 'glow' | 'bounce' | 'spin';
  customCSS: string;
  clipPath?: string;
  hasNeuralNetwork: boolean;
  neuralIntensity: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadowIntensity: number;
  imageUrl?: string;
  imageFile?: File;
  customCode?: string;
  codeLanguage?: 'svg' | 'html' | 'css' | 'react';
}

const LogoManager = () => {
  const [currentLogo, setCurrentLogo] = useState<LogoConfig>({
    type: 'typography',
    text: 'NN',
    shape: 'none',
    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    textColor: '#ffffff',
    size: 'medium',
    animation: 'none',
    customCSS: '',
    hasNeuralNetwork: true,
    neuralIntensity: 50,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#ffffff',
    shadowIntensity: 2,
    imageUrl: '',
    customCode: '',
    codeLanguage: 'svg'
  });

  const [logoHistory, setLogoHistory] = useState<LogoHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'deploy'>('create');
  const [savedLogos, setSavedLogos] = useState<LogoHistory[]>([]);
  const [actualCurrentLogo, setActualCurrentLogo] = useState<LogoConfig>(currentLogo);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [tempImagePreview, setTempImagePreview] = useState<string>('');
  const [isEditingCurrent, setIsEditingCurrent] = useState(false);
  const [lastSavedLogoConfig, setLastSavedLogoConfig] = useState<string>('');
  const [logoName, setLogoName] = useState<string>('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingSaveLogo, setPendingSaveLogo] = useState<LogoConfig | null>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingHistoryName, setEditingHistoryName] = useState<string>('');
  const logoPreviewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to convert ACTIVE CURRENT logo to visual format for history
  // This captures the logo that is actually "Active across site"
  const convertLogoToVisualFormat = async (logoConfig: LogoConfig): Promise<{ dataUrl: string; format: string; code?: string }> => {
    if (logoConfig.type === 'image' && logoConfig.imageUrl) {
      // For image logos, return the image URL directly in proper format
      try {
        console.log('Converting image logo to visual format:', logoConfig.imageUrl);
        
        // If it's already a data URL, use it directly
        if (logoConfig.imageUrl.startsWith('data:')) {
          console.log('Image is already a data URL, using directly');
          return {
            dataUrl: logoConfig.imageUrl,
            format: 'png',
            code: undefined
          };
        }
        
        // Convert image to base64 if it's not already
        const response = await fetch(logoConfig.imageUrl);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        console.log('Image converted to data URL successfully, length:', dataUrl.length);
        return {
          dataUrl,
          format: 'png',
          code: undefined
        };
      } catch (error) {
        console.error('Error converting image:', error);
        // Fallback - use the original URL
        return {
          dataUrl: logoConfig.imageUrl,
          format: 'image',
          code: undefined
        };
      }
    }
    
    if (logoConfig.type === 'code' && logoConfig.customCode) {
      // For code logos, save the actual code
      return {
        dataUrl: `data:text/plain;base64,${btoa(logoConfig.customCode)}`,
        format: logoConfig.codeLanguage || 'svg',
        code: logoConfig.customCode
      };
    }
    
    // For typography/shape logos, capture the actual rendered HTML/CSS
    const actualRenderedCode = captureActualLogoCode(logoConfig);
    const dataUrl = `data:text/html;base64,${btoa(actualRenderedCode)}`;
    
    return {
      dataUrl,
      format: 'html',
      code: actualRenderedCode
    };
  };

  // Function to capture the actual rendered logo code that's "Active across site"
  const captureActualLogoCode = (logoConfig: LogoConfig): string => {
    const selectedShape = shapes.find(s => s.id === logoConfig.shape) || shapes[0];
    
    // These are the exact size classes used in the Header component
    const sizeClasses = {
      small: 'w-6 h-6 sm:w-8 sm:h-8',
      medium: 'w-8 h-8 sm:w-10 sm:h-10',
      large: 'w-10 h-10 sm:w-12 sm:h-12'
    };

    const animationClasses = {
      none: '',
      pulse: 'animate-pulse',
      glow: 'animate-pulse filter drop-shadow-lg',
      bounce: 'animate-bounce',
      spin: 'animate-spin'
    };

    const textSizeClasses = {
      small: 'text-xs',
      medium: 'text-xs sm:text-sm',
      large: 'text-sm sm:text-base'
    };

    const borderRadius = logoConfig.borderRadius || 0;
    const borderWidth = logoConfig.borderWidth || 0;
    const borderColor = logoConfig.borderColor || '#ffffff';
    const shadowIntensity = logoConfig.shadowIntensity || 2;

    const getBorderRadius = () => {
      if (logoConfig.shape === 'rounded' || borderRadius > 0) {
        return `${borderRadius}px`;
      }
      return logoConfig.clipPath === 'none' ? `${borderRadius}px` : '0';
    };

    const getShadowStyle = () => {
      if (shadowIntensity === 0) return '';
      const intensity = shadowIntensity;
      return `drop-shadow(0 ${intensity}px ${intensity * 2}px rgba(37, 99, 235, 0.${intensity > 5 ? '4' : '3'}))`;
    };

    // Generate the exact HTML that's rendered on the site
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NewsNerve Logo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
            50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-bounce { animation: bounce 1s infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-700 { animation-delay: 700ms; }
    </style>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="relative ${sizeClasses[logoConfig.size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[logoConfig.animation]}"
         style="background: ${logoConfig.background}; clip-path: ${logoConfig.clipPath || 'none'}; border-radius: ${getBorderRadius()}; border: ${borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'}; filter: ${getShadowStyle()}">
        
        <!-- Animated background particles -->
        <div class="absolute inset-0 opacity-20">
            <div class="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-pulse animation-delay-100"></div>
            <div class="absolute top-2 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse animation-delay-300"></div>
            <div class="absolute bottom-2 left-2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping animation-delay-500"></div>
            <div class="absolute bottom-1 right-1 w-1 h-1 bg-pink-300 rounded-full animate-pulse animation-delay-700"></div>
        </div>
        
        <!-- Main logo content -->
        <div class="relative z-10 flex items-center space-x-0.5">
            <span class="font-black ${textSizeClasses[logoConfig.size]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                  style="color: ${logoConfig.textColor}">
                ${logoConfig.text.charAt(0)}
            </span>
            
            ${logoConfig.text.length > 1 ? `
            <!-- Dynamic connecting element - DNA-like helix -->
            <div class="relative w-1 h-3 sm:h-4 flex flex-col justify-center">
                <div class="absolute inset-0 bg-gradient-to-b from-cyan-300 via-white to-purple-300 rounded-full animate-pulse"></div>
                <svg class="absolute inset-0 w-full h-full" viewBox="0 0 4 16">
                    <path d="M1 2 Q2.5 4, 1 6 Q-0.5 8, 1 10 Q2.5 12, 1 14" 
                          stroke="rgba(255,255,255,0.9)" 
                          stroke-width="0.3" 
                          fill="none"
                          class="animate-pulse"/>
                    <path d="M3 2 Q1.5 4, 3 6 Q4.5 8, 3 10 Q1.5 12, 3 14" 
                          stroke="rgba(255,255,255,0.7)" 
                          stroke-width="0.3" 
                          fill="none"
                          class="animate-pulse"/>
                </svg>
            </div>
            
            <span class="font-black ${textSizeClasses[logoConfig.size]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                  style="color: ${logoConfig.textColor}">
                ${logoConfig.text.charAt(1)}
            </span>` : ''}
        </div>
        
        ${logoConfig.hasNeuralNetwork ? `
        <!-- Neural network overlay -->
        <div class="absolute inset-0 pointer-events-none opacity-${Math.floor(logoConfig.neuralIntensity / 10)}">
            <svg class="w-full h-full" viewBox="0 0 40 40">
                <defs>
                    <radialGradient id="neuralGlow">
                        <stop offset="0%" style="stop-color:rgba(59, 130, 246, 0.8);stop-opacity:1" />
                        <stop offset="100%" style="stop-color:rgba(59, 130, 246, 0);stop-opacity:0" />
                    </radialGradient>
                </defs>
                
                <!-- Neural nodes -->
                <circle cx="8" cy="12" r="1" fill="url(#neuralGlow)" class="animate-pulse animation-delay-100">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="32" cy="8" r="1" fill="url(#neuralGlow)" class="animate-pulse animation-delay-300">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="12" cy="32" r="1" fill="url(#neuralGlow)" class="animate-pulse animation-delay-500">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="28" cy="28" r="1" fill="url(#neuralGlow)" class="animate-pulse animation-delay-700">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite"/>
                </circle>
                
                <!-- Neural connections -->
                <line x1="8" y1="12" x2="32" y2="8" stroke="rgba(59, 130, 246, 0.3)" stroke-width="0.5" class="animate-pulse">
                    <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
                </line>
                <line x1="12" y1="32" x2="28" y2="28" stroke="rgba(59, 130, 246, 0.3)" stroke-width="0.5" class="animate-pulse">
                    <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" repeatCount="indefinite"/>
                </line>
            </svg>
        </div>` : ''}
    </div>
</body>
</html>`;
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('newsnerve-logo-history');
    const savedFavorites = localStorage.getItem('newsnerve-saved-logos');
    const activeLogo = localStorage.getItem('newsnerve-active-logo');
    
    if (savedHistory) {
      setLogoHistory(JSON.parse(savedHistory));
    }
    if (savedFavorites) {
      setSavedLogos(JSON.parse(savedFavorites));
    }
    
    if (activeLogo) {
      // Load the actual active logo from localStorage
      try {
        const logoConfig = JSON.parse(activeLogo);
        setActualCurrentLogo(logoConfig); // Don't merge, use the exact saved config
        setLastSavedLogoConfig(activeLogo);
      } catch (error) {
        console.error('Error loading active logo:', error);
        setActualCurrentLogo(currentLogo);
        setLastSavedLogoConfig(JSON.stringify(currentLogo));
      }
    } else {
      // Only apply default square logo if no active logo exists
      const newSquareLogo = {
        type: 'typography' as const,
        text: 'NN',
        shape: 'none', // Rectangle/square shape
        clipPath: 'none',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(67, 56, 202, 0.8) 50%, rgba(124, 58, 237, 0.8) 100%)', // Semi-transparent gradient
        textColor: '#ffffff',
        size: 'medium' as const,
        animation: 'none' as const,
        customCSS: '',
        hasNeuralNetwork: true,
        neuralIntensity: 50,
        borderRadius: 4, // Slightly rounded corners for a modern square look
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle transparent border
        shadowIntensity: 3,
        imageUrl: '',
        customCode: '',
        codeLanguage: 'svg' as const
      };
      
      setActualCurrentLogo(newSquareLogo);
      setLastSavedLogoConfig(JSON.stringify(newSquareLogo));
      // Store this as the active logo
      localStorage.setItem('newsnerve-active-logo', JSON.stringify(newSquareLogo));
    }
    
    // Logo loaded and ready
  }, []);

  const shapes = [
    { id: 'none', name: 'Rectangle', clipPath: 'none' },
    { id: 'rounded', name: 'Rounded Rectangle', clipPath: 'none' },
    { id: 'circle', name: 'Circle', clipPath: 'circle(50% at 50% 50%)' },
    { id: 'star', name: 'Star', clipPath: 'polygon(50% 0%, 60% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 40% 35%)' },
    { id: 'shield', name: 'Shield', clipPath: 'polygon(50% 0%, 80% 15%, 100% 35%, 85% 85%, 50% 100%, 15% 85%, 0% 35%, 20% 15%)' },
    { id: 'hexagon', name: 'Hexagon', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' },
    { id: 'diamond', name: 'Diamond', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
    { id: 'octagon', name: 'Octagon', clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' },
    { id: 'crown', name: 'Crown', clipPath: 'polygon(10% 70%, 20% 30%, 30% 50%, 40% 20%, 50% 40%, 60% 20%, 70% 50%, 80% 30%, 90% 70%, 85% 85%, 15% 85%)' },
    { id: 'heart', name: 'Heart', clipPath: 'polygon(50% 15%, 40% 0%, 25% 0%, 10% 15%, 5% 30%, 15% 45%, 35% 60%, 50% 85%, 65% 60%, 85% 45%, 95% 30%, 90% 15%, 75% 0%, 60% 0%)' },
    { id: 'triangle', name: 'Triangle', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
    { id: 'trapezoid', name: 'Trapezoid', clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' },
    { id: 'parallelogram', name: 'Parallelogram', clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' },
    { id: 'cross', name: 'Cross', clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)' },
    { id: 'arrow', name: 'Arrow', clipPath: 'polygon(40% 0%, 40% 20%, 100% 20%, 100% 80%, 40% 80%, 40% 100%, 0% 50%)' },
    { id: 'custom', name: 'Custom Shape', clipPath: 'none' }
  ];

  const gradientPresets = [
    'linear-gradient(135deg, #2563eb 0%, #4338ca 50%, #7c3aed 100%)',
    'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #d97706 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
    'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    'linear-gradient(135deg, #92400e 0%, #d97706 50%, #fbbf24 100%)',
    'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
    'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)'
  ];

  const updateLogo = (updates: Partial<LogoConfig>) => {
    const updatedLogo = { ...currentLogo, ...updates };
    setCurrentLogo(updatedLogo);
    
    // Only update local preview, do NOT deploy to site automatically
    // Real site deployment happens only when user clicks "Deploy"
  };

  const editCurrentLogo = () => {
    // Load the actual current logo into the editor
    setCurrentLogo({
      ...actualCurrentLogo,
      borderRadius: actualCurrentLogo.borderRadius || 0,
      borderWidth: actualCurrentLogo.borderWidth || 0,
      borderColor: actualCurrentLogo.borderColor || '#ffffff',
      shadowIntensity: actualCurrentLogo.shadowIntensity || 2,
      imageUrl: actualCurrentLogo.imageUrl || '',
      customCode: actualCurrentLogo.customCode || '',
      codeLanguage: actualCurrentLogo.codeLanguage || 'svg'
    });
    setIsEditingCurrent(true);
    setActiveTab('create');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setTempImagePreview(imageUrl);
        updateLogo({ 
          type: 'image', 
          imageUrl: imageUrl,
          imageFile: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const exportCurrentLogoCode = () => {
    const logoCode = generateLogoCode();
    updateLogo({ 
      type: 'code', 
      customCode: logoCode,
      codeLanguage: 'react'
    });
    setShowCodeEditor(true);
  };

  const importLogoFromCode = (code: string, language: 'svg' | 'html' | 'css' | 'react') => {
    updateLogo({ 
      type: 'code', 
      customCode: code,
      codeLanguage: language
    });
  };

  const createCustomShape = (clipPath: string, shapeName: string) => {
    updateLogo({ 
      shape: 'custom',
      clipPath: clipPath,
      customCSS: `/* Custom shape: ${shapeName} */`
    });
  };

  const saveLogo = async () => {
    if (isEditingCurrent) {
      // When editing current logo, just save changes locally (don't deploy yet)
      setIsEditingCurrent(false);
      alert('✅ Logo changes saved locally! Use "Deploy" to apply to site.');
    } else {
      // When creating new logo, just save it locally (don't deploy yet)
      alert('✅ New logo saved locally! Use "Deploy" to apply to site.');
    }
  };

  const saveToFavorites = (logo: LogoHistory) => {
    const updatedFavorites = [logo, ...savedLogos];
    setSavedLogos(updatedFavorites);
    localStorage.setItem('newsnerve-saved-logos', JSON.stringify(updatedFavorites));
  };

  const loadLogo = (logo: LogoHistory) => {
    setCurrentLogo(logo.config);
  };

  const saveCurrentLogoToHistory = async (customName?: string) => {
    // Use the ACTUAL current active logo that's running on the site
    const currentActiveLogo = actualCurrentLogo;
    
    // Check if this logo is already in history to avoid duplicates
    // For image logos, compare by imageUrl and type specifically
    const logoExists = logoHistory.some(historyItem => {
      if (currentActiveLogo.type === 'image' && historyItem.config.type === 'image') {
        return historyItem.config.imageUrl === currentActiveLogo.imageUrl;
      }
      // For other types, use full config comparison
      return JSON.stringify(historyItem.config) === JSON.stringify(currentActiveLogo);
    });
    
    if (logoExists && !customName) {
      return false; // Don't save duplicate, return false to indicate no save
    }
    
    // Convert the ACTUAL active logo to visual format
    const visualData = await convertLogoToVisualFormat(currentActiveLogo);
    
    // Generate appropriate name
    let logoNameToUse = customName;
    if (!logoNameToUse) {
      logoNameToUse = currentActiveLogo.type === 'image' 
        ? `Image Logo - ${new Date().toLocaleString()}`
        : `Active Logo - ${new Date().toLocaleString()}`;
    }
    
    const historyItem: LogoHistory = {
      id: Date.now().toString(),
      name: logoNameToUse,
      timestamp: new Date(),
      config: { ...currentActiveLogo }, // The actual active logo config
      preview: '', // Keep for backward compatibility
      dataUrl: visualData.dataUrl,
      format: visualData.format,
      code: visualData.code
    };

    const updatedHistory = [historyItem, ...logoHistory].slice(0, 50);
    setLogoHistory(updatedHistory);
    localStorage.setItem('newsnerve-logo-history', JSON.stringify(updatedHistory));
    return true; // Return true to indicate successful save
  };

  const saveLogoWithName = async (logoConfig: LogoConfig, name: string) => {
    // Convert the logo to visual format
    const visualData = await convertLogoToVisualFormat(logoConfig);
    
    const historyItem: LogoHistory = {
      id: Date.now().toString(),
      name: name,
      timestamp: new Date(),
      config: { ...logoConfig },
      preview: '',
      dataUrl: visualData.dataUrl,
      format: visualData.format,
      code: visualData.code
    };

    const updatedHistory = [historyItem, ...logoHistory].slice(0, 50);
    setLogoHistory(updatedHistory);
    localStorage.setItem('newsnerve-logo-history', JSON.stringify(updatedHistory));
    return true;
  };

  const handleSaveWithName = () => {
    setShowNameDialog(true);
    setPendingSaveLogo(actualCurrentLogo);
    setLogoName('');
  };

  const confirmSaveWithName = async () => {
    if (pendingSaveLogo && logoName.trim()) {
      await saveLogoWithName(pendingSaveLogo, logoName.trim());
      setShowNameDialog(false);
      setPendingSaveLogo(null);
      setLogoName('');
      alert(`✅ Logo saved as "${logoName.trim()}"!`);
    }
  };

  const startEditingHistoryName = (logoId: string, currentName: string) => {
    setEditingHistoryId(logoId);
    setEditingHistoryName(currentName);
  };

  const cancelEditingHistoryName = () => {
    setEditingHistoryId(null);
    setEditingHistoryName('');
  };

  const saveHistoryNameEdit = (logoId: string) => {
    if (!editingHistoryName.trim()) return;

    const updatedHistory = logoHistory.map(logo => 
      logo.id === logoId 
        ? { ...logo, name: editingHistoryName.trim() }
        : logo
    );
    
    setLogoHistory(updatedHistory);
    localStorage.setItem('newsnerve-logo-history', JSON.stringify(updatedHistory));
    setEditingHistoryId(null);
    setEditingHistoryName('');
  };

  const deleteHistoryItem = (logoId: string) => {
    if (confirm('Are you sure you want to delete this logo from history?')) {
      const updatedHistory = logoHistory.filter(logo => logo.id !== logoId);
      setLogoHistory(updatedHistory);
      localStorage.setItem('newsnerve-logo-history', JSON.stringify(updatedHistory));
    }
  };

  const deployCurrentLogo = async () => {
    // Deploy the current working logo (from editor) to the entire site
    const logoToDeploy = isEditingCurrent ? currentLogo : actualCurrentLogo;
    
    // Apply the logo across the site
    localStorage.setItem('newsnerve-active-logo', JSON.stringify(logoToDeploy));
    
    // Update the actual current logo state
    setActualCurrentLogo(logoToDeploy);
    
    // Force immediate update across all components
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('logoChanged', { 
        detail: { config: logoToDeploy } 
      }));
    }, 50);
    
    // Also dispatch storage event for cross-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'newsnerve-active-logo',
      newValue: JSON.stringify(logoToDeploy),
      storageArea: localStorage
    }));
    
    // Save the deployed logo to history with deployment indication
    const deploymentName = `Deployed: ${logoToDeploy.type === 'image' ? 'Image Logo' : logoToDeploy.text || 'Logo'} - ${new Date().toLocaleString()}`;
    const saved = await saveCurrentLogoToHistory(deploymentName);
    if (saved) {
      setLastSavedLogoConfig(JSON.stringify(logoToDeploy));
    }
    
    alert('🚀 Logo deployed across entire site and saved to history!');
  };

  const revertToPreviousLogo = () => {
    if (logoHistory.length > 0) {
      const previousLogo = logoHistory[0];
      updateCurrentActiveLogo(previousLogo.config);
      alert('✅ Reverted to previous logo from history!');
    } else {
      alert('❌ No previous logos found in history.');
    }
  };

  const exportToDevice = async () => {
    if (logoPreviewRef.current) {
      try {
        const dataUrl = await toPng(logoPreviewRef.current, {
          backgroundColor: 'transparent',
          width: 200,
          height: 200,
          pixelRatio: 2
        });
        
        const link = document.createElement('a');
        link.download = `newsnerve-logo-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error exporting logo:', error);
      }
    }
  };

  const applyToSite = () => {
    // Store the current logo config to be used across the site
    localStorage.setItem('newsnerve-active-logo', JSON.stringify(currentLogo));
    
    // Dispatch custom event to notify components to update
    window.dispatchEvent(new CustomEvent('logoChanged', { 
      detail: { config: currentLogo } 
    }));
    
    alert('Logo applied across the site! The header and other components will update automatically.');
  };

  const updateCurrentActiveLogo = (updates: Partial<LogoConfig>) => {
    // Get the current active logo from localStorage
    const activeLogo = localStorage.getItem('newsnerve-active-logo');
    let updatedLogo = currentLogo;
    
    if (activeLogo) {
      try {
        updatedLogo = { ...JSON.parse(activeLogo), ...updates };
      } catch (error) {
        updatedLogo = { ...currentLogo, ...updates };
      }
    } else {
      updatedLogo = { ...currentLogo, ...updates };
    }
    
    // Update localStorage immediately
    localStorage.setItem('newsnerve-active-logo', JSON.stringify(updatedLogo));
    
    // Update local state
    setActualCurrentLogo(updatedLogo);
    setCurrentLogo(updatedLogo);
    
    // Update the last saved config since we're applying changes
    setLastSavedLogoConfig(JSON.stringify(updatedLogo));
    
    // Force immediate update across all components
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('logoChanged', { 
        detail: { config: updatedLogo } 
      }));
    }, 50);
    
    // Also dispatch storage event for cross-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'newsnerve-active-logo',
      newValue: JSON.stringify(updatedLogo),
      storageArea: localStorage
    }));
    
    return updatedLogo;
  };

  const generateLogoCode = () => {
    const selectedShape = shapes.find(s => s.id === currentLogo.shape);
    
    return `<div 
  className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden" 
  style={{
    background: '${currentLogo.background}',
    clipPath: '${selectedShape?.clipPath || 'none'}',
    filter: 'drop-shadow(0 10px 20px rgba(37, 99, 235, 0.3))'
  }}>
  
  {/* Logo Text */}
  <div className="relative font-black text-lg sm:text-xl tracking-tighter transform group-hover:scale-110 transition-transform duration-300" 
       style={{ color: '${currentLogo.textColor}' }}>
    ${currentLogo.text}
  </div>
  
  ${currentLogo.hasNeuralNetwork ? `
  {/* Neural Network Visualization */}
  <svg className="absolute inset-0 w-full h-full opacity-${Math.round(currentLogo.neuralIntensity / 4)} group-hover:opacity-${Math.round(currentLogo.neuralIntensity / 2)} transition-opacity duration-500" viewBox="0 0 40 40">
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
  ` : ''}
  
  {/* Animation Classes */}
  <div className="${currentLogo.animation === 'pulse' ? 'animate-pulse' : ''} ${currentLogo.animation === 'bounce' ? 'animate-bounce' : ''} ${currentLogo.animation === 'spin' ? 'animate-spin' : ''}">
  </div>
</div>`;
  };

  const renderCurrentLogo = () => {
    const selectedShape = shapes.find(s => s.id === currentLogo.shape) || shapes[0];
    
    const sizeClasses = {
      small: 'w-12 h-12',
      medium: 'w-16 h-16',
      large: 'w-20 h-20'
    };

    const animationClasses = {
      none: '',
      pulse: 'animate-pulse',
      glow: 'animate-pulse filter drop-shadow-lg',
      bounce: 'animate-bounce',
      spin: 'animate-spin'
    };

    const textSizeClasses = {
      small: 'text-sm',
      medium: 'text-lg',
      large: 'text-xl'
    };

    // Handle new properties with defaults for backward compatibility
    const borderRadius = currentLogo.borderRadius || 0;
    const borderWidth = currentLogo.borderWidth || 0;
    const borderColor = currentLogo.borderColor || '#ffffff';
    const shadowIntensity = currentLogo.shadowIntensity || 2;

    // Determine styling based on shape and border radius
    const getBorderRadius = () => {
      if (currentLogo.shape === 'rounded' || borderRadius > 0) {
        return `${borderRadius}px`;
      }
      return selectedShape?.clipPath === 'none' ? `${borderRadius}px` : '0';
    };

    const getShadowStyle = () => {
      if (shadowIntensity === 0) return '';
      const intensity = shadowIntensity;
      return `drop-shadow(0 ${intensity}px ${intensity * 2}px rgba(37, 99, 235, 0.${intensity > 5 ? '4' : '3'}))`;
    };

    // Handle image logos
    if (currentLogo.type === 'image' && currentLogo.imageUrl) {
      return (
        <div 
          ref={logoPreviewRef}
          className={`relative ${sizeClasses[currentLogo.size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[currentLogo.animation]}`}
          style={{
            background: currentLogo.background,
            clipPath: currentLogo.clipPath || selectedShape?.clipPath || 'none',
            borderRadius: getBorderRadius(),
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            filter: getShadowStyle()
          }}
        >
          <img 
            src={currentLogo.imageUrl} 
            alt="Logo Preview" 
            className="w-full h-full object-cover"
            style={{
              borderRadius: getBorderRadius()
            }}
          />
        </div>
      );
    }

    // Handle custom code logos
    if (currentLogo.type === 'code' && currentLogo.customCode) {
      return (
        <div 
          ref={logoPreviewRef}
          className={`relative ${sizeClasses[currentLogo.size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[currentLogo.animation]}`}
          style={{
            background: currentLogo.background,
            clipPath: currentLogo.clipPath || selectedShape?.clipPath || 'none',
            borderRadius: getBorderRadius(),
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            filter: getShadowStyle()
          }}
          dangerouslySetInnerHTML={{ 
            __html: currentLogo.customCode 
          }}
        />
      );
    }

    // Handle text/typography/shape logos (default) - this is the enhanced version
    return (
      <div 
        ref={logoPreviewRef}
        className={`relative ${sizeClasses[currentLogo.size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[currentLogo.animation]}`}
        style={{
          background: currentLogo.background,
          clipPath: currentLogo.clipPath || selectedShape?.clipPath || 'none',
          borderRadius: getBorderRadius(),
          border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
          filter: getShadowStyle()
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-100"></div>
          <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse animation-delay-300"></div>
          <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping animation-delay-500"></div>
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-pink-300 rounded-full animate-pulse animation-delay-700"></div>
        </div>
        
        {/* Main logo content */}
        <div className="relative z-10 flex items-center space-x-0.5">
          <span 
            className={`font-black ${textSizeClasses[currentLogo.size]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
            style={{ color: currentLogo.textColor }}
          >
            {currentLogo.text.charAt(0)}
          </span>
          
          {currentLogo.text.length > 1 && (
            <>
              {/* Dynamic connecting element - DNA-like helix */}
              <div className="relative w-1 h-3 sm:h-4 flex flex-col justify-center">
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
              
              <span 
                className={`font-black ${textSizeClasses[currentLogo.size]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
                style={{ color: currentLogo.textColor }}
              >
                {currentLogo.text.charAt(1)}
              </span>
            </>
          )}
        </div>

        {/* Neural network visualization */}
        {currentLogo.hasNeuralNetwork && (
          <svg 
            className={`absolute inset-0 w-full h-full opacity-${Math.round(currentLogo.neuralIntensity / 4)} group-hover:opacity-${Math.round(currentLogo.neuralIntensity / 2)} transition-opacity duration-500`} 
            viewBox="0 0 40 40"
          >
            {/* Synaptic connections */}
            <g className="animate-pulse" style={{animationDuration: '3s'}}>
              <path d="M8 8 Q20 15, 32 8" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
              <path d="M8 32 Q20 25, 32 32" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
              <path d="M8 20 L32 20" stroke="rgba(255,255,255,0.4)" strokeWidth="0.2" fill="none"/>
            </g>
            
            {/* Neural nodes */}
            <g className="animate-pulse" style={{animationDuration: '2s', animationDelay: '0.5s'}}>
              <circle cx="8" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="32" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="8" cy="32" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="32" cy="32" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.9)"/>
            </g>
            
            {/* Enhanced data flow lines */}
            <g className="animate-pulse" style={{animationDuration: '4s', animationDelay: '1s'}}>
              <path d="M5 15 L15 12 L25 18 L35 15" stroke="rgba(0,255,255,0.5)" strokeWidth="0.4" fill="none" strokeDasharray="1,1"/>
              <path d="M5 25 L15 28 L25 22 L35 25" stroke="rgba(255,0,255,0.5)" strokeWidth="0.4" fill="none" strokeDasharray="1,1"/>
            </g>
          </svg>
        )}

        {/* Live pulse indicators */}
        <div className="absolute -top-0.5 -right-0.5 flex space-x-0.5">
          <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
          <div className="w-0.5 h-0.5 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  };

  // Render the ACTUAL current logo (from localStorage - same as Header)
  const renderActualCurrentLogo = () => {
    const selectedShape = shapes.find(s => s.id === actualCurrentLogo.shape) || shapes[0];
    
    const sizeClasses = {
      small: 'w-12 h-12',
      medium: 'w-16 h-16',
      large: 'w-20 h-20'
    };

    const animationClasses = {
      none: '',
      pulse: 'animate-pulse',
      glow: 'animate-pulse filter drop-shadow-lg',
      bounce: 'animate-bounce',
      spin: 'animate-spin'
    };

    const textSizeClasses = {
      small: 'text-sm',
      medium: 'text-lg',
      large: 'text-xl'
    };

    // Handle new properties with defaults for backward compatibility
    const borderRadius = actualCurrentLogo.borderRadius || 0;
    const borderWidth = actualCurrentLogo.borderWidth || 0;
    const borderColor = actualCurrentLogo.borderColor || '#ffffff';
    const shadowIntensity = actualCurrentLogo.shadowIntensity || 2;

    // Determine styling based on shape and border radius
    const getBorderRadius = () => {
      if (actualCurrentLogo.shape === 'rounded' || borderRadius > 0) {
        return `${borderRadius}px`;
      }
      return selectedShape?.clipPath === 'none' ? `${borderRadius}px` : '0';
    };

    const getShadowStyle = () => {
      if (shadowIntensity === 0) return '';
      const intensity = shadowIntensity;
      return `drop-shadow(0 ${intensity}px ${intensity * 2}px rgba(37, 99, 235, 0.${intensity > 5 ? '4' : '3'}))`;
    };

    // Handle image logos
    if (actualCurrentLogo.type === 'image' && actualCurrentLogo.imageUrl) {
      return (
        <div 
          className={`relative ${sizeClasses[actualCurrentLogo.size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[actualCurrentLogo.animation]}`}
          style={{
            background: actualCurrentLogo.background,
            clipPath: actualCurrentLogo.clipPath || selectedShape?.clipPath || 'none',
            borderRadius: getBorderRadius(),
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            filter: getShadowStyle()
          }}
        >
          <img 
            src={actualCurrentLogo.imageUrl} 
            alt="Current Logo" 
            className="w-full h-full object-cover"
            style={{
              borderRadius: getBorderRadius()
            }}
          />
        </div>
      );
    }

    // Handle custom code logos
    if (actualCurrentLogo.type === 'code' && actualCurrentLogo.customCode) {
      return (
        <div 
          className={`relative ${sizeClasses[actualCurrentLogo.size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[actualCurrentLogo.animation]}`}
          style={{
            background: actualCurrentLogo.background,
            clipPath: actualCurrentLogo.clipPath || selectedShape?.clipPath || 'none',
            borderRadius: getBorderRadius(),
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            filter: getShadowStyle()
          }}
          dangerouslySetInnerHTML={{ 
            __html: actualCurrentLogo.customCode 
          }}
        />
      );
    }

    // Handle text/typography/shape logos (default)
    return (
      <div 
        className={`relative ${sizeClasses[actualCurrentLogo.size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[actualCurrentLogo.animation]}`}
        style={{
          background: actualCurrentLogo.background,
          clipPath: actualCurrentLogo.clipPath || selectedShape?.clipPath || 'none',
          borderRadius: getBorderRadius(),
          border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
          filter: getShadowStyle()
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-100"></div>
          <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse animation-delay-300"></div>
          <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping animation-delay-500"></div>
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-pink-300 rounded-full animate-pulse animation-delay-700"></div>
        </div>
        
        {/* Main logo content */}
        <div className="relative z-10 flex items-center space-x-0.5">
          <span 
            className={`font-black ${textSizeClasses[actualCurrentLogo.size]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
            style={{ color: actualCurrentLogo.textColor }}
          >
            {actualCurrentLogo.text.charAt(0)}
          </span>
          
          {actualCurrentLogo.text.length > 1 && (
            <>
              {/* Dynamic connecting element - DNA-like helix */}
              <div className="relative w-1 h-3 sm:h-4 flex flex-col justify-center">
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
              
              <span 
                className={`font-black ${textSizeClasses[actualCurrentLogo.size]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
                style={{ color: actualCurrentLogo.textColor }}
              >
                {actualCurrentLogo.text.charAt(1)}
              </span>
            </>
          )}
        </div>

        {/* Neural network visualization */}
        {actualCurrentLogo.hasNeuralNetwork && (
          <svg 
            className={`absolute inset-0 w-full h-full opacity-${Math.round(actualCurrentLogo.neuralIntensity / 4)} group-hover:opacity-${Math.round(actualCurrentLogo.neuralIntensity / 2)} transition-opacity duration-500`} 
            viewBox="0 0 40 40"
          >
            {/* Synaptic connections */}
            <g className="animate-pulse" style={{animationDuration: '3s'}}>
              <path d="M8 8 Q20 15, 32 8" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
              <path d="M8 32 Q20 25, 32 32" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
              <path d="M8 20 L32 20" stroke="rgba(255,255,255,0.4)" strokeWidth="0.2" fill="none"/>
            </g>
            
            {/* Neural nodes */}
            <g className="animate-pulse" style={{animationDuration: '2s', animationDelay: '0.5s'}}>
              <circle cx="8" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="32" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="8" cy="32" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="32" cy="32" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.9)"/>
            </g>
            
            {/* Enhanced data flow lines */}
            <g className="animate-pulse" style={{animationDuration: '4s', animationDelay: '1s'}}>
              <path d="M5 15 L15 12 L25 18 L35 15" stroke="rgba(0,255,255,0.5)" strokeWidth="0.4" fill="none" strokeDasharray="1,1"/>
              <path d="M5 25 L15 28 L25 22 L35 25" stroke="rgba(255,0,255,0.5)" strokeWidth="0.4" fill="none" strokeDasharray="1,1"/>
            </g>
          </svg>
        )}

        {/* Live pulse indicators */}
        <div className="absolute -top-0.5 -right-0.5 flex space-x-0.5">
          <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
          <div className="w-0.5 h-0.5 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              NewsNerve Logo Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Create, customize, and deploy your perfect logo across the platform
            </p>
          </div>

          {/* Current Logo Display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              🎯 Current Active Logo
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {/* Current Logo Preview */}
              <div className="flex flex-col items-center">
                <div className="mb-3">
                  {renderActualCurrentLogo()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  <div className="font-medium">Active across site</div>
                  <div className="text-xs opacity-75">This is what gets saved to history</div>
                </div>
              </div>
              
              {/* Current Logo Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-64">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Logo Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-medium capitalize">{actualCurrentLogo.type}</span>
                  </div>
                  {actualCurrentLogo.type !== 'image' && actualCurrentLogo.type !== 'code' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Text:</span>
                      <span className="font-medium">"{actualCurrentLogo.text}"</span>
                    </div>
                  )}
                  {actualCurrentLogo.type === 'image' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Image:</span>
                      <span className="font-medium">{actualCurrentLogo.imageUrl ? '✅ Uploaded' : '❌ None'}</span>
                    </div>
                  )}
                  {actualCurrentLogo.type === 'code' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Code:</span>
                      <span className="font-medium">{actualCurrentLogo.customCode ? `${actualCurrentLogo.codeLanguage?.toUpperCase()} Code` : '❌ None'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shape:</span>
                    <span className="font-medium capitalize">{shapes.find(s => s.id === actualCurrentLogo.shape)?.name || 'Rectangle'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Size:</span>
                    <span className="font-medium capitalize">{actualCurrentLogo.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Animation:</span>
                    <span className="font-medium capitalize">{actualCurrentLogo.animation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Neural Net:</span>
                    <span className="font-medium">{actualCurrentLogo.hasNeuralNetwork ? '✅ Enabled' : '❌ Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Border:</span>
                    <span className="font-medium">{(actualCurrentLogo.borderWidth || 0) > 0 ? `${actualCurrentLogo.borderWidth || 0}px` : 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rounded:</span>
                    <span className="font-medium">{(actualCurrentLogo.borderRadius || 0) > 0 ? `${actualCurrentLogo.borderRadius || 0}px` : 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">✅ Active & Deployed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                    <span className="font-medium text-xs">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={editCurrentLogo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                ✏️ Edit Current Logo
              </button>
              <button
                onClick={deployCurrentLogo}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
              >
                🚀 Deploy Logo
              </button>
              <button
                onClick={async () => {
                  const saved = await saveCurrentLogoToHistory();
                  if (saved) {
                    setLastSavedLogoConfig(JSON.stringify(actualCurrentLogo));
                    alert('✅ Active logo saved to history!');
                  } else {
                    alert('ℹ️ This active logo is already in your history.');
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                📸 Save Active to History
              </button>
              <button
                onClick={() => {
                  exportCurrentLogoCode();
                  setActiveTab('create');
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
              >
                💻 Edit as Code
              </button>
            </div>
            
            {/* Deployment Status */}
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 dark:text-green-400">🟢</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Logo is active and deployed across the site
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    All components are synchronized • Auto-saves enabled
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            {[
              { id: 'create', label: '🎨 Create', desc: 'Design & Customize' },
              { id: 'history', label: '📋 History', desc: 'Previous Logos' },
              { id: 'deploy', label: '🚀 Deploy', desc: 'Apply & Export' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Logo Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                {isEditingCurrent ? '🔧 Editing Current Logo' : 'Live Preview'}
              </h3>
              
              {isEditingCurrent && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-blue-600 dark:text-blue-400">🔧</span>
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Editing current logo • Auto-saving changes
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center items-center h-40 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                {isEditingCurrent ? renderCurrentLogo() : renderActualCurrentLogo()}
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {isEditingCurrent ? 
                      `${currentLogo.text} • ${shapes.find(s => s.id === currentLogo.shape)?.name || 'Current'}` :
                      `${actualCurrentLogo.text} • ${shapes.find(s => s.id === actualCurrentLogo.shape)?.name || 'Current'}`
                    }
                  </span>
                </div>
                
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={saveLogo}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {isEditingCurrent ? '✅ Done Editing' : '💾 Apply Logo'}
                  </button>
                  {!isEditingCurrent && (
                    <button
                      onClick={() => {
                        setShowNameDialog(true);
                        setPendingSaveLogo(currentLogo);
                        setLogoName('');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      ✏️ Save with Name
                    </button>
                  )}
                  {isEditingCurrent && (
                    <button
                      onClick={() => {
                        setIsEditingCurrent(false);
                        setCurrentLogo({ ...actualCurrentLogo });
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      ❌ Cancel
                    </button>
                  )}
                  <button
                    onClick={exportToDevice}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    📥 Export PNG
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'create' && (
              <div className="space-y-6">
                {/* Logo Type Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Logo Type</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => updateLogo({ type: 'typography' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currentLogo.type === 'typography'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🔤</div>
                      <div className="text-sm font-medium">Text Logo</div>
                      <div className="text-xs text-gray-500">Typography based</div>
                    </button>
                    
                    <button
                      onClick={() => updateLogo({ type: 'shape' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currentLogo.type === 'shape'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🔷</div>
                      <div className="text-sm font-medium">Shape Logo</div>
                      <div className="text-xs text-gray-500">Geometric shapes</div>
                    </button>
                    
                    <button
                      onClick={() => updateLogo({ type: 'image' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currentLogo.type === 'image'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🖼️</div>
                      <div className="text-sm font-medium">Image Logo</div>
                      <div className="text-xs text-gray-500">Upload image</div>
                    </button>
                    
                    <button
                      onClick={() => updateLogo({ type: 'code' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currentLogo.type === 'code'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">💻</div>
                      <div className="text-sm font-medium">Code Logo</div>
                      <div className="text-xs text-gray-500">Custom SVG/HTML</div>
                    </button>
                  </div>
                </div>

                {/* Image Upload Section */}
                {currentLogo.type === 'image' && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload Image</h3>
                    
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center space-y-2 w-full"
                        >
                          <div className="text-4xl text-gray-400">📁</div>
                          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Click to upload image
                          </div>
                          <div className="text-sm text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </div>
                        </button>
                      </div>
                      
                      {tempImagePreview && (
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img src={tempImagePreview} alt="Preview" className="w-8 h-8 rounded object-cover" />
                            <span className="text-sm text-green-800 dark:text-green-200">Image uploaded successfully</span>
                          </div>
                          <button
                            onClick={() => {
                              setTempImagePreview('');
                              updateLogo({ imageUrl: '', type: 'typography' });
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Code Editor Section */}
                {currentLogo.type === 'code' && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Custom Code</h3>
                    
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <select
                          value={currentLogo.codeLanguage}
                          onChange={(e) => updateLogo({ codeLanguage: e.target.value as any })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        >
                          <option value="svg">SVG</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="react">React</option>
                        </select>
                        
                        <button
                          onClick={exportCurrentLogoCode}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          📤 Export Current
                        </button>
                      </div>
                      
                      <textarea
                        value={currentLogo.customCode || ''}
                        onChange={(e) => updateLogo({ customCode: e.target.value })}
                        placeholder={`Enter your ${currentLogo.codeLanguage?.toUpperCase()} code here...`}
                        className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      />
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Paste your logo code or click "Export Current" to edit existing logo</span>
                        <button
                          onClick={() => updateLogo({ customCode: '', type: 'typography' })}
                          className="text-red-600 hover:text-red-800"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Settings */}
                {(currentLogo.type === 'typography' || currentLogo.type === 'shape') && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Basic Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Logo Text
                        </label>
                        <input
                          type="text"
                          value={currentLogo.text}
                          onChange={(e) => updateLogo({ text: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          maxLength={10}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={currentLogo.textColor}
                          onChange={(e) => updateLogo({ textColor: e.target.value })}
                          className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shape Selection */}
                {(currentLogo.type === 'typography' || currentLogo.type === 'shape') && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shape</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {shapes.map((shape) => (
                        <button
                          key={shape.id}
                          onClick={() => updateLogo({ shape: shape.id, clipPath: shape.clipPath })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            currentLogo.shape === shape.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 mx-auto mb-2 bg-blue-500"
                            style={{ clipPath: shape.clipPath }}
                          ></div>
                          <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                            {shape.name}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {(currentLogo.shape === 'rounded' || currentLogo.shape === 'none') && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">💡</span>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Tip:</strong> Use the "Border Radius" control below to add rounded corners to rectangles!
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {currentLogo.shape === 'custom' && (
                      <div className="mt-4 space-y-3">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">✨ Custom Shape Editor</h4>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CSS clip-path
                          </label>
                          <textarea
                            value={currentLogo.clipPath || ''}
                            onChange={(e) => updateLogo({ clipPath: e.target.value })}
                            placeholder="polygon(50% 0%, 0% 100%, 100% 100%)"
                            className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                            rows={2}
                          />
                          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                            Create custom shapes using CSS clip-path. Visit <a href="https://clippy.surge.sh" target="_blank" className="underline">clippy.surge.sh</a> for a visual editor.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Background & Colors */}
                {currentLogo.type !== 'image' && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Background</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Gradient Presets
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {gradientPresets.map((gradient, index) => (
                          <button
                            key={index}
                            onClick={() => updateLogo({ background: gradient })}
                            className={`w-full h-8 rounded border-2 transition-all ${
                              currentLogo.background === gradient
                                ? 'border-blue-500 scale-105'
                                : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                            }`}
                            style={{ background: gradient }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Custom CSS Gradient
                      </label>
                      <textarea
                        value={currentLogo.background}
                        onChange={(e) => updateLogo({ background: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        rows={2}
                        placeholder="linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"
                      />
                    </div>
                  </div>
                </div>
                )}

                {/* Effects & Animation */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Effects & Animation</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Size
                      </label>
                      <select
                        value={currentLogo.size}
                        onChange={(e) => updateLogo({ size: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="small">Small (32px)</option>
                        <option value="medium">Medium (48px)</option>
                        <option value="large">Large (64px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Animation
                      </label>
                      <select
                        value={currentLogo.animation}
                        onChange={(e) => updateLogo({ animation: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="none">None</option>
                        <option value="pulse">Pulse</option>
                        <option value="glow">Glow</option>
                        <option value="bounce">Bounce</option>
                        <option value="spin">Spin</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Neural Network Effect
                      </label>
                      <button
                        onClick={() => updateLogo({ hasNeuralNetwork: !currentLogo.hasNeuralNetwork })}
                        className={`px-3 py-1 rounded text-sm ${
                          currentLogo.hasNeuralNetwork
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {currentLogo.hasNeuralNetwork ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    
                    {currentLogo.hasNeuralNetwork && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Neural Intensity: {currentLogo.neuralIntensity}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={currentLogo.neuralIntensity}
                          onChange={(e) => updateLogo({ neuralIntensity: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Border & Shadow Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Border & Shadow</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Border Radius: {currentLogo.borderRadius}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={currentLogo.borderRadius}
                        onChange={(e) => updateLogo({ borderRadius: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Border Width: {currentLogo.borderWidth}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={currentLogo.borderWidth}
                        onChange={(e) => updateLogo({ borderWidth: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Border Color
                      </label>
                      <input
                        type="color"
                        value={currentLogo.borderColor}
                        onChange={(e) => updateLogo({ borderColor: e.target.value })}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Shadow Intensity: {currentLogo.shadowIntensity}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={currentLogo.shadowIntensity}
                        onChange={(e) => updateLogo({ shadowIntensity: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Logo History & Versions</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {logoHistory.length} saved versions • Manage and deploy your logo history • Click names to edit
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveCurrentLogoToHistory}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      📸 Quick Save
                    </button>
                    <button
                      onClick={handleSaveWithName}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      ✏️ Save with Name
                    </button>
                    <button
                      onClick={async () => {
                        // Force save without duplicate checking
                        const currentActiveLogo = actualCurrentLogo;
                        const visualData = await convertLogoToVisualFormat(currentActiveLogo);
                        
                        const historyItem: LogoHistory = {
                          id: Date.now().toString(),
                          name: currentActiveLogo.type === 'image' 
                            ? `Image Logo - ${new Date().toLocaleString()}`
                            : `Active Logo - ${new Date().toLocaleString()}`,
                          timestamp: new Date(),
                          config: { ...currentActiveLogo },
                          preview: '',
                          dataUrl: visualData.dataUrl,
                          format: visualData.format,
                          code: visualData.code
                        };

                        const updatedHistory = [historyItem, ...logoHistory].slice(0, 50);
                        setLogoHistory(updatedHistory);
                        localStorage.setItem('newsnerve-logo-history', JSON.stringify(updatedHistory));
                        
                        alert('✅ Logo force saved to history (bypassed duplicate check)!');
                      }}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      🔄 Force Save
                    </button>
                    <button
                      onClick={revertToPreviousLogo}
                      className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      disabled={logoHistory.length === 0}
                    >
                      ↩️ Revert
                    </button>
                  </div>
                </div>
                
                {logoHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="text-6xl mb-4">📅</div>
                    <h4 className="text-xl font-semibold mb-2">No Logo History</h4>
                    <p className="mb-4">Create and save your first logo to start building version history!</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Logo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {logoHistory.map((logo, index) => (
                      <div key={logo.id} className="group flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center space-x-4">
                          {/* Logo Preview */}
                          <div className="w-12 h-12 flex items-center justify-center rounded flex-shrink-0 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600">
                            {logo.dataUrl ? (
                              logo.format === 'png' || logo.format === 'image' ? (
                                <img 
                                  src={logo.dataUrl} 
                                  alt="Logo Thumbnail" 
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    console.log('Image failed to load:', logo.dataUrl);
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : logo.format === 'html' ? (
                                <iframe 
                                  src={logo.dataUrl}
                                  className="w-full h-full border-none rounded pointer-events-none"
                                  style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: '400%', height: '400%' }}
                                  title="Logo Preview"
                                />
                              ) : logo.format === 'svg' ? (
                                <div 
                                  dangerouslySetInnerHTML={{ __html: logo.code || atob(logo.dataUrl.split(',')[1]) }}
                                  className="w-full h-full flex items-center justify-center"
                                />
                              ) : (
                                <div className="text-xs text-gray-500 text-center">
                                  {logo.format.toUpperCase()}
                                </div>
                              )
                            ) : (
                              // Fallback for old history items or failed loads
                              <div 
                                className="w-full h-full flex items-center justify-center text-xs"
                                style={{
                                  background: logo.config.background || 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                  clipPath: logo.config.clipPath || 'none',
                                  color: logo.config.textColor || '#ffffff'
                                }}
                              >
                                {logo.config.type === 'image' ? (
                                  <span>🖼️</span>
                                ) : (
                                  <span className="font-black">
                                    {logo.config.text?.substring(0, 2) || 'NN'}
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Hidden fallback for failed image loads */}
                            <div 
                              className="w-full h-full flex items-center justify-center text-xs hidden"
                              style={{
                                background: logo.config.background || 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                clipPath: logo.config.clipPath || 'none',
                                color: logo.config.textColor || '#ffffff'
                              }}
                            >
                              {logo.config.type === 'image' ? (
                                <span>🖼️</span>
                              ) : (
                                <span className="font-black">
                                  {logo.config.text?.substring(0, 2) || 'NN'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Logo Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {editingHistoryId === logo.id ? (
                                <div className="flex items-center space-x-2 flex-1">
                                  <input
                                    type="text"
                                    value={editingHistoryName}
                                    onChange={(e) => setEditingHistoryName(e.target.value)}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        saveHistoryNameEdit(logo.id);
                                      } else if (e.key === 'Escape') {
                                        cancelEditingHistoryName();
                                      }
                                    }}
                                    onBlur={() => saveHistoryNameEdit(logo.id)}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveHistoryNameEdit(logo.id)}
                                    className="text-green-600 hover:text-green-700 text-sm"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEditingHistoryName}
                                    className="text-red-600 hover:text-red-700 text-sm"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <h4 
                                    className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={() => startEditingHistoryName(logo.id, logo.name)}
                                    title="Click to edit name"
                                  >
                                    {logo.name}
                                  </h4>
                                  <button
                                    onClick={() => startEditingHistoryName(logo.id, logo.name)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edit name"
                                  >
                                    ✏️
                                  </button>
                                </>
                              )}
                              {index === 0 && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                  Latest
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {logo.timestamp.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Format: {logo.format?.toUpperCase() || 'Config'} • Type: {logo.config.type}
                              {logo.config.type === 'typography' && ` • Text: ${logo.config.text}`}
                              {logo.config.type === 'image' && ' • Custom Image'}
                              {logo.config.type === 'code' && ` • ${logo.config.codeLanguage?.toUpperCase()}`}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => loadLogo(logo)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            title="Load this logo for editing"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              updateCurrentActiveLogo(logo.config);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                            title="Deploy this logo to site immediately"
                          >
                            🚀 Deploy
                          </button>
                          <button
                            onClick={() => {
                              // Download the logo in its saved format
                              if (logo.dataUrl) {
                                const link = document.createElement('a');
                                link.href = logo.dataUrl;
                                
                                let filename = `logo-${logo.id}`;
                                let extension = '';
                                
                                switch (logo.format) {
                                  case 'html':
                                    extension = '.html';
                                    break;
                                  case 'png':
                                  case 'image':
                                    extension = '.png';
                                    break;
                                  case 'svg':
                                    extension = '.svg';
                                    break;
                                  case 'css':
                                    extension = '.css';
                                    break;
                                  case 'javascript':
                                  case 'jsx':
                                    extension = '.js';
                                    break;
                                  default:
                                    extension = '.txt';
                                }
                                
                                link.download = filename + extension;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                            title="Download logo file"
                          >
                            💾 Download
                          </button>
                          <button
                            onClick={() => deleteHistoryItem(logo.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                            title="Delete from history"
                          >
                            🗑️ Delete
                          </button>
                          {logo.code && (
                            <button
                              onClick={() => {
                                // Show the actual code in a new window
                                const newWindow = window.open('', '_blank');
                                if (newWindow) {
                                  newWindow.document.write(`
                                    <html>
                                      <head><title>Logo Code - ${logo.name}</title></head>
                                      <body style="font-family: monospace; padding: 20px; background: #1f2937; color: #f9fafb;">
                                        <h3 style="color: #60a5fa;">Logo Code (${logo.format.toUpperCase()})</h3>
                                        <pre style="background: #111827; padding: 20px; border-radius: 8px; overflow: auto; white-space: pre-wrap;">${(logo.code || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                                      </body>
                                    </html>
                                  `);
                                  newWindow.document.close();
                                }
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                              title="View actual code"
                            >
                              👁️ View Code
                            </button>
                          )}
                          <button
                            onClick={() => saveToFavorites(logo)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
                            title="Add to favorites"
                          >
                            ⭐
                          </button>
                          <button
                            onClick={() => {
                              const updatedHistory = logoHistory.filter(h => h.id !== logo.id);
                              setLogoHistory(updatedHistory);
                              localStorage.setItem('newsnerve-logo-history', JSON.stringify(updatedHistory));
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                            title="Delete from history"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Favorites Section */}
                {savedLogos.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      ⭐ Favorite Logos ({savedLogos.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {savedLogos.slice(0, 6).map((logo) => (
                        <div key={logo.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center space-x-2 mb-2">
                            <div 
                              className="w-6 h-6 flex items-center justify-center rounded"
                              style={{
                                background: logo.config.background,
                                clipPath: logo.config.clipPath || 'none'
                              }}
                            >
                              <span 
                                className="font-black text-xs"
                                style={{ color: logo.config.textColor }}
                              >
                                {logo.config.text}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                              {logo.name.replace('Logo ', '')}
                            </span>
                          </div>
                          <button
                            onClick={() => loadLogo(logo)}
                            className="w-full text-xs py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                          >
                            Load
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* View Full History Link */}
                    <div className="mt-4 text-center">
                      <a 
                        href="/admin/logo-history" 
                        className="inline-flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        📅 View Complete Version History
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deploy' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Deploy</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={applyToSite}
                      className="flex items-center justify-center py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 font-medium shadow-lg"
                    >
                      <span className="text-2xl mr-3">🚀</span>
                      <div>
                        <div className="text-lg">Apply to Entire Site</div>
                        <div className="text-sm opacity-90">Update header and all components</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={exportToDevice}
                      className="flex items-center justify-center py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-medium shadow-lg"
                    >
                      <span className="text-2xl mr-3">📥</span>
                      <div>
                        <div className="text-lg">Download PNG</div>
                        <div className="text-sm opacity-90">High-quality 200x200px</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Export Options</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.download = `newsnerve-logo-config-${Date.now()}.json`;
                        link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentLogo, null, 2));
                        link.click();
                      }}
                      className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                    >
                      <div className="text-2xl mb-1">⚙️</div>
                      <div className="text-sm font-medium">Config JSON</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        const svgCode = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style="stop-color:#2563eb"/>
                              <stop offset="50%" style="stop-color:#4338ca"/>
                              <stop offset="100%" style="stop-color:#7c3aed"/>
                            </linearGradient>
                          </defs>
                          <rect width="40" height="40" fill="url(#logoGrad)" style="clip-path: ${currentLogo.clipPath || 'none'}"/>
                          <text x="20" y="26" text-anchor="middle" fill="${currentLogo.textColor}" font-family="Arial, sans-serif" font-weight="bold" font-size="18">${currentLogo.text}</text>
                        </svg>`;
                        const link = document.createElement('a');
                        link.download = `newsnerve-logo-${Date.now()}.svg`;
                        link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgCode);
                        link.click();
                      }}
                      className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                    >
                      <div className="text-2xl mb-1">🎨</div>
                      <div className="text-sm font-medium">SVG Vector</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(currentLogo, null, 2));
                        alert('Logo configuration copied to clipboard!');
                      }}
                      className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                    >
                      <div className="text-2xl mb-1">📋</div>
                      <div className="text-sm font-medium">Copy Config</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        const cssCode = `.newsnerve-logo {
  width: 40px;
  height: 40px;
  background: ${currentLogo.background};
  clip-path: ${currentLogo.clipPath || 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${currentLogo.textColor};
  font-weight: bold;
  font-size: 18px;
}`;
                        navigator.clipboard.writeText(cssCode);
                        alert('CSS code copied to clipboard!');
                      }}
                      className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                    >
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-sm font-medium">CSS Class</div>
                    </button>
                  </div>
                </div>

                {/* Generated Code */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Generated React Component</h3>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {generateLogoCode()}
                    </pre>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Copy and paste this code into your React components
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateLogoCode());
                        alert('Code copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      📋 Copy Code
                    </button>
                  </div>
                </div>

                {/* Deployment Status */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🚀 Deployment Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Header Component:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">✅ Dynamic Logo Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Local Storage:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">💾 Auto-saving enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cross-site Updates:</span>
                      <span className="text-purple-600 dark:text-purple-400 font-medium">🔄 Real-time sync</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name Dialog Modal */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-90vw">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ✏️ Name Your Logo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Give your logo a custom name to easily identify it in your history.
            </p>
            <input
              type="text"
              value={logoName}
              onChange={(e) => setLogoName(e.target.value)}
              placeholder="Enter logo name (e.g., 'Company Header Logo')"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && logoName.trim()) {
                  confirmSaveWithName();
                }
              }}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNameDialog(false);
                  setPendingSaveLogo(null);
                  setLogoName('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveWithName}
                disabled={!logoName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default LogoManager;
