import { useEffect, useRef } from "react";

function makeEmber(canvas, init = false) {
  return {
    x: Math.random() * canvas.width,
    y: init ? Math.random() * canvas.height : canvas.height + 5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(0.25 + Math.random() * 0.65),
    life: init ? Math.random() : 1,
    size: 0.6 + Math.random() * 1.4,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.012 + Math.random() * 0.022,
  };
}

export default function EmberCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let animId;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const embers = Array.from({ length: 38 }, () => makeEmber(canvas, true));

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life -= 0.0022;
        e.wobble += e.wobbleSpeed;
        e.x += e.vx + Math.sin(e.wobble) * 0.22;
        e.y += e.vy;

        if (e.life <= 0 || e.y < -10) {
          embers[i] = makeEmber(canvas);
          continue;
        }

        // Fade in quickly, hold, fade out slowly
        const alpha = Math.min(e.life * 2.5, 1) * Math.min((1 - e.life) * 4, 1);
        const r = e.size * 2.8;
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
        g.addColorStop(0,   `rgba(255,200,65,${(alpha * 0.88).toFixed(3)})`);
        g.addColorStop(0.45,`rgba(255,110,15,${(alpha * 0.38).toFixed(3)})`);
        g.addColorStop(1,   "rgba(140,25,0,0)");

        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      animId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="hero__embers" />;
}
