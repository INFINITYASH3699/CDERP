import React from "react";
import styles from "@/styles/HomePage/Keypoints.module.css";
import { Container, Row, Col } from "react-bootstrap";
import Image from "next/image";

const Keypoints = () => {
  const keyFeatures = [
    {
      title: "10+ Years Experience",
      desc: "Seasoned professional with over 10 years of experience in the field.",
    },
    {
      title: "MNC Experienced Professional",
      desc: "Learn from seasoned professionals with extensive industry experience and knowledge.",
    },
    {
      title: "100% Job Assistance",
      desc: "Round-the-clock assistance to resolve queries and enhance the learning experience.",
    },
    {
      title: "Corporate Style Training",
      desc: "Craft impressive resumes to highlight your skills and achievements effectively.",
    },
    {
      title: "Placement Assistance",
      desc: "Engage in practical projects to apply data science concepts in real-world.",
    },
    {
      title: "Real Time Training & Project",
      desc: "Earn a recognized certification upon successful course completion.",
    },
  ];

  const homeAbout = [
    {
      cover: "/Keypoints/experiencelogo.avif",
      title: "10+ Years Experience",
      desc: "Seasoned professional with over 10 years of experience in the field.",
      className: styles.logo1,
    },
    {
      cover: "/Keypoints/corporate-alt.avif",
      title: "MNC Experienced Professional",
      desc: "Highly Qualified and Industry Experienced Professionals for providing Real-Time Scenario Based Training.",
      className: styles.logo1,
    },
    {
      cover: "/Keypoints/cptraining.avif",
      title: "Corporate Style Training",
      desc: "Multiple Batches & Support Systems to make sure you can learn according to your convenience.",
      className: styles.logo2,
    },
    {
      cover: "/Keypoints/exp alt.avif",
      title: "Experience Alteration",
      desc: "Our unique offering helps you apply for jobs with relevant experience, enhancing your resume and boosting hiring chances.",
      className: styles.logo5,
    },
    {
      cover: "/Keypoints/watchlogo.avif",
      title: "Real Time Training & Project",
      desc: "After Training Completion, we provide Job Assistance, Scheduled Interview for every Individual.",
      className: styles.logo4,
    },
    {
      cover: "/Keypoints/job assistance.avif",
      title: "100% Job Assistance",
      desc: "After Training Completion, we provide Job Assistance, Scheduled Interview for every Individual.",
      className: styles.logo3,
    },
  ];

  return (
    <Container fluid className={styles.keyCoursesContainer}>
      <Row className="justify-content-center">
        <Col md={10} className="text-center">
          <div className={styles.keypointsTitle}>
            <h2>Why Connecting Dots ERP?</h2>
          </div>
          <div className={styles.titleUnderline}></div>
        </Col>
      </Row>
      
      <div className={styles.keypoints}>
        <div className={styles.circle}>
          {keyFeatures.map((feature, index) => (
            <div className={`${styles.feature} ${styles[`feature${index}`]}`} key={index}>
              <div className={styles.featureTitle}>{feature.title}</div>
            </div>
          ))}
          <div className={styles.centerFeature}>
            <div className={styles.centerText}>
              <span className={styles.centreKeypoints}>Keypoints</span>
            </div>
          </div>
        </div>
        
        <div className={styles.keyNotes}>
          {homeAbout.map((feature, index) => (
            <div className={styles.note} key={index}>
              <div className={styles.img}>
                <Image
                  src={feature.cover}
                  alt={feature.title}
                  width={100}
                  height={100}
                  className={feature.className}
                />
              </div>
              <div className={styles.keyTextContainer}>
                <strong>{feature.title}:</strong> {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Keypoints;