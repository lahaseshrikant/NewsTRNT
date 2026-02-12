'use client';

import { useState } from 'react';
import { 
  ShareIcon, 
  ClipboardIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline';

interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
  className?: string;
  variant?: 'button' | 'icon';
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  url, 
  description = '', 
  className = '',
  variant = 'button'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description,
    url: url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleNativeShare}
          className={`p-2 text-stone hover:text-vermillion dark:text-stone dark:hover:text-vermillion transition-colors ${className}`}
          title="Share article"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
        
        {isOpen && !navigator.share && (
          <div className="absolute right-0 mt-2 w-48 bg-paper dark:bg-ink rounded-lg shadow-lg border dark:border-ash/20 py-2 z-50">
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 text-left text-sm text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-ink/80 flex items-center"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <ClipboardIcon className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            
            {Object.entries(shareUrls).map(([platform, shareUrl]) => (
              <a
                key={platform}
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 text-left text-sm text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-ink/80 capitalize"
                onClick={() => setIsOpen(false)}
              >
                Share on {platform}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`inline-flex items-center px-4 py-2 border border-ash dark:border-ash/30 rounded-md shadow-sm bg-paper dark:bg-ink text-sm font-medium text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-ink/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vermillion ${className}`}
      >
        <ShareIcon className="w-4 h-4 mr-2" />
        Share
      </button>
      
      {isOpen && !navigator.share && (
        <div className="absolute right-0 mt-2 w-48 bg-paper dark:bg-ink rounded-lg shadow-lg border dark:border-ash/20 py-2 z-50">
          <button
            onClick={copyToClipboard}
            className="w-full px-4 py-2 text-left text-sm text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-ink/80 flex items-center"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <ClipboardIcon className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          
          {Object.entries(shareUrls).map(([platform, shareUrl]) => (
            <a
              key={platform}
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 capitalize"
              onClick={() => setIsOpen(false)}
            >
              Share on {platform}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShareButton;
