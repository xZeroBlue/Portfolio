// Animated oscilloscope trace with switch-selectable waveforms,
// a nod to the four-waveform generator from my FPGA coursework.
(function () {
  const canvas = document.getElementById('scope');
  const box = document.querySelector('.sw');
  if (!canvas || !box) return;

  const ctx = canvas.getContext('2d');
  const waves = {
    Sine: t => Math.sin(t),
    Square: t => (Math.sin(t) >= 0 ? 1 : -1),
    Triangle: t => (2 / Math.PI) * Math.asin(Math.sin(t)),
    Sawtooth: t => (((t / Math.PI) % 2) + 2) % 2 - 1
  };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 'Sine';
  let phase = 0;

  for (const name in waves) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = name;
    b.setAttribute('aria-pressed', String(name === current));
    b.addEventListener('click', () => {
      current = name;
      box.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
      canvas.setAttribute('aria-label', 'Oscilloscope trace of a ' + name.toLowerCase() + ' wave');
      if (still) draw();
    });
    box.appendChild(b);
  }

  function resize() {
    const d = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * d;
    canvas.height = canvas.clientHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    draw();
  }

  function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // graticule
    ctx.strokeStyle = 'rgba(163,187,176,.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 10; i++) { ctx.moveTo(w * i / 10, 0); ctx.lineTo(w * i / 10, h); }
    for (let j = 1; j < 6; j++) { ctx.moveTo(0, h * j / 6); ctx.lineTo(w, h * j / 6); }
    ctx.stroke();

    // trace
    ctx.strokeStyle = '#ffc46b';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#ffc46b';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let p = 0; p <= w; p += 2) {
      const y = h / 2 - waves[current](p / w * Math.PI * 6 + phase) * h * 0.34;
      if (p) ctx.lineTo(p, y); else ctx.moveTo(p, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function loop() { phase -= 0.035; draw(); requestAnimationFrame(loop); }

  window.addEventListener('resize', resize);
  resize();
  if (!still) loop();
})();
