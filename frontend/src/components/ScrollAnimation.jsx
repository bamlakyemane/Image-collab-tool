// frontend/src/components/ScrollAnimation.jsx

import React from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const ScrollAnimation = ({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold });

  const getAnimationStyles = () => {
    const baseStyles = {
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      transitionDelay: `${delay}ms`,
      opacity: isVisible ? 1 : 0,
    };

    switch (animation) {
      case "fade-up":
        return {
          ...baseStyles,
          transform: isVisible ? "translateY(0)" : "translateY(40px)",
        };
      case "fade-down":
        return {
          ...baseStyles,
          transform: isVisible ? "translateY(0)" : "translateY(-40px)",
        };
      case "fade-left":
        return {
          ...baseStyles,
          transform: isVisible ? "translateX(0)" : "translateX(40px)",
        };
      case "fade-right":
        return {
          ...baseStyles,
          transform: isVisible ? "translateX(0)" : "translateX(-40px)",
        };
      case "zoom-in":
        return {
          ...baseStyles,
          transform: isVisible ? "scale(1)" : "scale(0.9)",
        };
      case "fade":
      default:
        return baseStyles;
    }
  };

  return (
    <div ref={ref} style={getAnimationStyles()}>
      {children}
    </div>
  );
};

export default ScrollAnimation;
