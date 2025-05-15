"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import styles from "@/styles/AnimatedLogo2.module.css";

const AnimatedLogo2 = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // References to DOM elements for GSAP animations
  const containerRef = useRef(null);
  const outerLayerRef = useRef(null);
  const middleLayerRef = useRef(null);
  const innerLayerRef = useRef(null);
  const centerLayerRef = useRef(null);

  // Init GSAP animation for floating center arrow on mount
  useEffect(() => {
    if (centerLayerRef.current) {
      // Create floating animation for center arrow
      gsap.to(centerLayerRef.current, {
        y: -10,
        duration: 1.5,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true
      });
    }
  }, []);

  // Handle logo click with custom GSAP animations
  const handleClick = () => {
    if (!isClicked && containerRef.current) {
      setIsClicked(true);

      // Create 3D perspective tilt effect
      gsap.to(containerRef.current, {
        rotationY: 15,
        rotationX: -10,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(containerRef.current, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.3)"
          });
        }
      });

      // Create pulse for center arrow
      gsap.to(centerLayerRef.current, {
        scale: 1.3,
        filter: "brightness(1.5) drop-shadow(0 0 15px rgba(44, 167, 239, 0.7))",
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(centerLayerRef.current, {
            scale: 1,
            filter: "brightness(1) drop-shadow(0 0 10px rgba(44, 167, 239, 0.3))",
            duration: 0.6,
            ease: "elastic.out(1, 0.3)"
          });
        }
      });

      // Reset clicked state after animations complete
      setTimeout(() => {
        setIsClicked(false);
      }, 1000);
    }
  };

  // Handle 3D tilt effect on mouse move
  const handleMouseMove = (e) => {
    if (isHovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Calculate tilt based on mouse position
      const tiltX = ((mouseY - centerY) / (rect.height / 2)) * 10;
      const tiltY = ((mouseX - centerX) / (rect.width / 2)) * 10;

      // Apply tilt with GSAP
      gsap.to(containerRef.current, {
        rotationX: -tiltX,
        rotationY: tiltY,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  // Reset tilt on mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.logoContainer} ${isHovered ? styles.hovered : ''} ${isClicked ? styles.clicked : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Outer rotating circle */}
      <div ref={outerLayerRef} className={`${styles.logoLayer} ${styles.outerLayer}`}>
        <Image
          src="/Navbar/1.png"
          alt="Outer Circle"
          width={300}
          height={300}
          priority={true}
          className={styles.outerImage}
        />
      </div>

      {/* Middle rotating circle */}
      <div ref={middleLayerRef} className={`${styles.logoLayer} ${styles.middleLayer}`}>
        <Image
          src="/Navbar/2.png"
          alt="Middle Circle"
          width={240}
          height={240}
          priority={true}
          className={styles.middleImage}
        />
      </div>

      {/* Inner rotating circle */}
      <div ref={innerLayerRef} className={`${styles.logoLayer} ${styles.innerLayer}`}>
        <Image
          src="/Navbar/3.png"
          alt="Inner Circle"
          width={180}
          height={180}
          priority={true}
          className={styles.innerImage}
        />
      </div>

      {/* Center arrow */}
      <div ref={centerLayerRef} className={`${styles.logoLayer} ${styles.centerLayer}`}>
        <Image
          src="/Navbar/4.png"
          alt="Center Arrow"
          width={120}
          height={120}
          priority={true}
          className={styles.centerImage}
        />
      </div>
    </div>
  );
};

export default AnimatedLogo2;
