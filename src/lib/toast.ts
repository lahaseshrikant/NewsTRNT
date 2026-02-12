// Toast notification utility
export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  if (typeof window === 'undefined') return;
  
  // Remove any existing toast
  const existingToast = document.querySelector('.custom-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'custom-toast fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 max-w-sm';
  
  // Style based on type
  const styles = {
    success: 'bg-green-700 text-white',
    error: 'bg-vermillion text-white',
    warning: 'bg-gold text-white', 
    info: 'bg-ink text-white'
  };
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.className += ` ${styles[type]}`;
  toast.innerHTML = `
    <span class="text-lg">${icons[type]}</span>
    <span class="flex-1">${message}</span>
    <button class="ml-2 opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">✕</button>
  `;
  
  // Add slide-in animation
  toast.style.transform = 'translateX(100%)';
  toast.style.transition = 'transform 0.3s ease-out';
  
  document.body.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }
  }, 5000);
};

// Export for use in components
export default showToast;