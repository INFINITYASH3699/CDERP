"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import styles from "@/styles/CoursesComponents/Modules.module.css";

const Modules = ({ pageId }) => {
  const [activeTab, setActiveTab] = useState("beginner");
  const [activeModule, setActiveModule] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const moduleRef = useRef(null);
  const observerRef = useRef(null);

  // Setup intersection observer to detect when component is visible
  useEffect(() => {
    if (!moduleRef.current || observerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(moduleRef.current);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Force visibility after a timeout to ensure rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isVisible) {
        setIsVisible(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    // Clear localStorage to prevent stale data
    // localStorage.clear(); // This line may be causing issues by clearing all data, so removing it

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Unique cache key for each curriculum data
        const cacheKey = `curriculum_${pageId}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          setData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const response = await fetch("/Jsonfolder/curriculumdata.json");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const jsonData = await response.json();
        const pageData = jsonData[pageId];

        if (pageData) {
          localStorage.setItem(
            cacheKey,
            JSON.stringify(pageData)
          );
          setData(pageData);
        } else {
          throw new Error("Page data not found");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function - don't clear localStorage here
    return () => {};
  }, [pageId]);

  const handleModuleClick = useCallback(
    (moduleIndex) => {
      if (activeModule !== moduleIndex) {
        setActiveModule(moduleIndex);
      }
    },
    [activeModule]
  );

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setActiveModule(0);
  }, []);

  const activeContent = useMemo(() => {
    if (data && data.tabs) {
      const activeTabData = data.tabs.find((tab) => tab.type === activeTab);
      if (activeTabData && activeTabData.modules && activeTabData.modules.length > activeModule) {
        return activeTabData.modules[activeModule];
      }
    }
    return null;
  }, [data, activeTab, activeModule]);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading module content...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>Error loading data: {error.message}</div>;
  }

  if (!data) {
    return <div className={styles.errorContainer}>No data available for the specified page.</div>;
  }

  return (
    <div className={styles.containerDs} ref={moduleRef}>
      <div className={styles.headerDs}>
        <h1>{data.title}</h1>
      </div>
      <div className={styles.tabs}>
        {data.tabs.map((tab) => (
          <div
            key={tab.type}
            className={`${styles.tab} ${
              activeTab === tab.type ? styles.tabActive : ""
            }`}
            onClick={() => handleTabChange(tab.type)}
          >
            <p>{tab.type.charAt(0).toUpperCase() + tab.type.slice(1)}</p>
            <span
              className={activeTab === tab.type ? styles.tabSpanActive : ""}
            >
              {tab.duration}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.content}>
          {data.tabs
            .find((tab) => tab.type === activeTab)
            .modules.map((module, index) => (
              <div
                key={index}
                className={`${styles.module} ${
                  activeModule === index ? styles.moduleSelected : ""
                }`}
                onClick={() => handleModuleClick(index)}
              >
                <div className={styles.moduleHeader}>
                  <p>MODULE - {index + 1}</p>
                  <h2>{module.title}</h2>
                  <span>{module.duration}</span>
                </div>
              </div>
            ))}
        </div>
        <div className={styles.moduleDetailsContainer}>
          {activeContent && (
            <div className={styles.moduleDetails}>
              <h2>{activeContent.title}</h2>
              <p>
                <strong>Duration:</strong> {activeContent.duration}
              </p>
              <ul>
                {activeContent.content.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className={styles.footer}>
        <button className={styles.footerButton}>Download Curriculum</button>
      </div>
    </div>
  );
};

export default Modules;