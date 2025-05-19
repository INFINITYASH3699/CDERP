'use client';

import { useState, useEffect, useContext } from 'react';
import styles from '@/styles/CoursesComponents/FAQ.module.css';
import { CityContext } from '@/context/CityContext';

const FAQAccordion = ({ pageId, pageType }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const { city } = useContext(CityContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Jsonfolder/faqdata.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const pageData = data[pageType]?.[pageId];
        if (pageData) {
          pageData.title = pageData.title?.replace(/{city}/g, city);
          pageData.description = pageData.description?.replace(/{city}/g, city);
          pageData.items = pageData.items?.map((item) => ({
            ...item,
            question: item.question?.replace(/{city}/g, city),
            answer: item.answer?.replace(/{city}/g, city),
          }));

          setData(pageData);
        } else {
          throw new Error('Page data not found');
        }
      } catch (error) {
        console.error('Error fetching FAQ data:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageId, pageType, city]);

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;
  if (!data) return <div>No data available for the specified page.</div>;

  return (
    <div className={styles.containerFaqDs}>
      <h2 className={styles.containerFaqDsh2}>{data.title}</h2>
      <p>{data.description}</p>
      <div className={styles.faqContent}>
        <div className={styles.faqImage}>
          <video loop autoPlay muted>
            <source src={data.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className={styles.faqQuestions}>
          {data.items && data.items.length > 0 ? (
            data.items.map((item, index) => (
              <div key={index} className={styles.accordionItem}>
                <button
                  aria-expanded={expandedIndex === index}
                  onClick={() => handleToggle(index)}
                  className={styles.accordionButton}
                >
                  <span className={styles.accordionTitle}>{item.question}</span>
                  <span className={styles.icon} aria-hidden="true"></span>
                </button>
                <div
                  className={styles.accordionContent}
                  style={{
                    opacity: expandedIndex === index ? 1 : 0,
                    maxHeight: expandedIndex === index ? '9em' : 0,
                  }}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No FAQs available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;
