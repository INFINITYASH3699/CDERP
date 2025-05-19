"use client";

import React, { useEffect, useState, useContext, useRef } from "react";
import { CityContext } from "@/context/CityContext";
import styles from "@/styles/CoursesComponents/Description.module.css";
import { FaCheckCircle, FaChevronRight } from "react-icons/fa";

const Description = ({ pageId, sectionIndex = 0 }) => {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const { city } = useContext(CityContext);
  const [isVisible, setIsVisible] = useState(false);
  const descriptionRef = useRef(null);
  const observerRef = useRef(null);

  // Setup intersection observer to detect when component is visible
  useEffect(() => {
    if (!descriptionRef.current || observerRef.current) return;

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

    observerRef.current.observe(descriptionRef.current);

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
    const fetchData = async () => {
      setError("");
      try {
        // Create a cache key for this specific page and city
        const cacheKey = `description_${pageId}_${city}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          setContent(JSON.parse(cachedData));
          return;
        }
        
        const response = await fetch("/Jsonfolder/Descriptiondata.json");
        const data = await response.json();
        const pageContent = data.find((item) => item.pageId === pageId);

        if (pageContent) {
          const updatedContent = {
            ...pageContent,
            title: pageContent.title?.replace(/{city}/g, city) ?? "",
            paragraphs:
              pageContent.paragraphs?.map((p) => p.replace(/{city}/g, city)) ??
              [],
            paragraphsAfterList:
              pageContent.paragraphsAfterList?.map((p) =>
                p.replace(/{city}/g, city)
              ) ?? [],
            listItem1Header:
              pageContent.listItem1Header?.replace(/{city}/g, city) ?? "",
            listItem1: pageContent.listItem1 ?? [],
            listItem2: pageContent.listItem2 ?? [],
            secondTitle:
              pageContent.secondTitle?.replace(/{city}/g, city) ?? "",
            secondParagraphs:
              pageContent.secondParagraphs?.map((p) =>
                p.replace(/{city}/g, city)
              ) ?? [],
            highlights: pageContent.highlights ?? [],
            listItemAfterIndex:
              typeof pageContent.listItemAfterIndex === "number"
                ? pageContent.listItemAfterIndex
                : undefined,
          };
          
          // Cache the processed content
          localStorage.setItem(cacheKey, JSON.stringify(updatedContent));
          setContent(updatedContent);
        } else {
          setError("Course info not found.");
          setContent(null);
        }
      } catch (err) {
        console.error("Failed to load description data:", err);
        setError("Failed to load course info.");
        setContent(null);
      }
    };
    fetchData();
  }, [pageId, city]);

  const applyHighlights = (text, highlights) => {
    if (!highlights || highlights.length === 0) return text;
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const validHighlights = highlights.filter(
      (w) => typeof w === "string" && w.trim() !== ""
    );
    if (validHighlights.length === 0) return text;
    const regex = new RegExp(
      `(${validHighlights.map(escapeRegex).join("|")})`,
      "gi"
    );
    return text.split(regex).map((part, i) =>
      validHighlights.some(
        (word) => word.toLowerCase() === part.toLowerCase()
      ) ? (
        <span key={i} className={styles.highlightDescJson}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (error) return <div className={styles.errorMsg}>{error}</div>;

  if (!content)
    return <div className={styles.loader}>Loading course info...</div>;

  // Figure out if/where to split paragraphs for the list
  const insertListAfter =
    typeof content.listItemAfterIndex === "number"
      ? content.listItemAfterIndex
      : -1;

  const paragraphsBeforeList =
    insertListAfter >= 0
      ? content.paragraphs.slice(0, insertListAfter + 1)
      : content.paragraphs;
  const paragraphsAfterList =
    insertListAfter >= 0 ? content.paragraphs.slice(insertListAfter + 1) : [];

  // Helper to render list with icons
  const renderList = (
    items,
    style,
    icon = <FaCheckCircle className={styles.bulletIcon} />
  ) => (
    <ul className={style}>
      {items.map((item, i) => (
        <li key={i}>
          {icon}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      ref={descriptionRef}
      className={`${styles.descriptionContainer} ${
        sectionIndex % 2 === 0 ? styles.videoLeft : styles.videoRight
      }`}
    >
      {content.videoUrl && (
        <div className={styles.descriptionVideo}>
          <video src={content.videoUrl} loop autoPlay muted playsInline />
        </div>
      )}

      <div className={styles.descriptionContent}>
        <h2 className={styles.descriptionTitle}>{content.title}</h2>

        {/* Paragraphs BEFORE list */}
        {paragraphsBeforeList.map(
          (p, i) =>
            p.trim() && (
              <p key={`before-${i}`} className={styles.descriptionParagraph}>
                {applyHighlights(p, content.highlights)}
              </p>
            )
        )}

        {/* Insert feature list here if present */}
        {content.listItem1 && content.listItem1.length > 0 && (
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              {content.listItem1Header
                ? content.listItem1Header
                : "What sets us apart:"}
            </div>
            {renderList(content.listItem1, styles.featureList)}
          </div>
        )}

        {/* Paragraphs AFTER list from "paragraphs" array */}
        {paragraphsAfterList.map(
          (p, i) =>
            p.trim() && (
              <p key={`after-${i}`} className={styles.descriptionParagraph}>
                {applyHighlights(p, content.highlights)}
              </p>
            )
        )}

        {/* Paragraphs AFTER feature list (for the paragraphsAfterList property) */}
        {content.paragraphsAfterList &&
          content.paragraphsAfterList.map(
            (p, i) =>
              p.trim() && (
                <p
                  key={`afterlist-${i}`}
                  className={styles.descriptionParagraph}
                >
                  {applyHighlights(p, content.highlights)}
                </p>
              )
          )}

        {/* Optionally render listItem2 (eg for your SAP closing statement) */}
        {content.listItem2 &&
          content.listItem2.length > 0 &&
          renderList(
            content.listItem2,
            styles.listItem2,
            <FaChevronRight className={styles.arrowIcon} />
          )}

        {/* Second section (What Will You Learn, etc.) */}
        {content.secondTitle && (
          <div className={styles.sectionCardAlt}>
            <div className={styles.secondTitle}>{content.secondTitle}</div>
            {content.secondParagraphs.map(
              (p, i) =>
                p.trim() && (
                  <p key={i} className={styles.descriptionParagraphAlt}>
                    {applyHighlights(p, content.highlights)}
                  </p>
                )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Description;