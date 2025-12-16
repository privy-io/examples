/**
 * Show a toast notification
 */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = document.createElement('span');
  icon.innerHTML = type === 'success' 
    ? '✓' 
    : '✕';
  icon.style.fontSize = '1.25rem';
  icon.style.fontWeight = 'bold';
  icon.style.color = type === 'success' ? '#10b981' : '#ef4444';
  
  const text = document.createElement('span');
  text.textContent = message;
  
  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    toast.style.transition = 'all 0.3s ease-out';
    
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 5000);
}

