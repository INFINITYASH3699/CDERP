"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import Head from "next/head";
import { CityContext } from "@/context/CityContext";
import styles from "@/styles/CoursesComponents/Header.module.css";
import Btnform from "@/components/HomePage/Btnform";

const DSHeader = ({ pageId, pageType }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ countryCode: "+91", contact: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const { city } = useContext(CityContext);
  const [showForm, setShowForm] = useState(false);

  // Store raw data without city replacement
  const [rawData, setRawData] = useState(null);

  const countryCodes = [
    { code: "+91", country: "India", minLength: 10, maxLength: 10 },
    { code: "+1", country: "USA", minLength: 10, maxLength: 10 },
    { code: "+44", country: "UK", minLength: 10, maxLength: 11 },
    { code: "+61", country: "Australia", minLength: 9, maxLength: 9 },
    { code: "+81", country: "Japan", minLength: 10, maxLength: 10 },
    { code: "+49", country: "Germany", minLength: 10, maxLength: 11 },
    { code: "+33", country: "France", minLength: 9, maxLength: 9 },
    { code: "+86", country: "China", minLength: 11, maxLength: 11 },
    { code: "+7", country: "Russia", minLength: 10, maxLength: 10 },
    { code: "+39", country: "Italy", minLength: 10, maxLength: 10 },
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

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => {
        setStatusMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Fetch data once and store raw data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load raw data from localStorage
        const cacheKey = `dsHeader_raw_${pageId}_${pageType}`;
        const cachedRawData = localStorage.getItem(cacheKey);

        if (cachedRawData) {
          setRawData(JSON.parse(cachedRawData));
        } else {
          const response = await fetch("/Jsonfolder/dsHeaderData.json");
          if (!response.ok) throw new Error("Failed to load data");

          const jsonData = await response.json();
          const pageData = jsonData[pageType]?.[pageId];

          if (pageData) {
            // Store raw data without city replacement
            localStorage.setItem(cacheKey, JSON.stringify(pageData));
            setRawData(pageData);
          } else {
            throw new Error("Page data not found");
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [pageId, pageType]); // Only depends on pageId and pageType

  // Apply city to raw data whenever city or raw data changes
  useEffect(() => {
    if (rawData && city) {
      // Create a deep copy to avoid modifying the original data
      const processedData = JSON.parse(JSON.stringify(rawData));

      // Apply city replacements
      processedData.title = processedData.title.replace(/{city}/g, city);
      processedData.subtitle = processedData.subtitle.replace(/{city}/g, city);
      processedData.description = processedData.description.replace(
        /{city}/g,
        city
      );
      processedData.features = processedData.features.map((feature) =>
        feature.replace(/{city}/g, city)
      );
      processedData.alumni = processedData.alumni.map((company) => ({
        ...company,
        name: company.name.replace(/{city}/g, city),
      }));
      processedData.buttons = processedData.buttons.map((button) => ({
        ...button,
        text: button.text.replace(/{city}/g, city),
      }));

      setData(processedData);
    }
  }, [rawData, city]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    // If it's the contact field, remove non-digit characters
    if (name === "contact") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData((prevData) => ({ ...prevData, [name]: digitsOnly }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const validateForm = () => {
    // Check if required fields are filled
    if (!formData.name || !formData.email || !formData.contact) {
      setStatusMessage({
        text: "Please fill all required fields",
        type: "error",
      });
      return false;
    }

    // Get the selected country code details
    const selectedCountry = countryCodes.find(
      (country) => country.code === formData.countryCode
    );

    if (!selectedCountry) {
      setStatusMessage({
        text: "Invalid country code",
        type: "error",
      });
      return false;
    }

    const { minLength, maxLength } = selectedCountry;

    // Check if phone number length is valid for the selected country
    if (
      formData.contact.length < minLength ||
      formData.contact.length > maxLength
    ) {
      setStatusMessage({
        text: `Phone number for ${selectedCountry.country} must be between ${minLength} and ${maxLength} digits`,
        type: "error",
      });
      return false;
    }

    // Check if phone number contains only digits
    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(formData.contact)) {
      setStatusMessage({
        text: "Phone number must contain only digits",
        type: "error",
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatusMessage({
        text: "Please enter a valid email address",
        type: "error",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form first
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ text: "", type: "" });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Submission failed. Please try again.");
      }

      setStatusMessage({
        text: "Form submitted successfully!",
        type: "success",
      });

      // Reset form fields after successful submission
      setFormData({
        name: "",
        email: "",
        course: "",
        countryCode: "+91",
        contact: "",
      });
    } catch (error) {
      setStatusMessage({
        text: error.message || "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;
  if (!data) return <div>No data available for the specified page.</div>;

  return (
    <div className={styles.containerItDsHeader}>
      <Head>
        <title>{data.title || "Default Title"}</title>
        <meta
          name="description"
          content={data.description || "Default description"}
        />
        <meta
          name="keywords"
          content={data.keywords?.join(", ") || "Default, Keywords"}
        />
      </Head>

      {/* 🔹 Background Video */}
      <video
        className={styles.backgroundVideo}
        src="https://i.imgur.com/DpOvcpk.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div className={styles.leftSectionItDs}>
        <h1>
          <span className={styles.dsHeaderSpan}>{data.title}</span>
        </h1>
        <h2>
          <span className={styles.dsHeaderSpan2}>{data.subtitle}</span>
        </h2>
        <p>{data.description}</p>
        <ul className={styles.featuresItDs}>
          {data.features.map((feature, index) => (
            <li className={styles.featuresItDsli} key={index}>
              {feature}
            </li>
          ))}
        </ul>
        <div className={styles.alumniItDs}>
          <span>Find our Alumni at -</span>
          <div className={styles.alumniLogosItDs}>
            {data.alumni.map((company, index) => (
              <img
                key={index}
                src={company.logo}
                alt={`${company.name} logo`}
              />
            ))}
          </div>
        </div>
        <div className={styles.buttons}>
          {data.buttons.map((button, index) => (
            <button
              key={index}
              className={
                index === 0 ? styles.buttonStyle1 : styles.buttonStyle2
              }
              onClick={handleButtonClick}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.rightSectionItDs}>
        <h3>{data.form.title}</h3>

        {statusMessage.text && (
          <div
            className={`${styles.statusMessage} ${styles[statusMessage.type]}`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {data.form?.inputs?.map((input, index) => {
            if (input.countryCode) {
              // Find the selected country to get its maxLength
              const selectedCountry = countryCodes.find(
                (country) => country.code === formData.countryCode
              );
              const maxLength = selectedCountry?.maxLength || 10;

              return (
                <div key={index} className={styles.phoneInputItDs}>
                  <div className={styles.countryCodeWrapper}>
                    <select
                      id="countryCode"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className={styles.selectCountryCode}
                      disabled={isSubmitting}
                    >
                      {countryCodes.map(({ code, country }) => (
                        <option key={code} value={code}>
                          {code} ({country})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    placeholder="Enter your phone number"
                    value={formData.contact}
                    onChange={handleChange}
                    maxLength={maxLength}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              );
            } else {
              return (
                <input
                  key={index}
                  type={input.type}
                  name={input.name}
                  placeholder={input.placeholder}
                  className={styles.input}
                  value={formData[input.name] || ""}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              );
            }
          })}

          <button
            type="submit"
            className={`${styles.submitButtonItDs} ${isSubmitting ? styles.loading : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.buttonText}>Submitting</span>
                <span className={styles.buttonLoader}></span>
              </>
            ) : (
              data.form.submitText
            )}
          </button>
        </form>
      </div>

      {showForm && <Btnform onClose={handleCloseForm} />}
    </div>
  );
};

export default DSHeader;
