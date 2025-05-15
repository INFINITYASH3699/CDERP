"use client";

import LargeAnimatedLogo from "@/components/LargeAnimatedLogo";
import styles from "./page.module.css";

export default function LogoDemo() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Connecting Dots ERP</h1>
      <h2 className={styles.subtitle}>Interactive Logo Demo</h2>

      <div className={styles.logoContainer}>
        <LargeAnimatedLogo />
      </div>

      <div className={styles.instructions}>
        <h3>Interactive Features:</h3>
        <ul>
          <li>Hover over the logo to see the 3D tilt effect</li>
          <li>Click the logo to cycle through different animations</li>
          <li>Watch the continuous particle and rotation animations</li>
        </ul>
      </div>

      <div className={styles.footer}>
        <p>© {new Date().getFullYear()} Connecting Dots ERP - All Rights Reserved</p>
        <p>ISO 9001:2015 Certified Co.</p>
      </div>
    </div>
  );
}
