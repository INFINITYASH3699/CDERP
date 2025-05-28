"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaSpinner,
  FaCog, // Page icon
  FaCheck,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaInfoCircle, // For explanatory messages
  FaChartBar, // For slider context/icon
  FaExclamationTriangle, // For no data/error message
} from "react-icons/fa";

import Sidebar from "@/components/superadmin/Sidebar"; // Import reusable Sidebar
import AccessControl from "@/components/superadmin/AccessControl"; // Import reusable AccessControl
import { fetchWithAuth } from "@/utils/auth"; // Import reusable fetch utility

// Removed the inline SuperAdminLayout Component definition
// Removed the inline fetchWithAuth utility definition
// Removed AuditLogDetailsModal import as it's not used here

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userRole, setUserRole] = useState(null); // State to track user role
  const [totalLeads, setTotalLeads] = useState(0); // Total leads for slider max value
  const [sliderValue, setSliderValue] = useState(0); // State for the maxLeadsToDisplay slider
  const router = useRouter();

  // Authentication check and initial data fetch
  useEffect(() => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("adminToken")
        : null;
    const role =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("adminRole")
        : null;
    setUserRole(role); // Set user role state

    if (!token) {
      router.push("/AdminLogin");
      return; // Stop further execution if not authenticated
    }

    // The AccessControl component will handle showing the restricted message
    // for non-SuperAdmins. We still fetch data if authenticated.

    fetchSettings();
    fetchLeadCount(); // Fetch lead count for the slider max value
  }, [router]); // Depend on router for initial check

  // Update the slider value when settings change and settings data is available
  // This ensures the slider reflects the fetched 'maxLeadsToDisplay' value
  useEffect(() => {
    if (settings.length > 0) {
      const maxLeadsSetting = settings.find(
        (s) => s.key === "maxLeadsToDisplay"
      );
      // Use != null check to handle values being 0
      if (maxLeadsSetting != null && maxLeadsSetting.value != null) {
        setSliderValue(parseInt(maxLeadsSetting.value)); // Ensure it's a number
      }
    }
  }, [settings]); // Depend on settings state

  const fetchSettings = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Use empty string as fallback
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL is not defined");
        setError("API URL is not configured.");
        setLoading(false); // Ensure loading is off
        return;
      }

      const response = await fetchWithAuth(
        `${apiUrl}/api/settings` // Assuming this endpoint returns an array of settings [{ key: '...', value: ..., description: ... }]
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch settings response:",
          response.status,
          errorText
        );
        throw new Error(
          `Failed to fetch settings: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Filter out specific settings keys you don't want to display in the general list
      // This list should match the keys your API might return but you want to ignore
      const excludedKeys = [
        "enableLocationAutoAssign",
        "enableLocationBasedAssignment",
        "locationAssignments", // Assuming this is complex data managed elsewhere
        "locationBasedAssignment", // Assuming this is complex data managed elsewhere
        // Add any other keys you don't want to display in the general settings list
      ];

      const filteredSettings = Array.isArray(data)
        ? data.filter((setting) => !excludedKeys.includes(setting.key))
        : [];

      setSettings(filteredSettings);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.message || "Failed to fetch settings. Please try again.");
      setSettings([]); // Clear settings on error
    } finally {
      setLoading(false); // Set loading false after fetch attempt
    }
  };

  const fetchLeadCount = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        console.error("API URL is not configured, cannot fetch lead count.");
        return; // Don't try fetching if API URL is not set
      }
      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/count` // Assuming you have a lead count endpoint that returns { count: number }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch lead count response:",
          response.status,
          errorText
        );
        // Optionally set a less critical error message or just log
        // setError(`Failed to fetch total lead count: ${response.statusText}`);
      }

      const data = await response.json();
      // Assuming the response is like { count: number }
      setTotalLeads(data?.count || 0); // Use fetched count, default to 0 if 0 or undefined
    } catch (err) {
      console.error("Error fetching lead count:", err);
      // Keep the default or previous totalLeads value, or set to 0 on error
      setTotalLeads(0); // Set to 0 on fetch error
      // setError(`Error fetching total lead count: ${err.message}`); // Optionally set a less critical error message
    }
  };

  const updateSetting = async (key, value) => {
    setSaving(true);
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        throw new Error("API URL is not configured.");
      }

      // Find the current setting to send its description along (if needed by API)
      const currentSetting = settings.find((s) => s.key === key);
      // Default description to empty string if not found or null/undefined
      const descriptionToSend = currentSetting?.description || "";

      const response = await fetchWithAuth(
        `${apiUrl}/api/settings/${key}`, // Assuming endpoint is /api/settings/:key
        {
          method: "PUT", // Or PATCH depending on your API design
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: value, // Send the new value
            description: descriptionToSend, // Send existing description (backend might ignore if it's read-only)
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `Failed to update setting "${key}" response:`,
          response.status,
          errorData
        );
        throw new Error(
          errorData.message ||
            `Failed to update setting "${key}": ${response.statusText}`
        );
      }

      // Update the local state with the new value from the response (or the value sent)
      // Assuming API returns the updated setting on success
      const updatedSettingData = await response.json(); // Or use the value sent if API doesn't return

      setSettings((prevSettings) =>
        prevSettings.map(
          (setting) =>
            setting.key === key
              ? { ...setting, value: updatedSettingData.value }
              : setting // Use value from response
        )
      );

      setSuccess(`Setting "${key}" updated successfully.`);

      // Clear success message after 3 seconds
      const successTimer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      // Cleanup timer on component unmount or before next success
      return () => clearTimeout(successTimer);
    } catch (err) {
      console.error(`Error updating setting "${key}":`, err);
      setError(err.message || "Failed to save changes. Please try again.");
      // Clear error message after 5 seconds (optional)
      const errorTimer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(errorTimer);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key) => {
    const setting = settings.find((s) => s.key === key);
    if (setting) {
      // Ensure the value is treated as a boolean for toggling
      const currentValue = Boolean(setting.value);
      updateSetting(key, !currentValue); // Toggle boolean value
    } else {
      console.warn(`Setting with key "${key}" not found to toggle.`);
      setError(`Setting "${key}" not found.`); // Inform user
    }
  };

  // Function to render different setting types
  const renderSetting = (setting) => {
    // Filter out excluded keys here again, although already filtered in fetchSettings
    const excludedKeys = [
      "enableLocationAutoAssign",
      "enableLocationBasedAssignment",
      "locationAssignments",
      "locationBasedAssignment",
    ];
    if (excludedKeys.includes(setting.key)) {
      return null; // Don't render these settings
    }

    // Determine readOnly status for the setting based on user role
    // This page is restricted to SuperAdmins by AccessControl, but let's explicitly check
    // if you wanted to allow ViewMode admins to see settings but not change them.
    // For now, assume only SuperAdmins can edit.
    const isReadOnly = userRole !== "SuperAdmin"; // Or check against a specific permission for 'settings.update'

    switch (setting.key) {
      case "restrictLeadEditing":
      case "restrictCounselorView":
        // These are simple boolean toggles
        const title =
          setting.key === "restrictLeadEditing"
            ? "Restrict Lead Editing"
            : "Restrict Counselor View";
        const description =
          setting.key === "restrictLeadEditing"
            ? "When enabled, only admins or assigned users can edit lead status and contacted fields in dashboard page."
            : "When enabled, counselors can only see leads assigned to them.";
        const isActive = Boolean(setting.value); // Ensure value is treated as boolean

        return (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-0 border-b border-gray-200 last:border-b-0"
            key={setting.key}
          >
            <div className="flex-1 mb-4 sm:mb-0 mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{description}</p>
              <div className="flex items-center text-sm">
                {isActive ? (
                  <FaCheck className="text-green-500 mr-2" />
                ) : (
                  <FaTimes className="text-red-500 mr-2" />
                )}
                <span
                  className={`font-medium ${isActive ? "text-green-700" : "text-red-700"}`}
                >
                  {isActive ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {" "}
              {/* Prevents action buttons from shrinking */}
              {/* Disable toggle button if readOnly or saving */}
              <button
                onClick={() => toggleSetting(setting.key)}
                className="p-2 text-4xl leading-none focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isReadOnly || saving} // Disable if readOnly or saving
                title={isActive ? "Click to Disable" : "Click to Enable"}
                aria-label={isActive ? `Disable ${title}` : `Enable ${title}`}
              >
                {isActive ? (
                  <FaToggleOn className="text-blue-600 hover:text-blue-700" />
                ) : (
                  <FaToggleOff className="text-gray-400 hover:text-gray-500" />
                )}
              </button>
            </div>
          </div>
        );
      case "maxLeadsToDisplay":
        // This is a number slider/input
        // Use fetched total leads or a reasonable default max if totalLeads is 0 or undefined
        const maxValueForSlider = totalLeads > 0 ? totalLeads : 500; // Use 500 as a fallback max

        return (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-0 border-b border-gray-200 last:border-b-0"
            key={setting.key}
          >
            <div className="flex-1 mb-4 sm:mb-0 mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                <FaChartBar className="mr-2 text-blue-600" /> Maximum Leads to
                Display
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Set the maximum number of leads to display on the main dashboard
                page. (0 shows all leads up to system limit).
              </p>
              <div className="w-full max-w-sm">
                {" "}
                {/* Constrain slider width */}
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="range"
                    min="0"
                    max={maxValueForSlider}
                    step="1"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                    // Update on mouse up/touch end to avoid excessive API calls while dragging
                    onMouseUp={() =>
                      !isReadOnly && updateSetting(setting.key, sliderValue)
                    } // Only update if not readOnly
                    onTouchEnd={() =>
                      !isReadOnly && updateSetting(setting.key, sliderValue)
                    } // Only update if not readOnly
                    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ${isReadOnly || saving ? "pointer-events-none" : ""}`}
                    disabled={isReadOnly || saving} // Disable if readOnly or saving
                    aria-label="Maximum Leads to Display slider"
                  />
                  <input
                    type="number"
                    min="0"
                    max={maxValueForSlider}
                    value={sliderValue}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseInt(e.target.value);
                      // Clamp value between min and max
                      const clamped = Math.max(
                        0,
                        Math.min(value, maxValueForSlider)
                      );
                      setSliderValue(clamped);
                      // Consider adding a debounce if updating on every change while typing
                    }}
                    onBlur={(e) => {
                      if (isReadOnly || saving) return; // Do nothing if readOnly or saving
                      const value =
                        e.target.value === "" ? 0 : parseInt(e.target.value);
                      const clamped = Math.max(
                        0,
                        Math.min(value, maxValueForSlider)
                      );
                      // Only update if the value changed from the last saved/fetched value
                      // and if the clamped value is different from the current setting value
                      if (clamped !== setting.value) {
                        updateSetting(setting.key, clamped);
                      } else {
                        // If value didn't change or was invalid, reset sliderValue to the actual setting value
                        setSliderValue(setting.value); // Reset to the actual setting value
                      }
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isReadOnly || saving} // Disable if readOnly or saving
                    aria-label="Maximum Leads to Display number input"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0 (All)</span>
                  <span>
                    {maxValueForSlider}
                    {totalLeads > 0 && ` (${totalLeads} Total)`}
                  </span>{" "}
                  {/* Show actual total leads if > 0 */}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              {/* No specific action button here, interaction is via slider/input */}
            </div>
          </div>
        );
      default:
        // Render fallback for any other setting type (e.g., string, number, object)
        // Display value as read-only
        return (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-0 border-b border-gray-200 last:border-b-0"
            key={setting.key}
          >
            <div className="flex-1 mb-4 sm:mb-0 mr-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {setting.key}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {setting.description || "No description provided."}
              </p>
              <div className="mt-3">
                <pre className="bg-gray-100 p-3 rounded-md text-sm font-mono text-gray-700 overflow-x-auto max-w-full">
                  {/* Safely stringify complex types */}
                  {
                    (typeof setting.value === "object" &&
                      setting.value !== null) ||
                    Array.isArray(setting.value)
                      ? JSON.stringify(setting.value, null, 2) // Pretty print objects/arrays
                      : String(setting.value) // Display other types directly (handle null/undefined as "null"/"undefined")
                  }
                </pre>
              </div>
            </div>
            <div className="flex-shrink-0">
              {/* Add an edit button or inline edit if needed for specific types */}
              {/* For now, just display value */}
            </div>
          </div>
        );
    }
  };

  // If still loading initial data and user role is not yet determined/checked
  if (loading && userRole === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <p className="mt-8 text-center text-gray-600">
          Loading authentication...
        </p>
      </div>
    );
  }

  return (
    // Main container flex layout
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar is always present */}
      <Sidebar activePage="settings" />

      {/* Main content area - takes remaining space */}
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 overflow-auto">
        {/* AccessControl handles the overall access to this page's content */}
        {/* Content only visible to users with 'settings' access (likely SuperAdmins) */}
        <AccessControl section="settings">
          {/* Page content container with padding and max-width */}
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <FaCog className="mr-3 text-blue-600" /> System Settings
              </h1>
              <p className="text-gray-600 text-lg">
                Configure system-wide settings for your application.
              </p>
            </div>

            {/* Page-level Error Message Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md relative mb-4 flex items-center">
                <FaTimes className="mr-2 text-xl" />
                {error}
              </div>
            )}

            {/* Page-level Success Message Display */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md relative mb-4 flex items-center">
                <FaCheck className="mr-2 text-xl" />
                {success}
              </div>
            )}

            {/* Loading State for Page Content */}
            {loading && settings.length === 0 && !error ? ( // Show loader only if loading and no settings data
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "1.5s",
                    }}
                  ></div>
                </div>
                <p className="mt-4 text-gray-600">Loading settings...</p>
              </div>
            ) : settings.length === 0 && !loading && !error ? ( // Show empty state if no settings after loading
              <div className="p-6 text-center text-gray-600 flex flex-col items-center">
                <FaExclamationTriangle className="text-yellow-500 text-3xl mb-4" />
                No configurable settings found.
              </div>
            ) : (
              /* Settings List Container */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200 overflow-hidden">
                {settings.map((setting) => renderSetting(setting))}
              </div>
            )}

            {/* Saving Overlay */}
            {saving && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[1001]">
                <div className="bg-white px-6 py-4 rounded-lg shadow-xl flex items-center text-blue-600">
                  <FaSpinner className="animate-spin mr-3 text-2xl" />
                  <span className="text-lg font-medium">Saving changes...</span>
                </div>
              </div>
            )}
          </div>
        </AccessControl>
      </main>
    </div>
  );
};

export default SettingsPage;
