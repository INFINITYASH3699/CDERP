"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios"; // Ensure axios is imported
import styles from "@/styles/Stickyform.module.css";
import { usePathname } from "next/navigation";

// Define countryCodes array with phone number length requirements
const countryCodes = [
  { code: "+1", country: "USA", minLength: 10, maxLength: 10 },
  { code: "+91", country: "India", minLength: 10, maxLength: 10 },
  { code: "+44", country: "UK", minLength: 10, maxLength: 11 },
  { code: "+61", country: "Australia", minLength: 9, maxLength: 9 },
  { code: "+81", country: "Japan", minLength: 10, maxLength: 11 },
  { code: "+49", country: "Germany", minLength: 10, maxLength: 11 },
  { code: "+33", country: "France", minLength: 9, maxLength: 9 },
  { code: "+86", country: "China", minLength: 11, maxLength: 11 },
  { code: "+7", country: "Russia", minLength: 10, maxLength: 10 },
  { code: "+39", country: "Italy", minLength: 9, maxLength: 10 },
  { code: "+55", country: "Brazil", minLength: 10, maxLength: 11 },
  { code: "+34", country: "Spain", minLength: 9, maxLength: 9 },
  { code: "+27", country: "South Africa", minLength: 9, maxLength: 9 },
  { code: "+971", country: "UAE", minLength: 9, maxLength: 9 },
  { code: "+62", country: "Indonesia", minLength: 10, maxLength: 12 },
  { code: "+90", country: "Turkey", minLength: 10, maxLength: 10 },
  { code: "+82", country: "South Korea", minLength: 9, maxLength: 10 },
  { code: "+60", country: "Malaysia", minLength: 9, maxLength: 10 },
  { code: "+31", country: "Netherlands", minLength: 9, maxLength: 9 },
  { code: "+52", country: "Mexico", minLength: 10, maxLength: 10 },
];

const SContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    course: "",
    email: "",
    countryCode: "+91",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const footerRef = useRef(null);

  const pathname = usePathname();

  // List of paths where the form should be hidden
  const hiddenPaths = ['/dashboard', '/superadmin'];

  useEffect(() => {
    // When component mounts, find the footer element in the DOM
    const footerElement = document.querySelector("footer");
    if (footerElement) {
      footerRef.current = footerElement;
    }
  }, []);

  useEffect(() => {
    // Check if current path is in the hiddenPaths list
    const shouldHideBasedOnPath = hiddenPaths.some(path => pathname?.startsWith(path));
    
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);

      // On resize, check footer visibility to set form state
      if (!isMobile && !shouldHideBasedOnPath) {
        checkFooterVisibility();
      } else {
        setIsFormVisible(false);
      }
    };

    // Function to check if any part of the footer is visible
    const checkFooterVisibility = () => {
      if (!footerRef.current) return;

      const rect = footerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // If ANY part of the footer is visible in the viewport, hide the form
      if (rect.top < windowHeight && rect.bottom >= 0) {
        setIsFormVisible(false);
      } else {
        // Footer is not in viewport at all
        setIsFormVisible(!shouldHideBasedOnPath);
      }
    };

    const handleScroll = () => {
      if (!isMobileView && !shouldHideBasedOnPath) {
        checkFooterVisibility();

        // Extra check for when scrolled to bottom of page
        const isAtBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 20; // 20px buffer

        if (isAtBottom) {
          setIsFormVisible(false);
        }
      }
    };

    // Initialize - hide form if on restricted paths
    if (shouldHideBasedOnPath) {
      setIsFormVisible(false);
    } else {
      handleResize();
    }

    // Add event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileView, pathname, hiddenPaths]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      // Allow only digits for phone numbers
      const digitsOnly = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validate = () => {
    const newErrors = {};
    const { name, email, contact, countryCode, course } = formData;

    // Basic trim and presence checks
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!course) newErrors.course = "Please select a course";

    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailPattern.test(email.trim()))
      newErrors.email = "Please enter a valid email";

    // Contact number validation based on country code
    const selectedCountry = countryCodes.find((c) => c.code === countryCode);
    if (selectedCountry) {
      const { minLength, maxLength } = selectedCountry;
      const contactDigits = contact.replace(/\D/g, "");
      if (
        !contactDigits ||
        contactDigits.length < minLength ||
        contactDigits.length > maxLength
      ) {
        newErrors.contact = `Enter a valid ${minLength === maxLength ? minLength : `${minLength}-${maxLength}`}-digit number for ${selectedCountry.country}`;
      } else if (!/^\d+$/.test(contactDigits)) {
        newErrors.contact = "Phone number should contain only digits";
      }
    } else {
      newErrors.contact = "Please select a valid country code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      console.warn("Validation failed:", errors); // Log errors for debugging
      return; // Stop submission if validation fails
    }

    setIsSubmitting(true); // Show loading state

    const submissionData = {
      name: formData.name.trim(),
      contact: formData.contact,
      countryCode: formData.countryCode,
      email: formData.email.trim(),
      coursename: formData.course,
      location: "", // Optional; add real location if needed
    };

    try {
      // --- Send data to backend API ---
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        console.error("API URL (NEXT_PUBLIC_API_URL) is not set.");
        alert("Configuration error. Cannot submit form.");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(`${apiUrl}/api/submit`, submissionData);

      // --- Handle.Success (Status 2xx) ---
      console.info("Form submitted successfully with response:", response);
      alert(response.data.message || "Thank You! Form successfully submitted.");

      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);

      // Reset form fields on successful submission
      setFormData({
        name: "",
        contact: "",
        course: "",
        email: "",
        countryCode: "+91",
      });
      // Optionally reset form visibility
      // setIsFormVisible(false);
    } catch (error) {
      console.error("Submission error:", error); // Detailed error log

      let errorMessage =
        "An error occurred while submitting. Please try again."; // Default message

      if (axios.isAxiosError(error)) {
        console.error("Axios error detected.");
        if (error.response) {
          const status = error.response.status;
          const responseData = error.response.data;
          console.error(
            `Error status: ${status}, Response Data: `,
            responseData
          );

          if (status === 400 && responseData?.message) {
            errorMessage = responseData.message; // Use specific backend message
          } else {
            errorMessage = `Server error (Status: ${status}). Try again later.`;
          }
        } else if (error.request) {
          console.error("No response received from server:", error.request);
          errorMessage =
            "Cannot reach the server. Please check your connection.";
        } else {
          console.error("Error in setting up the request:", error.message);
          errorMessage = `Error before sending: ${error.message}`;
        }
      } else {
        console.error("Unexpected error:", error);
        errorMessage = `Unexpected error: ${error.message}`;
      }

      alert(errorMessage); // Show error message if submission fails
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the selected country to display length requirements in placeholder
  const selectedCountry = countryCodes.find(
    (country) => country.code === formData.countryCode
  );
  const contactPlaceholder = selectedCountry
    ? `Enter ${
        selectedCountry.minLength === selectedCountry.maxLength
          ? selectedCountry.minLength
          : `${selectedCountry.minLength}-${selectedCountry.maxLength}`
      } digits`
    : "Enter phone number";

  return (
    <>
      {!isMobileView && isFormVisible && (
        <div className={styles.stickyformContainer}>
          <form
            onSubmit={handleSubmit}
            className={styles.contactFormS}
            noValidate
          >
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="E.g., Ram"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? styles.inputError : ""}
                  required
                  maxLength="50"
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <span
                    id="name-error"
                    className={styles.errorText}
                    role="alert"
                  >
                    {errors.name}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="E.g., ram@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? styles.inputError : ""}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <span
                    id="email-error"
                    className={styles.errorText}
                    role="alert"
                  >
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact" className={styles.formLabel}>
                  Contact Number
                </label>
                <div className={styles.contactField}>
                  <select
                    id="countryCode"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    aria-label="Select Country Code"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>
                        ({code}) {country}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    id="contact"
                    name="contact"
                    placeholder={contactPlaceholder}
                    value={formData.contact}
                    onChange={handleChange}
                    className={errors.contact ? styles.inputError : ""}
                    maxLength={selectedCountry?.maxLength || 15}
                    required
                    aria-required="true"
                    aria-invalid={!!errors.contact}
                    aria-describedby={
                      errors.contact ? "contact-error" : undefined
                    }
                  />
                </div>
                {errors.contact && (
                  <span
                    id="contact-error"
                    className={styles.errorText}
                    role="alert"
                  >
                    {errors.contact}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="course" className={styles.formLabel}>
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={errors.course ? styles.inputError : ""}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.course}
                  aria-describedby={errors.course ? "course-error" : undefined}
                >
                  <option value="" disabled>
                    Select a course
                  </option>
                  <option value="SAP">SAP</option>
                  <option value="IT Courses">IT Courses</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Data Visualisation">Data Visualisation</option>
                  <option value="HR Courses">HR Courses</option>
                </select>
                {errors.course && (
                  <span
                    id="course-error"
                    className={styles.errorText}
                    role="alert"
                  >
                    {errors.course}
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showPopup && (
        <div className={styles.popup}>Thank you for submitting!</div>
      )}
    </>
  );
};

export default SContactForm;