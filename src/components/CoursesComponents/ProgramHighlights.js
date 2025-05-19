"use client";

import React, { useState } from "react";
import styles from "@/styles/CoursesComponents/ProgramHighlights.module.css";
import Image from "next/image";

const steps = [
  {
    title: "25+ Assignments",
    description: "Work on 25+ Assignments",
    progress: 25,
    imgSrc: "/DSimages/assignment-icon.avif",
    alt: "A group of individuals poses together, featuring one person holding a green check mark, symbolizing approval or success.",
  },
  {
    title: "Tied-up with 2000+ Companies",
    description:
      "ConnectingDotsERP has tied up with 2000+ Companies to provide Jobs to Many Students.",
    progress: 50,
    imgSrc: "/DSimages/company-icon.avif",
    alt: "A diverse group of individuals gathered in front of a modern building, smiling and engaging with one another.",
  },
  {
    title: "Experience Alteration System",
    description: "A dedicated placement for those who completed the course.",
    progress: 75,
    imgSrc: "/DSimages/Expaltlogo.avif",
    alt: "A man examines a star closely with a magnifying glass, showcasing curiosity and wonder in a celestial context.",
  },
  {
    title: "Job Readiness Program",
    description: "A dedicated placement for those who completed the course.",
    progress: 100,
    imgSrc: "/DSimages/job-readiness-icon.avif",
    alt: "Two hands shaking above a city skyline, symbolizing partnership and collaboration in an urban environment.",
  },
];

const Prgrm = () => {
  const [progress, setProgress] = useState(0);

  const handleMouseEnter = (stepProgress) => {
    setProgress(stepProgress);
  };

  return (
    <div className={styles.containerItDsPrgrm}>
      <h2>PROGRAM HIGHLIGHTS</h2>
      <div className={styles.progressBarItDs}>
        <div
          className={styles.progressItDs}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className={styles.cardsItDs}>
        {steps.map((step, index) => (
          <div
            key={index}
            className={styles.cardItDs}
            onMouseEnter={() => handleMouseEnter(step.progress)}
          >
            <Image
              src={step.imgSrc}
              alt={step.alt}
              className={styles.cardImgItDs}
              width={200}
              height={200}
            />
            <h3>{step.title}</h3>
            <hr />
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prgrm;
