// ============================================================
// EcoTrack — particles.js (Earth-from-space particle system)
// ============================================================

(function() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const PARTICLE_COUNT = 55;
  const COLORS = [
    'rgba(0, 255, 136, 0.7)',
    'rgba(0, 212, 255, 0.7)',
    'rgba(123, 47, 255, 0.5)',
    'rgba(255, 215, 0, 0.4)',
    'rgba(0, 200, 255, 0.5)',
  ];

  function createParticle() {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = 1.5 + Math.random() * 3.5;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const drift = (Math.random() - 0.5) * 120;
    const duration = 12 + Math.random() * 18;
    const delay = Math.random() * 15;

    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${Math.random() * 100}%;
      --drift: ${drift}px;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;
    container.appendChild(el);
    return el;
  }

  // Create initial particles
  for (let i = 0; i < PARTICLE_COUNT; i++) createParticle();

  // Add orbiting "satellite" dots around viewport center
  const ORBIT_COUNT = 4;
  for (let i = 0; i < ORBIT_COUNT; i++) {
    const orbit = document.createElement('div');
    const angle = (i / ORBIT_COUNT) * 360;
    const radius = 200 + i * 80;
    const size = 2 + Math.random() * 2;
    orbit.style.cssText = `
      position: fixed;
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      background: rgba(0,255,136,0.6);
      box-shadow: 0 0 8px rgba(0,255,136,0.6);
      top: 50%; left: 50%;
      transform-origin: -${radius}px 0;
      animation: orbitParticle ${20 + i * 8}s linear infinite;
      animation-delay: ${-i * 5}s;
      pointer-events: none;
      z-index: 0;
    `;
    container.appendChild(orbit);
  }

  // Inject orbit keyframes dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes orbitParticle {
      from { transform: rotate(0deg) translateX(var(--orbit-r, 200px)) rotate(0deg); opacity: 0.4; }
      50%  { opacity: 1; }
      to   { transform: rotate(360deg) translateX(var(--orbit-r, 200px)) rotate(-360deg); opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);
})();
