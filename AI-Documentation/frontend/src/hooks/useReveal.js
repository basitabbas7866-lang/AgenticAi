import { useEffect, useRef } from "react";

/**
 * Custom hook for Intersection Observer based scroll-reveal.
 * Returns a ref to attach to the element you want to reveal.
 */
export function useReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * Batch observer — observes multiple children inside a container.
 * Returns a ref to attach to the parent container.
 */
export function useRevealChildren(selector = ".lp-reveal", options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px", ...options }
    );

    const children = container.querySelectorAll(selector);
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [selector]);

  return containerRef;
}
