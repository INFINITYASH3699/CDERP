"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import styles from "@/styles/Floatingcontact.module.css";

const Floatingcontact = ({ phoneNumber }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
    };

    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isMobile) {
    return null; // Don't render on mobile screens
  }

  const handlecontactClick = () => {
    const formattedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "").replace(/^0+/, "");
    const Contact = `tel:${formattedPhoneNumber}`;
    window.open(Contact, '_self'); // Initiates the phone call
  };

  return (
    <div className={styles.floatingContactContainer}>
      <div className={styles.floatingContact} onClick={handlecontactClick}>
        <FontAwesomeIcon icon={faPhone} size="2x" />
      </div>
    </div>
  );
};

export default Floatingcontact;
