"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faWhatsapp,
  faYoutube,
  faLinkedinIn,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { faMapMarkerAlt, faPhone } from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/Common/Footer.module.css";

const Footer = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    handleResize(); // Initialize on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDropdown = (index) => {
    if (isMobileView) {
      setActiveDropdown(activeDropdown === index ? null : index);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Top Section with Logo and Social Icons */}
        <div className={styles.footerTop}>
          <div className={styles.footerLogo}>
            <Link href="/">
              <Image
                src="/Footer/cdots.avif"
                alt="Connecting Dots ERP logo"
                width={150}
                height={50}
                loading="lazy"
              />
            </Link>
          </div>
          <div className={styles.socialIcons}>
            <Link
              href="https://www.facebook.com/sapinstallation.pune.9"
              className={styles.socialLink}
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </Link>
            <Link
              href="https://wa.me/919004002941"
              className={styles.socialLink}
            >
              <FontAwesomeIcon icon={faWhatsapp} />
            </Link>
            <Link
              href="https://youtube.com/@connectingdotserp?si=hSKEiEg3MdytdEe_"
              className={styles.socialLink}
            >
              <FontAwesomeIcon icon={faYoutube} />
            </Link>
            <Link
              href="https://in.linkedin.com/in/connecting-dots-erp-043039171"
              className={styles.socialLink}
            >
              <FontAwesomeIcon icon={faLinkedinIn} />
            </Link>
            <Link
              href="https://www.instagram.com/connecting_dots_sap_training?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              className={styles.socialLink}
            >
              <FontAwesomeIcon icon={faInstagram} />
            </Link>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className={styles.footerColumns}>
          {/* Column 1: SAP COURSES */}
          <div className={styles.footerWidget}>
            <div
              className={`${styles.footerHeadline} ${activeDropdown === 0 ? styles.active : ""}`}
              onClick={() => toggleDropdown(0)}
            >
              <h3>SAP S/4 HANA COURSES</h3>
              {isMobileView && (
                <span className={styles.dropdownArrow}>
                  {activeDropdown === 0 ? "−" : "+"}
                </span>
              )}
            </div>
            <div
              className={`${styles.footerContent} ${activeDropdown === 0 || !isMobileView ? styles.show : ""}`}
            >
              <div className={styles.courseCategory}>
                <h6>SAP FUNCTIONAL COURSES</h6>
                <ul className={styles.footerMenu}>
                  <li>
                    <Link href="/sap-fico-course-in-pune">SAP FICO COURSE</Link>
                  </li>
                  <li>
                    <Link href="/sap-ariba-course-in-pune">
                      SAP ARIBA COURSE
                    </Link>
                  </li>
                  <li>
                    <Link href="/sap-sd-course-in-pune">SAP SD COURSE</Link>
                  </li>
                  <li>
                    <Link href="/sap-hr-hcm-course-in-pune">SAP HR/HCM</Link>
                  </li>
                  <li>
                    <Link href="/sap-mm-course-in-pune">SAP MM COURSE</Link>
                  </li>
                  <li>
                    <Link href="/sap-pp-course-in-pune">SAP PP COURSE</Link>
                  </li>
                  <li>
                    <Link href="/sap-hr-hcm-course-in-pune">
                      SAP HR/HCM COURSE
                    </Link>
                  </li>
                  <li>
                    <Link href="/sap-qm-course-in-pune">SAP QM COURSE</Link>
                  </li>
                  <li>
                    <Link href="/sap-pm-course-in-pune">SAP PM COURSE</Link>
                  </li>
                  <li>
                    <Link href="/sap-scm-course-in-pune">SAP SCM COURSE</Link>
                  </li>
                  <li>
                    <Link href="/sap-ewm-course-in-pune">SAP EWM COURSE</Link>
                  </li>
                  <li>
                    <Link href="/sap-successfactors-course-in-pune">
                      SAP SUCCESSFACTOR COURSE
                    </Link>
                  </li>
                </ul>
              </div>
              <div className={styles.courseCategory}>
                <h6>SAP TECHNICAL COURSES</h6>
                <ul className={styles.footerMenu}>
                  <li>
                    <Link href="/sap-abap-course-in-pune">SAP ABAP COURSE</Link>
                  </li>
                  <li>
                    <Link href="/sap-basis-course-in-pune">
                      SAP BASIS COURSE
                    </Link>
                  </li>
                  <li>
                    <Link href="/sap-bwbi-course-in-pune">
                      SAP BW/BI COURSE
                    </Link>
                  </li>
                  <li>
                    <Link href="/sap-s4-hana-course-in-pune">
                      SAP S/4 HANA COURSE
                    </Link>
                  </li>
                  <li>
                    <Link href="/sap-netweaver-course-in-pune">
                      SAP NETWEAVER COURSE
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 2: IT COURSES & ABOUT */}
          <div className={styles.footerWidget}>
            {/* IT COURSES */}
            <div
              className={`${styles.footerHeadline} ${activeDropdown === 1 ? styles.active : ""}`}
              onClick={() => toggleDropdown(1)}
            >
              <h3>IT COURSES</h3>
              {isMobileView && (
                <span className={styles.dropdownArrow}>
                  {activeDropdown === 1 ? "−" : "+"}
                </span>
              )}
            </div>
            <div
              className={`${styles.footerContent} ${activeDropdown === 1 || !isMobileView ? styles.show : ""}`}
            >
              <ul className={styles.footerMenu}>
                <li>
                  <Link href="/full-stack-developer-course-in-pune">
                    FULL STACK TRAINING
                  </Link>
                </li>
                <li>
                  <Link href="/java-course-in-pune">JAVA</Link>
                </li>
                <li>
                  <Link href="/mern-stack-course-in-pune">MERN STACK</Link>
                </li>
                <li>
                  <Link href="/ui-ux-course-in-pune">UI/UX DESIGN</Link>
                </li>
                <li>
                  <Link href="/python-course-in-pune">PYTHON</Link>
                </li>
                <li>
                  <Link href="/salesforce-training-in-pune">SALESFORCE</Link>
                </li>
              </ul>
            </div>

            {/* ABOUT US */}
            <div
              className={`${styles.footerHeadline} ${styles.aboutHeadline} ${activeDropdown === 2 ? styles.active : ""}`}
              onClick={() => toggleDropdown(2)}
            >
              <h3>ABOUT</h3>
              {isMobileView && (
                <span className={styles.dropdownArrow}>
                  {activeDropdown === 2 ? "−" : "+"}
                </span>
              )}
            </div>
            <div
              className={`${styles.footerContent} ${activeDropdown === 2 || !isMobileView ? styles.show : ""}`}
            >
              <ul className={styles.footerMenu}>
                <li>
                  <Link href="/aboutus">ABOUT US</Link>
                </li>
                <li>
                  <Link href="/blogs">BLOG</Link>
                </li>
                <li>
                  <Link href="/contactus">CONTACT US</Link>
                </li>
                <li>
                  <Link href="/sitemap">CITY SITEMAP</Link>
                </li>
                <li>
                  <Link href="/all-course-links">ALL COURSES/CITY SITEMAP</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: DIGITAL MARKETING & DATA SCIENCE */}
          <div className={styles.footerWidget}>
            {/* DIGITAL MARKETING COURSES */}
            <div
              className={`${styles.footerHeadline} ${activeDropdown === 3 ? styles.active : ""}`}
              onClick={() => toggleDropdown(3)}
            >
              <h3>DIGITAL MARKETING COURSES</h3>
              {isMobileView && (
                <span className={styles.dropdownArrow}>
                  {activeDropdown === 3 ? "−" : "+"}
                </span>
              )}
            </div>
            <div
              className={`${styles.footerContent} ${activeDropdown === 3 || !isMobileView ? styles.show : ""}`}
            >
              <ul className={styles.footerMenu}>
                <li>
                  <Link href="/digital-marketing-course-in-pune">
                    ADVANCE DIGITAL MARKETING
                  </Link>
                </li>
                <li>
                  <Link href="/digital-marketing-course-in-pune">
                    PAY PER CLICK TRAINING
                  </Link>
                </li>
                <li>
                  <Link href="/digital-marketing-course-in-pune">
                    SEARCH ENGINE OPTIMIZATION
                  </Link>
                </li>
                <li>
                  <Link href="/digital-marketing-course-in-pune">
                    SOCIAL MEDIA MARKETING
                  </Link>
                </li>
                <li>
                  <Link href="/digital-marketing-course-in-pune">
                    ADVANCE ANALYTICS TRAINING
                  </Link>
                </li>
              </ul>
            </div>

            {/* DATA SCIENCE COURSES */}
            <div
              className={`${styles.footerHeadline} ${styles.aboutHeadline} ${activeDropdown === 5 ? styles.active : ""}`}
              onClick={() => toggleDropdown(5)}
            >
              <h3>DATA SCIENCE COURSES</h3>
              {isMobileView && (
                <span className={styles.dropdownArrow}>
                  {activeDropdown === 5 ? "−" : "+"}
                </span>
              )}
            </div>
            <div
              className={`${styles.footerContent} ${activeDropdown === 5 || !isMobileView ? styles.show : ""}`}
            >
              <ul className={styles.footerMenu}>
                <li>
                  <Link href="/data-analytics-course-in-pune">
                    MASTERS IN DATA ANALYTICS
                  </Link>
                </li>
                <li>
                  <Link href="/data-science-course-in-pune">
                    MASTERS IN DATA SCIENCE
                  </Link>
                </li>
                <li>
                  <Link href="/business-analytics-course-in-pune">
                    MASTERS IN BUSINESS ANALYTICS
                  </Link>
                </li>
                <li>
                  <Link href="/chatgpt-course-in-pune">CHAT GPT & AI</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: DATA VISUALISATION & HR COURSES */}
          <div className={styles.footerWidget}>
            {/* DATA VISUALISATION COURSES */}
            <div
              className={`${styles.footerHeadline} ${activeDropdown === 4 ? styles.active : ""}`}
              onClick={() => toggleDropdown(4)}
            >
              <h3>DATA VISUALISATION COURSES</h3>
              {isMobileView && (
                <span className={styles.dropdownArrow}>
                  {activeDropdown === 4 ? "−" : "+"}
                </span>
              )}
            </div>
            <div
              className={`${styles.footerContent} ${activeDropdown === 4 || !isMobileView ? styles.show : ""}`}
            >
              <ul className={styles.footerMenu}>
                <li>
                  <Link href="/power-bi-course-in-pune">POWER BI</Link>
                </li>
                <li>
                  <Link href="/tableau-training-in-pune">TABLEAU</Link>
                </li>
                <li>
                  <Link href="/sql-course-in-pune">SQL</Link>
                </li>
              </ul>
            </div>

            {/* HR COURSES */}
            <div
              className={`${styles.footerHeadline} ${styles.aboutHeadline} ${activeDropdown === 6 ? styles.active : ""}`}
              onClick={() => toggleDropdown(6)}
            >
              <h3>HR COURSES</h3>
              {isMobileView && (
                <span className={styles.dropdownArrow}>
                  {activeDropdown === 6 ? "−" : "+"}
                </span>
              )}
            </div>
            <div
              className={`${styles.footerContent} ${activeDropdown === 6 || !isMobileView ? styles.show : ""}`}
            >
              <ul className={styles.footerMenu}>
                <li>
                  <Link href="/hr-training-course-in-pune">HR TRAINING</Link>
                </li>
                <li>
                  <Link href="/core-hr-course-in-pune">CORE HR</Link>
                </li>
                <li>
                  <Link href="/hr-payroll-course-in-pune">HR PAYROLL</Link>
                </li>
                <li>
                  <Link href="/hr-management-course-in-pune">
                    HR MANAGEMENT
                  </Link>
                </li>
                <li>
                  <Link href="/hr-generalist-course-in-pune">
                    HR GENERALIST
                  </Link>
                </li>

                <li>
                  <Link href="/hr-analytics-course-in-pune">HR ANALYTICS</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 5: CONTACT US */}
          <div className={styles.contactWidget}>
            <div className={styles.contactSection}>
              <div className={styles.contactHeading}>
                <h3>CONTACT US</h3>
              </div>
              <div className={styles.contactDetails}>
                {/* Pune Office */}
                <div className={styles.officeLocation}>
                  <div className={styles.contactItem}>
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className={styles.contactIcon}
                    />
                    <div>
                      <a
                        href="https://maps.app.goo.gl/DNwzKa2Yt1WB6zUB7"
                        target="_blank"
                        rel="noopener noreferrer"
                        alt="Pune Office"
                      >
                        <h4 className={styles.locationTitle}>Pune Office</h4>
                      </a>
                      <p>
                        1st Floor, 101, Police, Wireless Colony, Vishal Nagar,
                        Pimple Nilakh, Pune, Pimpri-Chinchwad, Maharashtra
                        411027
                      </p>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className={styles.contactIcon}
                    />
                    <a href="tel:+919004002941" className={styles.contactLink}>
                      +91 9004002941
                    </a>
                  </div>
                  <div className={styles.contactItem}>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className={styles.contactIcon}
                    />
                    <a href="tel:+919004002958" className={styles.contactLink}>
                      +91 9004002958
                    </a>
                  </div>
                </div>

                {/* Mumbai Office */}
                <div className={styles.officeLocation}>
                  <div className={styles.contactItem}>
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className={styles.contactIcon}
                    />
                    <div>
                      <a
                        href="https://maps.app.goo.gl/i7W3baVVS1mDLmTJ9"
                        target="_blank"
                        rel="noopener noreferrer"
                        alt="Mumbai Office"
                      >
                        <h4 className={styles.locationTitle}>Mumbai Office</h4>
                      </a>
                      <p>
                        4th Floor, Ram Niwas, B-404, Gokhale Rd, near
                        McDonald's, Dada Patil Wadi, Naupada, Thane West, Thane,
                        Maharashtra 400602
                      </p>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className={styles.contactIcon}
                    />
                    <a href="tel:+919004005382" className={styles.contactLink}>
                      +91 9004005382
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <p>&copy; 2024 Connecting Dots ERP. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
