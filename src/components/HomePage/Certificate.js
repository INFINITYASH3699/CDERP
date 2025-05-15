"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import styles from "@/styles/HomePage/Certificate.module.css";
import { Button } from "react-bootstrap";
import dynamic from "next/dynamic";
import { useCity } from "@/context/CityContext";

// Dynamically import Btnform to prevent SSR-related issues
const Btnform = dynamic(() => import("@/components/HomePage/Btnform"), {
  ssr: false,
});

const Certificate = ({ pageId }) => {
  const [showForm, setShowForm] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { city } = useCity();

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        const response = await fetch("/Jsonfolder/certificateData.json");
        if (!response.ok) throw new Error("Failed to fetch certificate data");

        const jsonData = await response.json();
        const pageCertificate = jsonData.pages.find(
          (page) => page.pageId === pageId
        );

        if (pageCertificate) {
          const updatedCertificate = {
            ...pageCertificate,
            completionText: pageCertificate.completionText.replace(
              /{city}/g,
              city
            ),
            description: pageCertificate.description.replace(/{city}/g, city),
            courseTitle: pageCertificate.courseTitle.replace(/{city}/g, city),
          };

          setCertificateInfo(updatedCertificate);
        } else {
          throw new Error(
            "Certificate data not found for the specified page ID"
          );
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [pageId, city]);

  const handleButtonClick = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!certificateInfo) return <p>No certificate data available.</p>;

  return (
    <div className={styles.certificateSection}>
      <h2 className={styles.certificateTitle}>Certificate</h2>
      <div className={styles.titleUnderline}></div>
      <div className={styles.certificateContent}>
        <div className={styles.certificateImage}>
          <Image
            src={certificateInfo.image}
            alt={certificateInfo.alt || "Certificate"}
            width={500}
            height={300}
            layout="intrinsic"
          />
        </div>
        <div className={styles.certificateText}>
          <h2>Congratulations on Completing Your Training!</h2>
          <h4 className={styles.certificateSubtitle}>
            {certificateInfo.courseTitle}
          </h4>
          <p>{certificateInfo.completionText}</p>
          <p>{certificateInfo.description}</p>
          <div
            className="mb-3"
            style={{ display: "flex", justifyContent: "left" }}
          >
            <Button className={styles.outlineBtn} onClick={handleButtonClick}>
              Get your Certificate
            </Button>
          </div>
          {showForm && <Btnform onClose={handleCloseForm} />}
        </div>
      </div>
    </div>
  );
};

export default Certificate;
