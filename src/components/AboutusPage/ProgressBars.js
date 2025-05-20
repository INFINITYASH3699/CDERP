"use client";
import React, { useEffect, useState } from "react";
import styles from "@/styles/AboutPage/ProgressBars.module.css";

const ProgressBars = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const courses = [
    { name: "SAP Courses", percentage: 97, icon: "📊" },
    { name: "IT Courses", percentage: 80, icon: "💻" },
    { name: "HR Courses", percentage: 95, icon: "👥" },
    { name: "Digital Marketing Courses", percentage: 90, icon: "📱" },
    { name: "Data Visualization Courses", percentage: 75, icon: "📈" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const progressSection = document.querySelector(`.${styles.progressContainer}`);
    if (progressSection) {
      observer.observe(progressSection);
    }

    return () => {
      if (progressSection) {
        observer.unobserve(progressSection);
      }
    };
  }, []);

  return (
    <div className={`${styles.progressContainer} container-fluid`}>
      <div className="row">
        <div className="col-12">
          <h1 className={`${styles.title} mb-4`}>Our Course Progress</h1>
        </div>
      </div>

      <div className={`${styles.progressContent} row`}>
        {/* Left Side: Progress Bars */}
        <div className={`${styles.progressBarsSection} col-lg-5 col-md-12 mb-4 mb-lg-0`}>
          {courses.map((course, index) => (
            <div 
              className={`${styles.progressBarItem} ${isVisible ? styles.animate : ''}`} 
              key={index}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={styles.courseHeader}>
                <span className={styles.courseIcon}>{course.icon}</span>
                <div className={styles.progressCourseName}>{course.name}</div>
                <div className={styles.progressPercentage}>
                  {isVisible ? course.percentage : 0}%
                </div>
              </div>
              <div className={styles.progressBarWrapper}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: isVisible ? `${course.percentage}%` : '0%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Description */}
        <div className={`${styles.progressDescriptionSection} col-lg-7 col-md-12`}>
          <div className={styles.descriptionCard}>
            <h2 className="mb-3">What You Have In Our Trending Online Courses</h2>
            <div className={styles.descriptionContent}>
              <p>
                At Connecting Dots ERP, we're dedicated to helping you discover
                exciting career opportunities through our practical,
                industry-oriented training. Our Trending Online Courses are crafted
                to equip you with the skills and confidence necessary to excel in
                today's competitive job landscape.
              </p>
              <p>
                Whether you're looking for SAP Courses, IT Courses, HR Courses, 
                Digital Marketing Courses, or Data Visualization Courses, we have 
                a program tailored to your aspirations. Our courses include current 
                content and hands-on learning experiences to keep you ahead of the curve.
              </p>
              <p>
                Are you searching for an IT Course in Pune, a SAP Course in Pune, or
                an Online Digital Marketing Course in Pune? Our knowledgeable
                trainers will support you throughout your journey, providing
                personalized mentorship, real-world projects, and career assistance.
              </p>
              <div className={styles.ctaSection}>
                <button className={styles.ctaButton}>Explore Courses</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBars;