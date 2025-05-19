"use client";

import { useState, useEffect, useContext } from "react";
import styles from "@/styles/CoursesComponents/sapmod.module.css";
import dynamic from "next/dynamic";
import { CityContext } from "@/context/CityContext";

// Dynamically import Btnform to prevent SSR-related issues
const Btnform = dynamic(() => import("@/components/HomePage/Btnform"), {
  ssr: false,
});

const SapModComponent = ({ pageId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const city = useContext(CityContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/Jsonfolder/sapmod.json");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        const pageData = jsonData?.[pageId];

        if (pageData) {
          pageData.title2 = pageData.title2?.replace(/{city}/g, city);
          pageData.description = pageData.description?.replace(/{city}/g, city);
          pageData.summary = pageData.summary?.replace(/{city}/g, city);
          pageData.features = pageData.features?.map((feature) => ({
            ...feature,
            description: feature.description?.replace(/{city}/g, city),
          }));
          pageData.overview = {
            ...pageData.overview,
            title: pageData.overview.title?.replace(/{city}/g, city),
            modules: pageData.overview.modules?.map((module) => ({
              ...module,
              name: module.name?.replace(/{city}/g, city),
            })),
          };

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
  }, [pageId, city]);

  useEffect(() => {
    if (data && data.noteAdvance) {
      const container = document.getElementById("glowContainer");
      if (container) {
        container.innerHTML = "";
        data.noteAdvance.split("").forEach((letter, index) => {
          const span = document.createElement("span");
          span.textContent = letter;
          span.style.animationDelay = `${index * 0.1}s`;
          container.appendChild(span);
        });
      }
    }
  }, [data]);

  const handleDownloadBrochureClick = () => {
    setShowPopupForm(true);
  };

  const handleFormSubmit = () => {
    setFormSubmitted(true);
    setShowPopupForm(false);

    if (data && data.downloadLink) {
      const link = document.createElement("a");
      link.href = data.downloadLink;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Download link is not available.");
    }
  };

  const handleCloseForm = () => {
    setShowPopupForm(false); // Close the form
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;
  if (!data) return <p>No data available for the specified page.</p>;

  return (
    <div className={styles.sapModContainer}>
      <h1 className={styles.sapModHeading}>SYLLABUS</h1>
      <div className={styles.sapModCont}>
        <div className={styles.sapModCard}>
          <h2
            className="text-2xl font-bold mb-4"
            dangerouslySetInnerHTML={{ __html: data.title2 }}
          />
          <p className="mb-4 text-lg">{data.description}</p>
          <p className="text-base mb-6">{data.summary}</p>

          <div id="glowContainer" className={styles.glowText}></div>

          <p className="text-danger mb-6">{data.noteMaster}</p>
          <div className="space-y-4">
            {data.features && data.features.length > 0 ? (
              data.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <span className="bg-primary-foreground text-primary rounded-full px-3 py-1 text-sm font-bold">
                    {feature.label}
                  </span>
                  <span className="ml-3 text-base">{feature.description}</span>
                </div>
              ))
            ) : (
              <p>No features available.</p>
            )}
          </div>

          <div className={styles.sapModButtonContainer}>
            <button
              className={styles.sapModButton}
              onClick={handleDownloadBrochureClick}
            >
              Download Brochure
            </button>

            <video
              src={data.videoUrl}
              className={styles.downloadVideo}
              autoPlay
              loop
              muted
            />
          </div>
        </div>

        {showPopupForm && (
          <>
            <div className={styles.contactFormOverlaySapmod}></div>
            <div className={styles.contactFormModalSapmod}>
              <Btnform onSubmit={handleFormSubmit} onClose={handleCloseForm} />
            </div>
          </>
        )}

        <div className={styles.sapModCardSecondary}>
          <h3 className="text-xl font-semibold mb-6">{data.overview.title}</h3>
          <div className="space-y-">
            {data.overview.modules && data.overview.modules.length > 0 ? (
              data.overview.modules.map((module, index) => (
                <div
                  key={index}
                  className={`${styles.sapModCardContent} ${
                    index % 2 === 1 ? styles.alt : ""
                  }`}
                >
                  <span className="text-lg">{module.name}</span>
                  <span className="text-sm text-gray-600">
                    {module.duration}
                  </span>
                </div>
              ))
            ) : (
              <p>No modules available.</p>
            )}
            <p className={styles.sapModNote}>
              *Note: To see the complete Modules Click on 'Download Syllabus'
              button
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sapModNote}>
        {data.note && (
          <p
            className="text-lg"
            dangerouslySetInnerHTML={{
              __html: data.note.replace(/\n/g, "<br/>"),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SapModComponent;
