"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "@/styles/PopupForm.module.css";
import axios from "axios"; // Make sure axios is imported

const PopupForm = ({ onSubmitData }) => {
  const [isVisible, setIsVisible] = useState(false);
  // Form state
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState(""); // Represents 'contact' for backend
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState(""); // Represents 'coursename' for backend
  const [location, setLocation] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  // Add default country code state (assuming +91 if not collected)
  const [countryCode] = useState("+91");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" }); // For success/validation messages

  const pathname = usePathname();

  useEffect(() => {
    // Update the hidden pages list to include all admin paths
    const hiddenPages = [
      "/adminlogin",
      "/dashboard",
      "/blogsadmin",
      "/superadmin"
    ];

    const currentPath = pathname?.toLowerCase() || "";

    // Check if the current path starts with any of the hidden pages
    if (hiddenPages.some(page => currentPath.startsWith(page))) {
      setIsVisible(false);
      return;
    }

    const showTimer = setTimeout(() => {
      if (!document.body.classList.contains(styles.popupClosedManually)) {
          setIsVisible(true);
      }
    }, 5000);

    return () => clearTimeout(showTimer);
  }, [pathname]);

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add(styles.noScroll);
    } else {
      document.body.classList.remove(styles.noScroll);
    }
    return () => {
      document.body.classList.remove(styles.noScroll);
    };
  }, [isVisible]);

  useEffect(() => {
    let timer;
    if (statusMessage.text) {
      timer = setTimeout(() => {
        setStatusMessage({ text: "", type: "" });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [statusMessage]);

  // --- Original Frontend Validation (using statusMessage) ---
  // Note: This validation only shows the *first* error found.
  const validateForm = () => {
     // Basic required field checks (trimming values)
     if (!name.trim()) {
      setStatusMessage({ text: "Name is required.", type: "error" });
      return false;
    }
    if (!email.trim()) {
      setStatusMessage({ text: "Email is required.", type: "error" });
      return false;
    }
     if (!mobile.trim()) {
      setStatusMessage({ text: "Mobile number is required.", type: "error" });
      return false;
    }
    if (!course.trim()) {
      setStatusMessage({ text: "Course selection is required.", type: "error" });
      return false;
    }
     if (!location.trim()) {
      setStatusMessage({ text: "Location is required.", type: "error" });
      return false;
    }

    // Specific format/length checks
    if (name.length > 50) {
      setStatusMessage({ text: "Name should be less than 50 characters.", type: "error" });
      return false;
    }
    if (!/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      setStatusMessage({ text: "Please enter a valid 10-digit mobile number.", type: "error" });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatusMessage({ text: "Please enter a valid email address.", type: "error" });
      return false;
    }
    if (course.length > 100) { // Increased limit
      setStatusMessage({ text: "Course name seems too long.", type: "error" });
      return false;
    }
     if (location.length > 100) { // Increased limit
      setStatusMessage({ text: "Location seems too long.", type: "error" });
      return false;
    }
    if (!isChecked) {
      setStatusMessage({ text: "Please accept the terms and conditions.", type: "error" });
      return false;
    }

    // Clear validation error message if all checks pass
    setStatusMessage({ text: "", type: "" });
    return true;
  };


  // --- Form Submission Handler (using alert for backend errors) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser submission

    // Run validation
    if (!validateForm()) {
      // Validation failed, statusMessage is already set by validateForm
      return;
    }

    setIsSubmitting(true); // Set loading state
    setStatusMessage({ text: "", type: "" }); // Clear previous messages

    // Prepare payload for the backend API
    // Include countryCode
    const formData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      contact: mobile.replace(/\D/g, ''), // Ensure only digits
      countryCode: countryCode, // <<< Included default country code
      coursename: course.trim(),
      location: location.trim(),
      // date field removed - backend handles createdAt
    };

    try {
      // --- Send data to backend API ---
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        console.error("API URL (NEXT_PUBLIC_API_URL) is not set.");
        // Use alert for config errors too
        alert("Configuration error. Cannot submit form.");
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting formData:", formData);

      const response = await axios.post(`${apiUrl}/api/submit`, formData);

      // --- Handle Success (Backend responded with 2xx) ---
      console.log("PopupForm submitted successfully:", response.data);
      // Use status message for success
      setStatusMessage({ text: response.data.message || "Registration complete!", type: "success" });

      if (typeof onSubmitData === "function") {
        onSubmitData(formData);
      }

      setTimeout(() => {
        setName("");
        setMobile("");
        setEmail("");
        setCourse("");
        setLocation("");
        setIsChecked(false);
        setStatusMessage({ text: "", type: "" });
        setIsVisible(false);
        document.body.classList.add(styles.popupClosedManually);
      }, 2500);

    } catch (error) {
        // --- Handle Errors (Uses alert for feedback) ---
        console.error("--- Error During PopupForm Submission ---");
        console.error("Raw Error Object:", error);

        let alertMessage = "An error occurred while submitting. Please try again."; // Default

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const status = error.response.status;
                const responseData = error.response.data;
                console.error(`Response Status: ${status}`);
                console.error("Raw Response Data:", responseData);

                if (status === 400) {
                     // Use the specific backend message for 400 errors
                    alertMessage = responseData?.message || "Submission failed. Please check your input.";
                    console.log("Backend 400 message for alert:", alertMessage);
                } else {
                    alertMessage = `Submission failed due to a server issue (Status: ${status}). Please try again later.`;
                }
            } else if (error.request) {
                alertMessage = "Cannot reach the server. Check connection or try again later.";
            } else {
                alertMessage = `Application error before sending: ${error.message}`;
            }
        } else {
            alertMessage = `Unexpected application error: ${error.message || 'Unknown error'}`;
        }
        // Display the determined error message using alert()
        alert(alertMessage);
        // Optionally set status message as well if you want redundancy
        // setStatusMessage({ text: alertMessage, type: "error" });

    } finally {
      // Ensure loading state is turned off regardless of success or failure
      setIsSubmitting(false);
    }
  };

  // Handle manual close button click
  const handleClose = () => {
      setIsVisible(false);
      document.body.classList.add(styles.popupClosedManually);
  }

  // --- JSX Rendering (Original Structure) ---
  if (!isVisible) return null;

  return (
    <div className={styles.popupFormOverlay}>
      <div className={styles.popupFormContainer}>
        {/* Lightning border effect */}
        <div className={styles.lightningBorder}>
          <div className={`${styles.lightningEdge} ${styles.top}`}></div>
          <div className={`${styles.lightningEdge} ${styles.right}`}></div>
          <div className={`${styles.lightningEdge} ${styles.bottom}`}></div>
          <div className={`${styles.lightningEdge} ${styles.left}`}></div>
        </div>

        <button
          className={styles.closeButton}
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="Close registration form"
        >
          X
        </button>
        <div className={styles.headerContainer}>
          <img
            src="https://i.imgur.com/zQll9tI.png"
            alt="Connecting Dots ERP Logo"
            className={styles.logo}
          />
          <h2>Register Now!</h2>
        </div>

        {/* Status Message Area (Used for success/frontend validation) */}
        {statusMessage.text && (
          <div
            id="popup-status"
            className={`${styles.statusMessage} ${styles[statusMessage.type]}`}
            role={statusMessage.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            >
            {statusMessage.text}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            placeholder="Name*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength="50"
            disabled={isSubmitting}
            aria-describedby="popup-status" // Can still link to general status
          />
          <input
            type="email"
            placeholder="E-mail*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            aria-describedby="popup-status"
          />
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Mobile Number*"
            value={mobile}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 10) { setMobile(value); }
            }}
            required
            pattern="\d{10}"
            maxLength="10"
            disabled={isSubmitting}
            aria-describedby="popup-status"
          />
          <input
            type="text"
            placeholder="Which course are you looking for?*"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
            maxLength="100" // Use consistent limits
            disabled={isSubmitting}
            aria-describedby="popup-status"
          />
          <input
            type="text"
            placeholder="Add your Location*"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            maxLength="100" // Use consistent limits
            disabled={isSubmitting}
            aria-describedby="popup-status"
          />
          <div className={styles.termsCheckbox}>
            <span>
              <input
                type="checkbox"
                id="popup-terms"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                required
                disabled={isSubmitting}
                aria-describedby="popup-status"
              />
            </span>
            <label htmlFor="popup-terms">
              I hereby accept the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                terms and conditions
              </a>{" "}
              and
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                {" "}
                privacy policy
              </a>{" "}
              of Connecting Dots ERP.
            </label>
             {/* No inline error span for terms */}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={isSubmitting ? styles.submitting : ""}
          >
            {isSubmitting ? (
              <>
                <span className={styles.buttonText}>Registering</span>
                <span className={styles.buttonLoader}></span>
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;
