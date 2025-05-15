"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import styles from "@/styles/LargeAnimatedLogo.module.css";

const LargeAnimatedLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  // References to DOM elements for GSAP animations
  const containerRef = useRef(null);
  const outerLayerRef = useRef(null);
  const middleLayerRef = useRef(null);
  const innerLayerRef = useRef(null);
  const centerLayerRef = useRef(null);
  const particlesRef = useRef(null);

  // Initialize animations on component mount
  useEffect(() => {
    // Initial animation sequence
    if (containerRef.current) {
      // Create intro animation
      gsap.fromTo(
        containerRef.current,
        { scale: 0.5, opacity: 0, rotationY: 90 },
        {
          scale: 1,
          opacity: 1,
          rotationY: 0,
          duration: 1.5,
          ease: "power3.out",
          onComplete: () => {
            // Start animations for each layer
            animateLogoLayers();
          }
        }
      );
    }
  }, []);

  // Start the continuous animations for the logo layers
  const animateLogoLayers = () => {
    // Create floating animation for center arrow
    if (centerLayerRef.current) {
      gsap.to(centerLayerRef.current, {
        y: -15,
        duration: 2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true
      });
    }

    // Create subtle pulse for the entire container
    gsap.to(containerRef.current, {
      scale: 1.02,
      duration: 3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    // Create subtle wobble for particles
    if (particlesRef.current) {
      gsap.to(particlesRef.current, {
        rotation: 5,
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    }
  };

  // Advanced click sequence with multiple stages
  const handleClick = () => {
    if (!isClicked) {
      setIsClicked(true);

      // Cycle through different animation stages on click
      const nextStage = (animationStage + 1) % 3;
      setAnimationStage(nextStage);

      // Different animations based on the stage
      switch (nextStage) {
        case 0:
          // 3D flip effect
          gsap.to(containerRef.current, {
            rotationY: 360,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(containerRef.current, { rotationY: 0 });
              setIsClicked(false);
            }
          });
          break;

        case 1:
          // Explosion effect - parts separate then come back together
          gsap.to([outerLayerRef.current, middleLayerRef.current, innerLayerRef.current], {
            scale: (i) => 1.2 + (i * 0.2),
            opacity: 0.7,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.1,
            onComplete: () => {
              gsap.to([outerLayerRef.current, middleLayerRef.current, innerLayerRef.current], {
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: "elastic.out(1, 0.5)",
                stagger: 0.1,
                onComplete: () => setIsClicked(false)
              });
            }
          });

          // Special effect for center arrow
          gsap.to(centerLayerRef.current, {
            scale: 1.8,
            rotation: 360,
            filter: "brightness(1.8) drop-shadow(0 0 25px rgba(44, 167, 239, 0.9))",
            duration: 0.7,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(centerLayerRef.current, {
                scale: 1,
                filter: "brightness(1) drop-shadow(0 0 10px rgba(44, 167, 239, 0.3))",
                duration: 1,
                ease: "elastic.out(1, 0.5)"
              });
            }
          });
          break;

        case 2:
          // 3D perspective tilt sequence
          const timeline = gsap.timeline({
            onComplete: () => setIsClicked(false)
          });

          timeline
            .to(containerRef.current, {
              rotationX: 30,
              rotationY: -20,
              duration: 0.7,
              ease: "power2.inOut"
            })
            .to(containerRef.current, {
              rotationX: -30,
              rotationY: 20,
              duration: 0.7,
              ease: "power2.inOut"
            })
            .to(containerRef.current, {
              rotationX: 0,
              rotationY: 0,
              duration: 1,
              ease: "elastic.out(1, 0.5)"
            });
          break;
      }
    }
  };

  // Handle 3D tilt effect on mouse move
  const handleMouseMove = (e) => {
    if (isHovered && containerRef.current && !isClicked) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Calculate tilt based on mouse position
      const tiltX = ((mouseY - centerY) / (rect.height / 2)) * 15;
      const tiltY = ((mouseX - centerX) / (rect.width / 2)) * 15;

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
    if (containerRef.current && !isClicked) {
      gsap.to(containerRef.current, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.7,
        ease: "power2.out"
      });
    }
  };

  // Create particles for background effect
  const renderParticles = () => {
    const particleCount = 15;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 3 + 2;

      particles.push(
        <div
          key={i}
          className={styles.particle}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`
          }}
        />
      );
    }

    return particles;
  };

  return (
    <div className={styles.logoWrapper}>
      <div
        ref={containerRef}
        className={`${styles.logoContainer} ${isHovered ? styles.hovered : ''} ${isClicked ? styles.clicked : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {/* Particle effects */}
        <div ref={particlesRef} className={styles.particles}>
          {renderParticles()}
        </div>

        {/* Outer rotating circle */}
        <div ref={outerLayerRef} className={`${styles.logoLayer} ${styles.outerLayer}`}>
          <Image
            src="/Navbar/1.png"
            alt="Outer Circle"
            width={500}
            height={500}
            priority={true}
            className={styles.outerImage}
          />
        </div>

        {/* Middle rotating circle */}
        <div ref={middleLayerRef} className={`${styles.logoLayer} ${styles.middleLayer}`}>
          <Image
            src="/Navbar/2.png"
            alt="Middle Circle"
            width={400}
            height={400}
            priority={true}
            className={styles.middleImage}
          />
        </div>

        {/* Inner rotating circle */}
        <div ref={innerLayerRef} className={`${styles.logoLayer} ${styles.innerLayer}`}>
          <Image
            src="/Navbar/3.png"
            alt="Inner Circle"
            width={300}
            height={300}
            priority={true}
            className={styles.innerImage}
          />
        </div>

        {/* Center arrow */}
        <div ref={centerLayerRef} className={`${styles.logoLayer} ${styles.centerLayer}`}>
          <Image
            src="/Navbar/4.png"
            alt="Center Arrow"
            width={200}
            height={200}
            priority={true}
            className={styles.centerImage}
          />
        </div>

        {/* Light glow effect */}
        <div className={styles.glow}></div>
      </div>

      {/* Interactive label */}
      <div className={styles.interactiveLabel}>
        Click to see different animations
      </div>
    </div>
  );
};

export default LargeAnimatedLogo;
