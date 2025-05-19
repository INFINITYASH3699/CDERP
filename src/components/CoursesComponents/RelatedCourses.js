"use client";

import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import Image from "next/image";
import styles from "@/styles/CoursesComponents/RelatedCourses.module.css";
import ContactForm from "@/components/HomePage/Btnform";
import { CityContext } from "@/context/CityContext";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import dynamic from "next/dynamic";

const CoursesRelated = ({ pageId }) => {
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { city } = useContext(CityContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cachedData = localStorage.getItem(`relatedCourses_${pageId}`);
        if (cachedData) {
          setRelatedCourses(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const response = await fetch("/Jsonfolder/relateddata.json");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        const pageData = data?.[pageId];
        if (pageData) {
          const updatedCourses = pageData.items.map((course) => {
            const updatedIcon = course.icon?.replace(
              "Jsonfolder/",
              `Jsonfolder/${city.toLowerCase()}/`
            );

            return {
              ...course,
              name: course.name?.replace(/{city}/g, city),
              description: course.description?.replace(/{city}/g, city),
              icon: updatedIcon,
            };
          });

          localStorage.setItem(
            `relatedCourses_${pageId}`,
            JSON.stringify(updatedCourses)
          );
          setRelatedCourses(updatedCourses);
        } else {
          throw new Error("Page data not found");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching related courses data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [pageId, city]);

  const handleEnrollNowClick = useCallback((relcourse) => {
    setSelectedCourse(relcourse);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedCourse(null);
  }, []);

  const handleSelect = useCallback((selectedIndex) => {
    setActiveIndex(selectedIndex);
  }, []);

  const renderRelatedCourses = useMemo(() => {
    if (!relatedCourses.length) return null;

    // Determine number of cards per slide (1 for mobile, 3-4 for desktop)
    const cardsPerSlide = isMobile ? 1 : 5; // Change 3 to 4 if you want 4 cards per slide
    const slides = [];

    for (let i = 0; i < relatedCourses.length; i += cardsPerSlide) {
      slides.push(
        <Carousel.Item key={i}>
          <div className={styles.relatedCoursesGrid}>
            {relatedCourses.slice(i, i + cardsPerSlide).map((relcourse, index) => (
              <div
                key={index}
                className={styles.relatedCourseCard}
                onClick={() => handleEnrollNowClick(relcourse.name)}
              >
                <div className={styles.relatedIconContainer}>
                  {relcourse.icon.endsWith(".mp4") ? (
                    <video
                      src={relcourse.icon}
                      alt={relcourse.alt}
                      className={styles.relatedCourseIcon}
                      loop
                      autoPlay
                      muted
                    />
                  ) : (
                    <Image
                      src={relcourse.icon}
                      alt={relcourse.alt}
                      width={100}
                      height={100}
                      className={styles.relatedCourseIcon}
                    />
                  )}
                </div>
                <h3>{relcourse.name}</h3>
                <p>{relcourse.description}</p>
              </div>
            ))}
          </div>
        </Carousel.Item>
      );
    }

    return slides;
  }, [relatedCourses, handleEnrollNowClick, isMobile]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  return (
    <div className={styles.relatedCoursesContainer}>
      <div className={styles.relatedCoursesTitle}>
        <h2 className={styles.relatedCoursesTitleh2}>RELATED COURSES</h2>
      </div>
      <Carousel
        activeIndex={activeIndex}
        onSelect={handleSelect}
        interval={3000}
        indicators={true}
        controls={true}
        pause="hover"
      >
        {renderRelatedCourses}
      </Carousel>

      {showModal && (
        <ContactForm onClose={handleCloseModal} course={selectedCourse} />
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(CoursesRelated), { ssr: false });
