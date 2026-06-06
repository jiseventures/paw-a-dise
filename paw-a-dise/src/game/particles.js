export function createParticleSystem(container) {
  const layer = document.createElement('div');
  layer.className = 'particle-layer';
  container.appendChild(layer);

  function burst({ x, y, color, count = 12, big = false }) {
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('span');
      particle.className = `particle ${big ? 'particle--big' : ''}`;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      const distance = 28 + Math.random() * (big ? 54 : 30);
      particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      particle.style.setProperty('--particle-color', color);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      layer.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    }
  }

  function confetti({ x, y }) {
    burst({ x, y, color: '#FFD166', count: 18, big: true });
    burst({ x, y, color: '#7BFFB2', count: 14, big: true });
    burst({ x, y, color: '#F25DFF', count: 14, big: true });
  }

  function destroy() { layer.remove(); }

  return { burst, confetti, destroy };
}
