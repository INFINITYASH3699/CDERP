"use client";

import { useState, useEffect, useContext } from "react";
import { FaPhone, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { CityContext } from "@/context/CityContext";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "@/styles/ContactUs.module.css";

const ContactUsClientContent = ({
  formData = {},
  setFormData,
  handleSubmit: propHandleSubmit,
  isSubmitting: propIsSubmitting,
  submissionError: propSubmissionError,
}) => {
  const { city } = useContext(CityContext);

  // Google Maps API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDBGFl3pJw6rBm6R0eX5vPZNLVkZgfcvh8",
  });

  const mapContainerStyle = {
    width: "100%",
    height: "200px",
  };

  // Local state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Initialize form data with explicit default values
  const [localFormData, setLocalFormData] = useState({
    name: formData.name || "",
    contact: formData.contact || "",
    email: formData.email || "",
    course: formData.course || "",
    countryCode: "+91", // Explicitly set default country code
  });

  useEffect(() => {
    // Log form data whenever it changes (debug)
    console.log("Current form data:", localFormData);
  }, [localFormData]);

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

  // Branches information
  const branches = [
    {
      name: "PUNE BRANCH",
      phone: ["+91 9004002941", "+91 9004002958"],
      whatsapp: "https://wa.me/919004002941",
      position: { lat: 18.588048051275003, lng: 73.78119014757031 },
      address: "https://maps.app.goo.gl/v9UAPKTsSiT56VhC9",
      addresstext:
        "1st Floor,101, Police, Wireless Colony, Vishal Nagar, Pimple Nilakh, Pune, Pimpri-Chinchwad, Maharashtra 411027",
    },
    {
      name: "MUMBAI BRANCH",
      phone: ["+91 9004001938", "+91 9004005382"],
      whatsapp: "https://wa.me/919004005382",
      position: { lat: 19.259055941077712, lng: 72.96564544031934 },
      address: "https://maps.app.goo.gl/i7W3baVVS1mDLmTJ9",
      addresstext:
        "4th Floor, Ram Niwas, B-404, Gokhale Rd, near McDonald's, Dada Patil Wadi, Naupada, Thane West, Thane, Maharashtra 400602",
    },
    {
      name: "RAIPUR BRANCH",
      phone: ["+91 9004002958", "+91 9325701555"],
      whatsapp: "https://wa.me/919325701555",
      position: { lat: 21.23944689267376, lng: 81.65363342070017 },
      address: "https://maps.app.goo.gl/F1HVVYHfApaRvFMRA",
      addresstext:
        "G-54, New Panchsheel Nagar, Civil Lines, Raipur, Chhattisgarh 492001",
    },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    console.log(`Field changed: ${name} = ${value}`);

    // If it's the contact field, remove non-digit characters
    if (name === "contact") {
      const digitsOnly = value.replace(/\D/g, "");
      setLocalFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setLocalFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Also update parent state if provided
    if (setFormData) {
      if (name === "contact") {
        const digitsOnly = value.replace(/\D/g, "");
        setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    console.log("Form submission:", localFormData);
    console.log("Country code:", localFormData.countryCode);

    // Validate required fields
    if (!localFormData.name || !localFormData.email || !localFormData.contact) {
      setSubmissionError("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    // Fix for undefined country code - use default if not set
    const countryCode = localFormData.countryCode || "+91";

    // Get the selected country code details
    const selectedCountry = countryCodes.find(
      (country) => country.code === countryCode
    );

    if (!selectedCountry) {
      setSubmissionError(`Invalid country code: "${countryCode}"`);
      setIsSubmitting(false);
      return;
    }

    const { minLength, maxLength } = selectedCountry;

    // Check if phone number length is valid for the selected country
    if (
      localFormData.contact.length < minLength ||
      localFormData.contact.length > maxLength
    ) {
      setSubmissionError(
        `Phone number for ${selectedCountry.country} must be between ${minLength} and ${maxLength} digits`
      );
      setIsSubmitting(false);
      return;
    }

    // Check if phone number contains only digits
    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(localFormData.contact)) {
      setSubmissionError("Phone number must contain only digits");
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(localFormData.email)) {
      setSubmissionError("Enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare the submission data
      const submissionData = {
        name: localFormData.name,
        contact: localFormData.contact,
        email: localFormData.email,
        coursename: localFormData.course, // Use coursename for API compatibility
        countryCode: countryCode, // Use the fixed countryCode
      };

      console.log("Submitting data:", submissionData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Submission failed");

      alert("Form submitted successfully!");

      // Reset the form
      setLocalFormData({
        name: "",
        contact: "",
        email: "",
        course: "",
        countryCode: "+91", // Explicitly reset country code
      });
    } catch (error) {
      setSubmissionError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the current selected country's maxLength
  const getSelectedCountryMaxLength = () => {
    const countryCode = localFormData.countryCode || "+91"; // Use default if not set
    const selectedCountry = countryCodes.find(
      (country) => country.code === countryCode
    );
    return selectedCountry?.maxLength || 10;
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container my-4">
        <h2 className={styles.branchesTitle}>
          EXPLORE OUR EXPERT TECH TRAINING SOLUTIONS
        </h2>

        <div className="row gx-4 gy-4">
          {/* Contact Info Section */}
          <div className="col-lg-8 col-md-7">
            {branches.map((branch, index) => (
              <div
                key={index}
                className={`row border-bottom pb-4 mb-4 ${styles.branchInfo}`}
              >
                {/* Branch Name */}
                <h5
                  className={`fw-bold text-uppercase mb-3 ${styles.branchName}`}
                >
                  {branch.name}
                </h5>

                <div className="row g-3">
                  {/* Phone Section */}
                  <div className="col-md-4 col-sm-6">
                    <div className={styles.contactCard}>
                      <FaPhone size={30} className={styles.phoneIcon} />
                      <h6 className={styles.cardSubtitle}>Phone</h6>
                      <div className={styles.contactDetails}>
                        {branch.phone.map((num, i) => (
                          <a
                            href={`tel:${num.replace(/\s/g, "")}`}
                            key={i}
                            className={styles.contactLink}
                          >
                            {num}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Section */}
                  <div className="col-md-4 col-sm-6">
                    <div className={styles.contactCard}>
                      <FaWhatsapp size={30} className={styles.whatsappIcon} />
                      <h6 className={styles.cardSubtitle}>WhatsApp</h6>
                      <div className={styles.contactDetails}>
                        <a
                          href={branch.whatsapp}
                          className={styles.whatsappBtn}
                        >
                          Chat Now
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="col-md-4 col-sm-12">
                    <div className={styles.contactCard}>
                      <FaMapMarkerAlt
                        size={30}
                        className={styles.addressIcon}
                      />
                      <h6 className={styles.cardSubtitle}>Address</h6>
                      <div className={styles.contactDetails}>
                        <a
                          href={branch.address}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.addressLink}
                        >
                          {branch.addresstext}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form Section */}
          <div className="col-lg-4 col-md-5">
            <div className={styles.rightSectionItDs}>
              <h3>Contact Form</h3>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={localFormData.name || ""}
                    onChange={handleChange}
                    className={styles.inputField}
                    required
                  />
                </div>

                <div className={styles.phoneInputItDs}>
                  <select
                    name="countryCode" // Important: ensure this matches the state property name
                    value={localFormData.countryCode || "+91"} // Provide default value
                    onChange={handleChange}
                    className={styles.selectCountryCode}
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>
                        {code} ({country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="contact" // Important: ensure this matches the state property name
                    placeholder="Enter your phone number"
                    value={localFormData.contact || ""}
                    onChange={handleChange}
                    maxLength={getSelectedCountryMaxLength()}
                    className={styles.contactInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={localFormData.email || ""}
                    onChange={handleChange}
                    className={styles.inputField}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="course"
                    placeholder="Enter course name"
                    value={localFormData.course || ""}
                    onChange={handleChange}
                    className={styles.inputField}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitButtonItDs}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>

                {submissionError && (
                  <p className={styles.error}>{submissionError}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className={styles.branchesSection}>
        <h2 className={styles.branchesTitle}>OUR BRANCHES</h2>

        <div className={styles.branchesContainer}>
          {branches.map((branch, index) => (
            <div className={styles.branchCard} key={index}>
              <h3>{branch.name}</h3>
              <div className={styles.mapContainer}>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={branch.position}
                    zoom={13}
                  >
                    <Marker position={branch.position} />
                  </GoogleMap>
                ) : (
                  <div className={styles.loadingMap}>Loading Map...</div>
                )}
              </div>
              <div className={styles.add2}>
                <a
                  href={branch.address}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {branch.addresstext}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUsClientContent;
