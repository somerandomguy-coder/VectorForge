// VectorForge Main Bootstrapper
console.log('VectorForge initializing...');

// Basic boot test
document.addEventListener('DOMContentLoaded', () => {
  const statusText = document.getElementById('hardwareStatusText');
  if (statusText) {
    statusText.textContent = 'WebGPU Studio Initialized';
  }
});
