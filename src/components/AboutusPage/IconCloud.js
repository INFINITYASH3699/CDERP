import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/AboutPage/IconCloud.module.css";

const slugs = [
  "typescript",
  "javascript",
  "dart",
  "java",
  "react",
  "flutter",
  "android",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "androidstudio",
  "sonarqube",
  "figma",
  "SAP",
  "mysql",
  "mongodb",
];

export default function IconCloud() {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const animationRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  const rotationZ = useRef(0); // Added Z-axis rotation
  const baseSpeedX = 0.02; // Speed for X-axis
  const baseSpeedY = -0.05; // Negative for left-to-right rotation (changed direction)
  const baseSpeedZ = 0.01; // Speed for Z-axis
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const currentRotationX = useRef(0);
  const currentRotationY = useRef(0);
  const currentRotationZ = useRef(0); // Added Z-axis rotation tracking
  const iconsRefs = useRef([]);
  
  const images = slugs.map((slug) => `https://cdn.simpleicons.org/${slug}`);

  // Distribute icons on the globe surface
  useEffect(() => {
    if (!globeRef.current) return;

    const icons = iconsRefs.current.filter(Boolean);
    const total = icons.length;
    const radius = 200; // Globe radius

    // Use Fibonacci sphere algorithm for even distribution
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    icons.forEach((icon, i) => {
      // Calculate position on sphere using golden ratio
      const y = 1 - (i / (total - 1)) * 2; // y goes from 1 to -1
      const radius_at_y = Math.sqrt(1 - y * y); // radius at y position
      const theta = phi * i; // Golden angle increment

      const x = Math.cos(theta) * radius_at_y;
      const z = Math.sin(theta) * radius_at_y;

      // Store original coordinates for animation reference
      icon.dataset.x = x;
      icon.dataset.y = y;
      icon.dataset.z = z;

      // Set initial position
      updateIconPosition(icon, x, y, z, radius);
    });
  }, []);

  // Function to update icon position and appearance based on 3D coordinates
  const updateIconPosition = (icon, x, y, z, radius) => {
    if (!icon) return;

    // 3D position
    icon.style.transform = `translate3d(${x * radius}px, ${y * radius}px, ${
      z * radius
    }px)`;

    // Determine if icon is on front or back of globe
    const isFront = z > 0;
    const opacity = isFront ? 0.95 : 0.5;
    const scale = isFront ? 1 : 0.85;

    // Apply visual effects based on position
    icon.style.opacity = opacity;
    icon.style.scale = scale;
    icon.style.zIndex = Math.round(z * 100 + 100); // Higher z-index for front icons

    // Apply dynamic shadow based on depth
    const shadowBlur = isFront ? 10 : 5;
    const shadowOpacity = isFront ? 0.2 : 0.1;
    icon.style.boxShadow = `0 ${
      isFront ? 4 : 2
    }px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})`;
  };

  // Animation loop for continuous rotation and updates
  useEffect(() => {
    if (!globeRef.current) return;

    let lastTime = 0;
    const animate = (time) => {
      if (!globeRef.current) return;
      const delta = time - lastTime;
      lastTime = time;

      // Apply auto-rotation if not dragging
      if (!isDragging) {
        // Smooth damping for mouse interaction
        rotationX.current += (mouseY.current - rotationX.current) * 0.05;
        rotationY.current += (mouseX.current - rotationY.current) * 0.05;
      }

      // Calculate final rotation values with multi-axis rotation
      let finalRotationX, finalRotationY, finalRotationZ;
      
      if (isSpinning) {
        // Fast multi-directional spinning animation
        finalRotationX = time * 0.04;
        finalRotationY = time * -0.06; // Reverse direction
        finalRotationZ = time * 0.03;
      } else {
        // Normal rotation with automatic motion on all axes
        finalRotationX = currentRotationX.current + rotationX.current * 10 + 
                         (isDragging ? 0 : time * baseSpeedX);
        finalRotationY = currentRotationY.current + rotationY.current * 10 + 
                         (isDragging ? 0 : time * baseSpeedY); // Negative for left-to-right
        finalRotationZ = currentRotationZ.current + 
                         (isDragging ? 0 : time * baseSpeedZ);
      }

      // Apply full 3D rotation to globe
      globeRef.current.style.transform = `rotateX(${finalRotationX}deg) rotateY(${finalRotationY}deg) rotateZ(${finalRotationZ}deg)`;

      // Add subtle oscillation to globe for "floating" effect
      if (!isDragging && !isSpinning) {
        const floatOffset = Math.sin(time * 0.001) * 5;
        globeRef.current.style.transform += ` translateY(${floatOffset}px)`;
      }

      // Update each icon's appearance based on its current position
      iconsRefs.current.forEach((icon) => {
        if (!icon) return;

        // Get original position data
        const x = parseFloat(icon.dataset.x);
        const y = parseFloat(icon.dataset.y);
        const z = parseFloat(icon.dataset.z);

        // Calculate new position after globe rotation with all 3 axes
        // Convert degrees to radians
        const radX = (finalRotationX * Math.PI) / 180;
        const radY = (finalRotationY * Math.PI) / 180;
        const radZ = (finalRotationZ * Math.PI) / 180;

        // Trig values
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const cosZ = Math.cos(radZ);
        const sinZ = Math.sin(radZ);

        // Apply full 3D rotation matrix transformation
        // First rotate around X
        let x1 = x;
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;
        
        // Then rotate around Y
        let x2 = x1 * cosY + z1 * sinY;
        let y2 = y1;
        let z2 = -x1 * sinY + z1 * cosY;
        
        // Finally rotate around Z
        let newX = x2 * cosZ - y2 * sinZ;
        let newY = x2 * sinZ + y2 * cosZ;
        let newZ = z2;

        // Update icon's appearance based on new position
        updateIconPosition(icon, newX, newY, newZ, 200);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDragging, isSpinning]);

  // Handle mouse/touch interaction
  const handleMouseMove = (e) => {
    if (isSpinning) return;

    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (isDragging) {
      // Calculate rotation based on drag distance
      const dragX = (clientX - dragStartX.current) * 0.5;
      const dragY = (clientY - dragStartY.current) * 0.5;

      currentRotationY.current += dragX;
      currentRotationX.current -= dragY;
      
      // Add some Z rotation based on diagonal movement for more natural feel
      const dragDiagonal = (dragX + dragY) * 0.2;
      currentRotationZ.current += dragDiagonal;

      // Update drag start position
      dragStartX.current = clientX;
      dragStartY.current = clientY;
    } else {
      // Passive movement based on mouse position relative to center
      mouseX.current = (clientX - centerX) / (rect.width / 2);
      mouseY.current = (clientY - centerY) / (rect.height / 2);
    }
  };

  // Handle drag start
  const handleDragStart = (e) => {
    if (isSpinning) return;

    setIsDragging(true);
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    dragStartX.current = clientX;
    dragStartY.current = clientY;

    // Add global event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);

    // Remove global event listeners
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("touchmove", handleMouseMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);
  };

  // Trigger spinning animation
  const handleGlobeClick = (e) => {
    // Prevent click event if we were just dragging
    if (isDragging) return;

    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 3000);
  };

  useEffect(() => {
    // Add mouse move listener for passive interaction
    containerRef.current.addEventListener("mousemove", handleMouseMove);
    containerRef.current.addEventListener("touchmove", handleMouseMove);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
        containerRef.current.removeEventListener("touchmove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div className={styles.cloudContainer} ref={containerRef}>
      {/* Globe grid visualization */}
      <div className={styles.globeGrid}>
        <div className={styles.globeLatitude}></div>
        <div className={styles.globeLatitude}></div>
        <div className={styles.globeLatitude}></div>
        <div className={styles.globeLongitude}></div>
        <div className={styles.globeLongitude}></div>
        <div className={styles.globeLongitude}></div>
      </div>

      <div
        className={`${styles.globe} ${isSpinning ? styles.spinning : ""} ${
          isDragging ? styles.dragging : ""
        }`}
        ref={globeRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={handleGlobeClick}
      >
        {images.map((src, index) => (
          <div
            key={slugs[index]}
            className={styles.iconContainer}
            ref={(el) => (iconsRefs.current[index] = el)}
            data-technology={slugs[index]}
          >
            <div className={styles.iconHalo}></div>
            <div className={styles.iconWrapper}>
              <img src={src} alt={slugs[index]} className={styles.icon} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}