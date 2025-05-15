"use client";

import React, { useState } from "react";
import axios from "axios"; // Ensure axios is imported
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "@/styles/HomePage/Btnform.module.css";
import { User, Mail, Phone, MapPin, X, CheckCircle } from "lucide-react";

// Country codes with flags (Unicode) and phone number lengths
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

const Btnform = ({ onClose, course }) => {
  // Added course prop if needed
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    location: "",
    countryCode: "+91", // Default country code
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Frontend validation logic
  const validate = () => {
    const newErrors = {};
    const { name, email, contact, countryCode, location } = formData;

    if (!name || !name.trim()) {
      newErrors.name = "Name is required";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Find selected country for validation rules
    const selectedCountry = countryCodes.find((c) => c.code === countryCode);

    if (selectedCountry) {
      const { minLength, maxLength } = selectedCountry;
      const contactDigits = contact.replace(/\D/g, ""); // Ensure we're checking digits

      if (
        !contactDigits ||
        contactDigits.length < minLength ||
        contactDigits.length > maxLength
      ) {
        newErrors.contact = `Please enter a valid ${
          minLength === maxLength ? minLength : `${minLength}-${maxLength}`
        }-digit number for ${selectedCountry.country}`;
      } else if (!/^\d+$/.test(contactDigits)) {
        // This check might be redundant due to replace(/\D/g, ''), but good safeguard
        newErrors.contact = "Phone number should contain only digits";
      }
    } else {
      // Fallback if country code somehow isn't found
      if (!contact || !/^\d{7,15}$/.test(contact.replace(/\D/g, ""))) {
        newErrors.contact = "Please enter a valid phone number";
      }
    }

    if (!location || !location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === "contact") {
      // Allow only digits for phone numbers
      processedValue = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear the specific error when the user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Perform frontend validation first
    if (!validate()) {
      console.log("Frontend validation failed:", errors);
      // Optionally alert the first error or rely on inline errors
      // const firstErrorKey = Object.keys(errors).find(key => errors[key]);
      // if (firstErrorKey) alert(errors[firstErrorKey]);
      return; // Stop submission if validation fails
    }

    setIsSubmitting(true); // Show loading indicator

    // Prepare data payload (ensure all necessary fields are included)
    const payload = {
      ...formData,
      coursename: course || "General Inquiry", // Include course name if available, else default
    };

    try {
      // --- Send data to backend API ---
      // Use environment variable for API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        console.error(
          "API URL environment variable (NEXT_PUBLIC_API_URL) is not set."
        );
        // Set error state or alert user
        alert("Configuration error. Cannot submit form.");
        setIsSubmitting(false); // Make sure to stop loading state
        return;
      }

      const response = await axios.post(`${apiUrl}/api/submit`, payload);

      // --- Handle Success ---
      console.log("Form submitted successfully:", response.data);
      setShowThankYou(true); // Show thank you message

      // Optionally reset form fields after successful submission
      setFormData({
        name: "",
        email: "",
        contact: "",
        location: "",
        countryCode: "+91", // Reset to default country code
      });
      setErrors({}); // Clear any previous errors

      // Close the form/modal after a delay
      setTimeout(() => {
        setShowThankYou(false);
        if (onClose) onClose(); // Call the onClose prop if provided
      }, 3000); // 3 seconds delay
    } catch (error) {
      // --- Handle Errors ---
      // Ensure loading state is turned off even if there's an error
      setIsSubmitting(false);

      console.error("--- Error During Form Submission (Btnform) ---");
      console.error("Raw Error Object:", error);
      if (error.config) {
        console.error("Request Config:", error.config);
      }

      let errorMessage =
        "An error occurred while submitting. Please try again."; // Default

      if (axios.isAxiosError(error)) {
        console.error("Axios error detected.");
        if (error.response) {
          // Got a response from the server (but not status 2xx)
          const status = error.response.status;
          const responseData = error.response.data;
          const responseHeaders = error.response.headers;

          console.error(`Response Status: ${status}`);
          console.error("Raw Response Data:", responseData);
          console.error("Type of Response Data:", typeof responseData);
          console.error("Response Headers:", responseHeaders);

          if (status === 400) {
            // Check if the backend sent the expected message format
            if (
              responseData &&
              typeof responseData === "object" &&
              responseData.message
            ) {
              errorMessage = responseData.message; // Use the specific backend message
              console.log(
                "Successfully extracted backend message:",
                errorMessage
              );
            } else {
              console.warn(
                "Received 400 status, but 'message' field missing or data format incorrect in response. Response data was:",
                responseData
              );
              errorMessage =
                "Submission failed. Please check your input values.";
            }
          } else {
            // Handle other server errors (5xx, 404, 403 etc.)
            errorMessage = `Submission failed due to a server issue (Status: ${status}). Please try again later.`;
          }
        } else if (error.request) {
          // Request was made, but no response received
          console.error("No response received from server:", error.request);
          errorMessage =
            "Cannot reach the server. Please check your internet connection or try again later.";
        } else {
          // Error setting up the request with Axios
          console.error("Axios request setup error:", error.message);
          errorMessage = `An application error occurred before sending: ${error.message}`;
        }
      } else {
        // Error is not from Axios
        console.error("Non-Axios error:", error);
        errorMessage = `An unexpected application error occurred: ${error.message || "Unknown error"}`;
      }

      alert(errorMessage); // Show the determined message to the user
    }
    // Removed finally block as setIsSubmitting(false) is handled in both success (implicitly via reset/close) and error paths now.
  };

  // Find the selected country to display length requirements in placeholder
  const selectedCountry = countryCodes.find(
    (country) => country.code === formData.countryCode
  );
  const placeholderText = selectedCountry
    ? `Enter ${
        selectedCountry.minLength === selectedCountry.maxLength
          ? selectedCountry.minLength
          : `${selectedCountry.minLength}-${selectedCountry.maxLength}`
      } digit number`
    : "Enter phone number";

  return (
    <div className={styles.formModal}>
      <div className={styles.formContainer}>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close form"
        >
          <X size={24} />
        </button>

        <div className={styles.formHeader}>
          <img
            // Consider using next/image for optimization if applicable
            src="https://mlir9digcwm2.i.optimole.com/cb:X1mK.5e5cf/w:620/h:191/q:mauto/https://connectingdotserp.in/wp-content/uploads/2024/07/Original-Logo.png"
            alt="Connecting Dots ERP Logo" // More descriptive alt text
            className={styles.logo}
          />
          <h2>Get In Touch with Our Team!</h2>
          <p>We&apos;d love to hear from you! Fill out the form below.</p>
        </div>

        {/* Form Element */}
        <form onSubmit={handleSubmit} className={styles.contactForm} noValidate>
          {/* Name Field */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>
              Full Name
            </label>{" "}
            {/* Added class */}
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} aria-hidden="true" />{" "}
              {/* Adjusted icon size */}
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`${styles.formInput} ${
                  errors.name ? styles.inputError : ""
                }`}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
            </div>
            {errors.name && (
              <span id="name-error" className={styles.errorText} role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email Address
            </label>{" "}
            {/* Added class */}
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} aria-hidden="true" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`${styles.formInput} ${
                  errors.email ? styles.inputError : ""
                }`}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <span id="email-error" className={styles.errorText} role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone Number Field (Combined Country Code + Number) */}
          <div className={styles.formGroup}>
            <label htmlFor="contact" className={styles.formLabel}>
              Phone Number
            </label>{" "}
            {/* Added class */}
            <div className={styles.phoneInputWrapper}>
              {" "}
              {/* Wrapper for select + input */}
              <select
                name="countryCode"
                id="countryCode" // Added ID for label association
                value={formData.countryCode}
                onChange={handleChange}
                className={styles.countryCodeSelect}
                aria-label="Select Country Code" // Aria label for accessibility
              >
                {countryCodes.map(({ code, country }) => (
                  <option key={code} value={code}>
                    {`${code} (${country})`} {/* Clearer format */}
                  </option>
                ))}
              </select>
              <div className={styles.phoneNumberWrapper}>
                {" "}
                {/* Specific wrapper for icon + number input */}
                <Phone
                  className={styles.inputIco}
                  size={18}
                  aria-hidden="true"
                />{" "}
                {/* Adjusted icon */}
                <input
                  type="tel" // Use tel type
                  inputMode="numeric" // Suggest numeric keyboard
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder={placeholderText}
                  className={`${styles.phoneNumberInput} ${
                    // Use specific class
                    errors.contact ? styles.inputError : ""
                  }`}
                  maxLength={selectedCountry?.maxLength || 15} // Dynamic max length
                  aria-required="true"
                  aria-invalid={!!errors.contact}
                  aria-describedby={
                    errors.contact ? "contact-error" : undefined
                  }
                />
              </div>
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

          {/* Location Field */}
          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.formLabel}>
              Location
            </label>{" "}
            {/* Added class */}
            <div className={styles.inputWrapper}>
              <MapPin
                className={styles.inputIcon}
                size={18}
                aria-hidden="true"
              />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your city or location" // Slightly more specific placeholder
                className={`${styles.formInput} ${
                  errors.location ? styles.inputError : ""
                }`}
                aria-required="true"
                aria-invalid={!!errors.location}
                aria-describedby={
                  errors.location ? "location-error" : undefined
                }
              />
            </div>
            {errors.location && (
              <span
                id="location-error"
                className={styles.errorText}
                role="alert"
              >
                {errors.location}
              </span>
            )}
          </div>

          {/* Form Actions (Submit/Reset Buttons) */}
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            {/* Consider if reset button is needed, can sometimes cause accidental data loss */}
            {/* <button
              type="button" // Change to type="button" to prevent form submission
              className={styles.resetButton}
              onClick={() => {
                  setFormData({ name: "", email: "", contact: "", location: "", countryCode: "+91"});
                  setErrors({}); // Clear errors on reset
                }
              }
              disabled={isSubmitting} // Disable reset while submitting
            >
              Clear Form
            </button> */}
          </div>
        </form>
      </div>

      {/* Thank You Modal/Overlay */}
      {showThankYou && (
        <div className={styles.thankYouOverlay}>
          <div className={styles.thankYouContent}>
            <CheckCircle size={64} color="#28a745" />
            <h2>Thank You!</h2>
            <p>Your message has been successfully submitted.</p>
            {/* Optional: Add a button to explicitly close the thank you message */}
            {/* <button onClick={() => setShowThankYou(false)}>Close</button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Btnform;
