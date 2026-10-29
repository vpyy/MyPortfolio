export default function initBadge() {
  const hanger         = document.getElementById("hanger");
  const badgeWrapper   = document.getElementById("badge-wrapper");
  const strapPath      = document.getElementById("strap-path");
  const strapHighlight = document.getElementById("strap-highlight");
  if (!hanger || !badgeWrapper) return;

  /* ── Physics ────────────────────────────────────────────────────────── */
  let angle    = 0;
  let velocity = 0;

  /* ── Drag state ─────────────────────────────────────────────────────── */
  let dragging      = false;
  let pointerMoved  = false;
  let suppressClick = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let previousAngle = 0;
  let previousTime  = 0;

  const MAX_ANGLE = 55;
  const SPRING    = 0.035;
  const DAMPING   = 0.965;

  function toggleCollapsed() {
    const collapsed = badgeWrapper.classList.toggle("collapsed");
    hanger.setAttribute("aria-expanded", String(!collapsed));
  }

  /* SVG strap geometry (viewBox 0 0 28 100) */
  const CX     = 14;
  const STRAP_H = 95;

  /* ── Render ─────────────────────────────────────────────────────────── */
  function setStrapPath(el, cx) {
    if (!el) return;
    el.setAttribute(
      "d",
      `M ${CX} 0 Q ${cx.toFixed(2)} ${(STRAP_H * 0.48).toFixed(1)} ${CX} ${STRAP_H}`
    );
  }

  function render() {
    hanger.style.setProperty("--angle", `${angle}deg`);

    /* Control-point shifts opposite to swing → top of strap looks anchored */
    const controlX = CX - angle * 0.20;
    setStrapPath(strapPath,      controlX);
    setStrapPath(strapHighlight, controlX);
  }

  /* ── Scroll shake: very gentle nudge ───────────────────────────────── */
  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    if (dragging) return;
    const delta   = window.scrollY - lastScrollY;
    lastScrollY   = window.scrollY;
    velocity     += delta * 0.004;                      // tiny impulse
    velocity      = Math.max(-0.9, Math.min(0.9, velocity)); // tight cap
  }, { passive: true });

  /* ── Drag ───────────────────────────────────────────────────────────── */
  hanger.addEventListener("pointerdown", (e) => {
    dragging      = true;
    pointerMoved  = false;
    suppressClick = false;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    hanger.classList.add("dragging");
    hanger.setPointerCapture(e.pointerId);

    const r      = hanger.getBoundingClientRect();
    const pivotX = r.left + r.width / 2;
    const pivotY = r.top;

    previousAngle = Math.atan2(e.clientX - pivotX, e.clientY - pivotY) * (180 / Math.PI);
    previousTime  = performance.now();
    velocity      = 0;
  });

  hanger.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    if (Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY) > 6) {
      pointerMoved = true;
    }

    const r       = hanger.getBoundingClientRect();
    const pivotX  = r.left + r.width / 2;
    const pivotY  = r.top;
    const current = Math.atan2(e.clientX - pivotX, e.clientY - pivotY) * (180 / Math.PI);

    const delta   = current - previousAngle;
    const now     = performance.now();
    const elapsed = Math.max(now - previousTime, 1);

    angle         = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle - delta));
    velocity      = (delta / elapsed) * 16;

    previousAngle = current;
    previousTime  = now;
    render();
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    suppressClick = pointerMoved;
    hanger.classList.remove("dragging");
  };

  hanger.addEventListener("pointerup",     release);
  hanger.addEventListener("pointercancel", release);
  hanger.addEventListener("click", (e) => {
    if (suppressClick) {
      suppressClick = false;
      e.preventDefault();
      return;
    }
    toggleCollapsed();
  });
  hanger.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    toggleCollapsed();
  });

  /* ── Spring loop ────────────────────────────────────────────────────── */
  function animate() {
    if (!dragging) {
      velocity += -angle * SPRING;
      velocity *= DAMPING;
      angle    += velocity;

      if (Math.abs(angle) < 0.02 && Math.abs(velocity) < 0.02) {
        angle = velocity = 0;
      }
      render();
    }
    requestAnimationFrame(animate);
  }

  render();
  requestAnimationFrame(animate);
}
