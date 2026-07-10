// Central prefers-reduced-motion check. When the user asks for reduced motion
// we swap GSAP dives/sway/parallax for instant transitions.
const query =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

export function prefersReducedMotion() {
  return !!query?.matches;
}

// Multiply a GSAP duration by 0 when reduced motion is requested, so tweens
// resolve on the next tick (onComplete/onUpdate still fire, state stays sane).
export function motionDuration(seconds) {
  return prefersReducedMotion() ? 0 : seconds;
}
