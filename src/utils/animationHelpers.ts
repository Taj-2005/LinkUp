export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getAnimationScale(): number {
  if (typeof window === "undefined") return 1;

  const width = window.innerWidth;

  if (width <= 480) return 0.67;
  if (width <= 1024) return 0.83;
  return 1;
}

export function useReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches;
}

export function getAnimationDuration(baseDuration: number = 1): number {
  if (typeof window === "undefined") return baseDuration;

  const width = window.innerWidth;

  if (width <= 480) return baseDuration * 0.9;
  return baseDuration;
}
