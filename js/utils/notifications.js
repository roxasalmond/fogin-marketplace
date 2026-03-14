/**
 * NOTIFICATION SYSTEM
 * Toast notifications
 */

export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 16px 24px;
    background-color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.4);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

export function showSuccessNotification(message) {
  showNotification(message, 'success');
}

export function showErrorNotification(message) {
  showNotification(message, 'error');
}

export function showInfoNotification(message) {
  showNotification(message, 'info');
}