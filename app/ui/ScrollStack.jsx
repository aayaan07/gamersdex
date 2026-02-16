"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollStack.css";

gsap.registerPlugin(ScrollTrigger);

export const ScrollStackItem = ({ children, className = "" }) => (
  <div className={`scroll-stack-card ${className}`.trim()}>{children}</div>
);

const ScrollStack = ({
  children,
  className = "",
  fadeInOnScroll = false,
  scaleWhileStacking = true,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = gsap.utils.toArray(".scroll-stack-card", container);
    if (!cards.length) return;

    const triggers = [];

    cards.forEach((card, i) => {
      const stackOffset = i * 30; // each card stops 30px lower than the previous

      // Pin each card when it reaches its stacked position
      const st = ScrollTrigger.create({
        trigger: card,
        start: `top ${80 + stackOffset}px`,
        end: `bottom ${80 + stackOffset}px`,
        endTrigger: container,
        pin: true,
        pinSpacing: i === cards.length - 1, // only last card adds spacing
        scrub: true,
      });
      triggers.push(st);

      // Scale down cards as the next card stacks on top
      if (scaleWhileStacking && i < cards.length - 1) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: `top ${80 + stackOffset}px`,
            scrub: true,
          },
        });

        tl.to(card, {
          scale: 1 - (cards.length - 1 - i) * 0.05,
          borderRadius: "20px",
          duration: 1,
          ease: "none",
        });

        triggers.push(tl.scrollTrigger);
      }

      // Fade in effect for each card
      if (fadeInOnScroll) {
        const fadeTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "top center",
            scrub: true,
          },
        });

        fadeTl.fromTo(
          card,
          { opacity: 0, y: 100 },
          { opacity: 1, y: 0, duration: 1, ease: "none" }
        );

        triggers.push(fadeTl.scrollTrigger);
      }
    });

    return () => {
      triggers.forEach((st) => st?.kill());
      ScrollTrigger.refresh();
    };
  }, [children, fadeInOnScroll, scaleWhileStacking]);

  return (
    <div
      className={`scroll-stack-container ${className}`.trim()}
      ref={containerRef}
    >
      {children}
    </div>
  );
};

export default ScrollStack;
