"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { CityContext } from "@/context/CityContext";
import styles from "@/styles/CoursesComponents/Why.module.css";
import { useInView } from "react-intersection-observer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";

const Why = ({ pageId, pageType }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { city } = useContext(CityContext);
  
  // For fade-in animation of the section
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/Jsonfolder/Whyds.json");
        if (!response.ok) throw new Error("Network response was not ok");

        const jsonData = await response.json();
        const pageData = jsonData?.[pageType]?.[pageId];

        if (pageData) {
          pageData.title = pageData.title?.replace(/{city}/g, city);
          pageData.cards = pageData.cards?.map((card) => ({
            ...card,
            title: card.title?.replace(/{city}/g, city),
            content: Array.isArray(card.content)
              ? card.content.map((text) => text.replace(/{city}/g, city))
              : card.content?.replace(/{city}/g, city),
            listItems: card.listItems?.map((item) =>
              item.replace(/{city}/g, city)
            ),
          }));
          setData(pageData);
        } else {
          throw new Error("Page data not found");
        }

        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [pageId, pageType, city]);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading content...</p>
    </div>
  );
  
  if (error) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>!</div>
      <p>Error loading data: {error.message}</p>
      <button className={styles.retryButton} onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  );
  
  if (!data) return (
    <div className={styles.noDataContainer}>
      <div className={styles.infoIcon}>i</div>
      <p>No data available for the specified page.</p>
    </div>
  );

  return (
    <div 
      ref={sectionRef} 
      className={`${styles.containerYds} ${sectionInView ? styles.fadeIn : styles.hidden}`}
    >
      <SectionComponent section={data} />
    </div>
  );
};

const SectionComponent = ({ section }) => {
  const titleRef = useRef(null);
  
  useEffect(() => {
    // Adding text animation for title
    if (titleRef.current) {
      const title = titleRef.current;
      title.classList.add(styles.titleAnimation);
    }
  }, []);

  return (
    <>
      <h1 ref={titleRef} className={styles.title}>
        <span className={styles.accent}>{section.title}</span>
      </h1>
      <div className={styles.cardsContainerYds}>
        {section.cards && section.cards.length > 0 ? (
          section.cards.map((card, index) => (
            <DataCard
              key={index}
              title={card.title}
              content={card.content}
              listItems={card.listItems}
              index={index} // Pass index for staggered animations
            />
          ))
        ) : (
          <p className={styles.noCards}>No cards available.</p>
        )}
      </div>
    </>
  );
};

const DataCard = ({ title, content, listItems, index }) => {
  // Using intersection observer for card reveal animation
  const [cardRef, cardInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  });

  // For read more/less functionality
  const [expanded, setExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef(null);

  // Constants for content threshold (adjust as needed)
  const CONTENT_HEIGHT_THRESHOLD = 150; // pixels
  
  // Check device type
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if content is long enough to need read more/less
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setShowReadMore(height > CONTENT_HEIGHT_THRESHOLD);
    }
  }, [content, listItems, cardInView]);

  return (
    <div 
      ref={cardRef}
      className={`${styles.cardClassYds} ${cardInView ? styles.cardVisible : styles.cardHidden}`}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className={styles.cardHeader}>
        <h2
          className={styles.textPrimaryClass}
          dangerouslySetInnerHTML={{ __html: title }}
        ></h2>
        <div className={styles.cardIcon}>
          <FontAwesomeIcon icon={faLightbulb} />
        </div>
      </div>
      
      <div 
        ref={contentRef} 
        className={`${styles.cardContent} ${!expanded && showReadMore ? styles.truncatedContent : ''}`}
      >
        {Array.isArray(content) ? (
          content.map((paragraph, idx) => (
            <p
              key={idx}
              className={styles.textMutedForegroundClass}
              dangerouslySetInnerHTML={{ __html: paragraph }}
            ></p>
          ))
        ) : (
          <p
            className={styles.textMutedForegroundClass}
            dangerouslySetInnerHTML={{ __html: content }}
          ></p>
        )}
        
        {listItems && listItems.length > 0 && (
          <ul className={styles.listClass}>
            {listItems.map((item, index) => (
              <li key={index} className={styles.listItem}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      
      {showReadMore && (
        <div className={styles.readMoreContainer}>
          <button 
            className={styles.readMoreButton}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? (isMobile ? 'Show Less' : 'Read Less') : (isMobile ? 'Show More' : 'Read More')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Why;