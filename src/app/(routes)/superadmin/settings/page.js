"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaSpinner,
  FaCog,
  FaCheck,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  // Removed icons that are now in the reusable Sidebar
  // FaUserCog, FaUsers, FaChartBar, FaClipboardList,
  // FaHistory, FaSignOutAlt, FaTachometerAlt, FaKey,
} from "react-icons/fa";
// Removed Link import from here as it's used within the Sidebar
// import Link from "next/link";

import Sidebar from "@/components/superadmin/Sidebar"; // Import reusable Sidebar
import AccessControl from "@/components/superadmin/AccessControl"; // Import reusable AccessControl
import { fetchWithAuth } from "@/utils/auth"; // Import reusable fetch utility

// Removed the inline SuperAdminLayout Component definition
// Removed the inline fetchWithAuth utility definition

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userRole, setUserRole] = useState(null); // State to track user role
  const [totalLeads, setTotalLeads] = useState(0); // Default or placeholder
  const [sliderValue, setSliderValue] = useState(0);
  const router = useRouter();

  // Authentication check and initial data fetch
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");
    setUserRole(role); // Set user role state

    if (!token) {
      router.push("/AdminLogin");
      return; // Stop further execution if not authenticated
    }

    // The AccessControl component will handle showing the restricted message
    // for non-SuperAdmins. We still fetch data if authenticated, but the UI
    // will be restricted by AccessControl.

    fetchSettings();
    fetchLeadCount(); // Fetch lead count for the slider max value

  }, [router]); // Depend on router for initial check

  // Update the slider value when settings change and settings data is available
  useEffect(() => {
    if (settings.length > 0) {
      const maxLeadsSetting = settings.find(s => s.key === 'maxLeadsToDisplay');
      if (maxLeadsSetting !== undefined) { // Use !== undefined to handle value being 0
        setSliderValue(maxLeadsSetting.value);
      }
    }
  }, [settings]); // Depend on settings state


  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Use empty string as fallback
       if (!apiUrl) {
            console.error("NEXT_PUBLIC_API_URL is not defined");
            setError("API URL is not configured.");
            setLoading(false);
            return;
       }

      const response = await fetchWithAuth(
        `${apiUrl}/api/settings`
      );

      if (!response.ok) {
         const errorText = await response.text();
         console.error("Failed to fetch settings response:", response.status, errorText);
        throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Filter out location-based settings keys you don't want to display here
      // This list should match the keys your API might return but you want to ignore
      const excludedKeys = [
        'enableLocationAutoAssign',
        'enableLocationBasedAssignment',
        'locationAssignments',
        'locationBasedAssignment',
        // Add any other keys you don't want to display in the general settings list
      ];

      const filteredSettings = Array.isArray(data) ? data.filter(setting =>
        !excludedKeys.includes(setting.key)
      ) : [];


      setSettings(filteredSettings);

    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.message || "Failed to fetch settings. Please try again.");
      setSettings([]); // Clear settings on error
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadCount = async () => {
    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
       if (!apiUrl) {
           console.error("API URL is not configured, cannot fetch lead count.");
           return; // Don't try fetching if API URL is not set
       }
      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/count` // Assuming you have a lead count endpoint
      );

      if (!response.ok) {
         const errorText = await response.text();
         console.error("Failed to fetch lead count response:", response.status, errorText);
        throw new Error(`Failed to fetch lead count: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
       // Assuming the response is like { count: number }
      setTotalLeads(data.count || 0); // Use fetched count, default to 0 if 0 or undefined
    } catch (err) {
      console.error("Error fetching lead count:", err);
      // Keep the default or previous totalLeads value
    }
  };


  const updateSetting = async (key, value) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
       if (!apiUrl) {
            throw new Error("API URL is not configured.");
       }

       // Find the current description for the setting key
       const currentSetting = settings.find(s => s.key === key);
       const descriptionToSend = currentSetting?.description || "";

      const response = await fetchWithAuth(
        `${apiUrl}/api/settings/${key}`, // Assuming endpoint is /api/settings/:key
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: value, // Send the new value
            description: descriptionToSend // Send existing description or empty string
          }),
        }
      );

      if (!response.ok) {
         const errorData = await response.json();
         console.error(`Failed to update setting ${key} response:`, response.status, errorData);
        throw new Error(errorData.message || `Failed to update setting: ${response.statusText}`);
      }

      // Update the local state with the new value
      setSettings(prevSettings =>
        prevSettings.map(setting =>
          setting.key === key ? { ...setting, value: value } : setting
        )
      );

      setSuccess(`Setting "${key}" updated successfully.`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error(`Error updating setting ${key}:`, err);
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key) => {
    const setting = settings.find(s => s.key === key);
    if (setting) {
      updateSetting(key, !setting.value); // Toggle boolean value
    } else {
        console.warn(`Setting with key "${key}" not found to toggle.`);
    }
  };

  // Function to render different setting types
  const renderSetting = (setting) => {
    // Filter out excluded keys here as well, although already filtered in fetchSettings
    const excludedKeys = [
        'enableLocationAutoAssign',
        'enableLocationBasedAssignment',
        'locationAssignments',
        'locationBasedAssignment',
      ];
    if (excludedKeys.includes(setting.key)) {
        return null; // Don't render these settings
    }

    switch (setting.key) {
      case 'restrictLeadEditing':
      case 'restrictCounselorView':
        // These are simple boolean toggles
        const title = setting.key === 'restrictLeadEditing' ? 'Restrict Lead Editing' : 'Restrict Counselor View';
        const description = setting.key === 'restrictLeadEditing' ?
          'When enabled, only admins or assigned users can edit lead status and contacted fields in dashboard page.' :
          'When enabled, counselors can only see leads assigned to them.';
        const isActive = Boolean(setting.value); // Ensure value is treated as boolean

        return (
          <div className={styles.settingItem} key={setting.key}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingTitle}>{title}</h3>
              <p className={styles.settingDescription}>{description}</p>
              <div className={styles.settingStatus}>
                {isActive ? (
                  <FaCheck className={styles.statusIconActive} />
                ) : (
                  <FaTimes className={styles.statusIconInactive} />
                )}
                <span className={isActive ? styles.statusTextActive : styles.statusTextInactive}>
                  {isActive ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div className={styles.settingAction}>
              <button
                onClick={() => toggleSetting(setting.key)}
                className={styles.toggleButton}
                disabled={saving}
                title={isActive ? 'Click to Disable' : 'Click to Enable'}
              >
                {isActive ? (
                  <FaToggleOn className={styles.toggleIconOn} />
                ) : (
                  <FaToggleOff className={styles.toggleIconOff} />
                )}
              </button>
            </div>
          </div>
        );
      case 'maxLeadsToDisplay':
        // This is a number slider/input
         // Use fetched total leads or a reasonable default max if totalLeads is 0
         const maxValueForSlider = totalLeads > 0 ? totalLeads : 300;


        return (
          <div className={styles.settingItem} key={setting.key}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingTitle}>Maximum Leads to Display</h3>
              <p className={styles.settingDescription}>
                Set the maximum number of leads to display on the main dashboard page (0 shows all leads).
              </p>
              <div className={styles.settingStatus}>
                <span className={styles.statusTextActive}>
                  {sliderValue === 0 ? 'All Leads' : `Latest ${sliderValue} Leads`}
                </span>
              </div>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderWithInput}>
                  <input
                    type="range"
                    min="0"
                    max={maxValueForSlider}
                    step="1"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                    // Update on mouse up/touch end to avoid excessive API calls while dragging
                    onMouseUp={() => updateSetting(setting.key, sliderValue)}
                    onTouchEnd={() => updateSetting(setting.key, sliderValue)}
                    className={styles.slider}
                    disabled={saving}
                  />
                  <input
                    type="number"
                    min="0"
                    max={maxValueForSlider}
                    value={sliderValue}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      // Clamp value between min and max
                      const clamped = Math.max(0, Math.min(value, maxValueForSlider));
                      setSliderValue(clamped);
                       // Consider adding a debounce if updating on every change
                    }}
                     onBlur={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                         const clamped = Math.max(0, Math.min(value, maxValueForSlider));
                         // Only update if the value changed from the last saved/fetched value
                         if (clamped !== setting.value) {
                            updateSetting(setting.key, clamped);
                         } else {
                             // If value didn't change, reset sliderValue just in case input had temporary invalid value
                             setSliderValue(setting.value); // Reset to the actual setting value
                         }
                      }}
                    className={styles.numberInput}
                    disabled={saving}
                  />
                </div>
                <div className={styles.sliderLabels}>
                   <span>0 (All)</span>
                   <span>{maxValueForSlider} ({totalLeads} Total)</span> {/* Show actual total leads */}
                </div>
              </div>
            </div>
             <div className={styles.settingAction}>
              {/* This empty div helps align content */}
            </div>
          </div>
        );
      default:
        // Render fallback for any other setting type (e.g., string, number, object)
        return (
          <div className={styles.settingItem} key={setting.key}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingTitle}>{setting.key}</h3>
              <p className={styles.settingDescription}>
                {setting.description || 'No description provided.'}
              </p>
              <pre className={styles.settingValue}>
                 {typeof setting.value === 'object' || Array.isArray(setting.value)
                  ? JSON.stringify(setting.value, null, 2) // Pretty print objects/arrays
                  : String(setting.value) // Display other types directly
                 }
              </pre>
            </div>
             <div className={styles.settingAction}>
              {/* This empty div helps align content */}
            </div>
          </div>
        );
    }
  };

   // If still loading initial data and user role is not yet determined/checked
  if (loading && userRole === null) {
      return (
         <div className={styles.loadingContainer}>
             <div className={styles.loader}></div>
             <p>Loading authentication...</p>
         </div>
      );
  }


  // Use the imported Sidebar and AccessControl components
  return (
    <div className={styles.adminPanelContainer}>
      {/* Sidebar is always present */}
      <Sidebar activePage="settings" />

      <main className={styles.mainContent}>
        {/* AccessControl handles the overall access to this page's content */}
        <AccessControl section="settings">
          {/* Content only visible to SuperAdmins based on AccessControl */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <FaCog className={styles.headerIcon} /> System Settings
            </h1>
            <p className={styles.pageDescription}>
              Configure system-wide settings for your application.
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <FaTimes className={styles.errorIcon} style={{ marginRight: "0.5rem" }} /> {error}
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              <FaCheck className={styles.successIcon} style={{ marginRight: "0.5rem" }} /> {success}
            </div>
          )}

          {loading ? (
               <div className={styles.loadingContainer}>
                  <div className={styles.loader}></div>
                  <p>Loading settings...</p>
               </div>
            ) : (
             <div className={styles.settingsContainer}>
               {settings.length === 0 && !error ? ( // Only show "No settings" if not loading and no error
                 <p className={styles.noSettings}>No configurable settings found.</p>
               ) : (
                 settings.map(setting => renderSetting(setting))
               )}
             </div>
           )}


          {saving && (
            <div className={styles.savingOverlay}>
              <div className={styles.savingContent}>
                <FaSpinner className={styles.spinner} /> {/* Used spinner class from dashboard styles */}
                <span>Saving changes...</span>
              </div>
            </div>
          )}
        </AccessControl>
      </main>
    </div>
  );
};

export default SettingsPage;