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
  FaInfoCircle,
  FaUserCog,
  FaUsers,
  FaChartBar,
  FaClipboardList,
  FaHistory,
  FaSignOutAlt,
  FaTachometerAlt,
  FaKey,
  FaMapMarkerAlt
} from "react-icons/fa";
import Link from "next/link";
import LocationAssignmentModal from "@/components/superadmin/LocationAssignmentModal";

// SuperAdmin Layout Component (imported from parent page)
const SuperAdminLayout = ({ children, activePage }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminId");
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/AdminLogin");
  };

  return (
    <div className={styles.adminPanelContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Super Admin</h2>
        </div>
        <nav>
          <ul className={styles.sidebarNav}>
            <li>
              <Link
                href="/superadmin"
                className={`${styles.sidebarLink} ${activePage === 'dashboard' ? styles.activeLink : ''}`}
              >
                <FaTachometerAlt className={styles.sidebarIcon} />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/superadmin/users"
                className={`${styles.sidebarLink} ${activePage === 'users' ? styles.activeLink : ''}`}
              >
                <FaUserCog className={styles.sidebarIcon} />
                User Management
              </Link>
            </li>
            <li>
              <Link
                href="/superadmin/leads"
                className={`${styles.sidebarLink} ${activePage === 'leads' ? styles.activeLink : ''}`}
              >
                <FaUsers className={styles.sidebarIcon} />
                Lead Management
              </Link>
            </li>
            <li>
              <Link
                href="/superadmin/analytics"
                className={`${styles.sidebarLink} ${activePage === 'analytics' ? styles.activeLink : ''}`}
              >
                <FaChartBar className={styles.sidebarIcon} />
                Analytics
              </Link>
            </li>
            <li>
              <Link
                href="/superadmin/audit-logs"
                className={`${styles.sidebarLink} ${activePage === 'audit-logs' ? styles.activeLink : ''}`}
              >
                <FaHistory className={styles.sidebarIcon} />
                Audit Logs
              </Link>
            </li>
            <li>
              <Link
                href="/superadmin/roles"
                className={`${styles.sidebarLink} ${activePage === 'roles' ? styles.activeLink : ''}`}
              >
                <FaKey className={styles.sidebarIcon} />
                Role Permissions
              </Link>
            </li>
            <li>
              <Link
                href="/superadmin/settings"
                className={`${styles.sidebarLink} ${activePage === 'settings' ? styles.activeLink : ''}`}
              >
                <FaCog className={styles.sidebarIcon} />
                Settings
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className={styles.sidebarLink}
              >
                <FaClipboardList className={styles.sidebarIcon} />
                Go to Dashboard
              </Link>
            </li>
            <li>
              <a href="#"
                onClick={handleLogout}
                className={styles.sidebarLink}
              >
                <FaSignOutAlt className={styles.sidebarIcon} />
                Logout
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

// Utility function for authenticated API requests
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("Not authenticated");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminId");
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/AdminLogin";
    throw new Error("Session expired. Please login again.");
  }

  return response;
};

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [totalLeads, setTotalLeads] = useState(0);
  const [sliderValue, setSliderValue] = useState(0); // Add this new state for temporary slider value
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationAssignments, setLocationAssignments] = useState({});
  const [admins, setAdmins] = useState([]);
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");
    setUserRole(role);

    if (!token) {
      router.push("/AdminLogin");
      return;
    }

    if (role !== "SuperAdmin") {
      router.push("/dashboard");
      return;
    }

    fetchSettings();
    fetchLeadCount();
    fetchAdmins();
    // eslint-disable-next-line
  }, [router]);

  // Update the slider value when settings change
  useEffect(() => {
    const maxLeadsSetting = settings.find(s => s.key === 'maxLeadsToDisplay');
    if (maxLeadsSetting) {
      setSliderValue(maxLeadsSetting.value);
    }

    // Get location assignments setting
    const locationAssignmentsSetting = settings.find(s => s.key === 'locationAssignments');
    if (locationAssignmentsSetting) {
      console.log("Found locationAssignments setting:", locationAssignmentsSetting);

      if (typeof locationAssignmentsSetting.value === 'object') {
        console.log("Setting location assignments:", locationAssignmentsSetting.value);
        setLocationAssignments(locationAssignmentsSetting.value);
      } else {
        console.warn("locationAssignments value is not an object:", locationAssignmentsSetting.value);
        // Initialize with empty object if value is invalid
        setLocationAssignments({});
      }
    } else {
      console.log("No locationAssignments setting found, initializing...");
      // Create the setting if it doesn't exist
      updateSetting('locationAssignments', {});
    }
    // eslint-disable-next-line
  }, [settings]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching settings...");
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      console.log("Settings fetched:", data);

      // Check if locationAssignments exists
      const hasLocationAssignments = data.some(s => s.key === 'locationAssignments');
      if (!hasLocationAssignments) {
        console.log("locationAssignments setting not found, will create it");
      }

      setSettings(data);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadCount = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/count`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch lead count");
      }

      const data = await response.json();
      setTotalLeads(data.count);
    } catch (err) {
      console.error("Error fetching lead count:", err);
      // Default to 300 if we can't get the count
      setTotalLeads(300);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch admins list");
      }

      const data = await response.json();
      setAdmins(data);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  const updateSetting = async (key, value) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/${key}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value,
            description: settings.find(s => s.key === key)?.description || ""
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update setting");
      }

      // Update the local state
      setSettings(prevSettings =>
        prevSettings.map(setting =>
          setting.key === key ? { ...setting, value } : setting
        )
      );

      setSuccess(`Setting "${key}" updated successfully`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error(`Error updating setting ${key}:`, err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key) => {
    const setting = settings.find(s => s.key === key);
    if (setting) {
      updateSetting(key, !setting.value);
    }
  };

  const handleSaveLocationAssignments = async (assignments) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Saving location assignments:", assignments);

      // First check if the locationAssignments setting exists
      const existingSetting = settings.find(s => s.key === 'locationAssignments');
      const method = existingSetting ? "PUT" : "POST";
      const url = existingSetting
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/settings/locationAssignments`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/settings`;

      const requestBody = existingSetting
        ? {
            value: assignments,
            description: "Location to counselor mapping for automatic assignment"
          }
        : {
            key: 'locationAssignments',
            value: assignments,
            description: "Location to counselor mapping for automatic assignment"
          };

      console.log(`Sending ${method} request to ${url} with body:`, requestBody);

      // Update the location assignments setting
      const response = await fetchWithAuth(
        url,
        {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error response:", errorData);
        throw new Error("Failed to update location assignments");
      }

      const responseData = await response.json();
      console.log("Server response:", responseData);

      // Update the local state
      setLocationAssignments(assignments);

      // Update the settings state
      setSettings(prevSettings => {
        const settingExists = prevSettings.some(s => s.key === 'locationAssignments');

        if (settingExists) {
          return prevSettings.map(setting =>
            setting.key === 'locationAssignments'
              ? { ...setting, value: assignments }
              : setting
          );
        } else {
          // Add the new setting
          return [...prevSettings, {
            key: 'locationAssignments',
            value: assignments,
            description: "Location to counselor mapping for automatic assignment"
          }];
        }
      });

      setSuccess(`Location assignments updated successfully`);
      setShowLocationModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error(`Error updating location assignments:`, err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Function to render different setting types
  const renderSetting = (setting) => {
    switch (setting.key) {
      case 'restrictLeadEditing':
        return (
          <div className={styles.settingItem} key={setting.key}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingTitle}>Restrict Lead Editing</h3>
              <p className={styles.settingDescription}>
                When enabled, only admins or assigned users can edit lead status and contacted fields in dashboard page
              </p>
              {setting.value ? (
                <div className={styles.settingStatus}>
                  <FaCheck className={styles.statusIconActive} />
                  <span className={styles.statusTextActive}>Enabled</span>
                </div>
              ) : (
                <div className={styles.settingStatus}>
                  <FaTimes className={styles.statusIconInactive} />
                  <span className={styles.statusTextInactive}>Disabled</span>
                </div>
              )}
            </div>
            <div className={styles.settingAction}>
              <button
                onClick={() => toggleSetting(setting.key)}
                className={styles.toggleButton}
                disabled={saving}
              >
                {setting.value ? (
                  <FaToggleOn className={styles.toggleIconOn} />
                ) : (
                  <FaToggleOff className={styles.toggleIconOff} />
                )}
              </button>
            </div>
          </div>
        );
      case 'restrictCounselorView':
        return (
          <div className={styles.settingItem} key={setting.key}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingTitle}>Restrict Counselor View</h3>
              <p className={styles.settingDescription}>
                When enabled, counselors can only see leads assigned to them
              </p>
              {setting.value ? (
                <div className={styles.settingStatus}>
                  <FaCheck className={styles.statusIconActive} />
                  <span className={styles.statusTextActive}>Enabled</span>
                </div>
              ) : (
                <div className={styles.settingStatus}>
                  <FaTimes className={styles.statusIconInactive} />
                  <span className={styles.statusTextInactive}>Disabled</span>
                </div>
              )}
            </div>
            <div className={styles.settingAction}>
              <button
                onClick={() => toggleSetting(setting.key)}
                className={styles.toggleButton}
                disabled={saving}
              >
                {setting.value ? (
                  <FaToggleOn className={styles.toggleIconOn} />
                ) : (
                  <FaToggleOff className={styles.toggleIconOff} />
                )}
              </button>
            </div>
          </div>
        );
      case 'locationBasedAssignment':
        return (
          <div className={styles.settingItem} key={setting.key}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingTitle}>Location-based Lead Assignment</h3>
              <p className={styles.settingDescription}>
                When enabled, leads will be automatically assigned to counselors based on their location
              </p>
              {setting.value ? (
                <div className={styles.settingStatus}>
                  <FaCheck className={styles.statusIconActive} />
                  <span className={styles.statusTextActive}>Enabled</span>
                </div>
              ) : (
                <div className={styles.settingStatus}>
                  <FaTimes className={styles.statusIconInactive} />
                  <span className={styles.statusTextInactive}>Disabled</span>
                </div>
              )}
              {setting.value && (
                <div className={styles.additionalControls}>
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className={styles.configButton}
                  >
                    <FaMapMarkerAlt /> Configure Location Assignments
                  </button>
                </div>
              )}
            </div>
            <div className={styles.settingAction}>
              <button
                onClick={() => toggleSetting(setting.key)}
                className={styles.toggleButton}
                disabled={saving}
              >
                {setting.value ? (
                  <FaToggleOn className={styles.toggleIconOn} />
                ) : (
                  <FaToggleOff className={styles.toggleIconOff} />
                )}
              </button>
            </div>
          </div>
        );
      case 'maxLeadsToDisplay':
        return (
          <div className={styles.settingItem} key={setting.key}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingTitle}>Maximum Leads to Display</h3>
              <p className={styles.settingDescription}>
                Set the maximum number of leads to display on the dashboard (0 shows all leads)
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
                    max={totalLeads > 0 ? totalLeads : 300}
                    step="1"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                    onMouseUp={() => updateSetting(setting.key, sliderValue)}
                    onTouchEnd={() => updateSetting(setting.key, sliderValue)}
                    className={styles.slider}
                    disabled={saving}
                  />
                  <input
                    type="number"
                    min="0"
                    max={totalLeads > 0 ? totalLeads : 300}
                    value={sliderValue}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      const clamped = Math.min(value, totalLeads > 0 ? totalLeads : 300);
                      setSliderValue(clamped);
                    }}
                    onBlur={() => updateSetting(setting.key, sliderValue)}
                    className={styles.numberInput}
                    disabled={saving}
                  />
                </div>
                <div className={styles.sliderLabels}>
                  <span></span>
                  <span>{totalLeads > 0 ? totalLeads : 300}</span>
                </div>
              </div>
            </div>
            <div className={styles.settingAction}>
              {/* This empty div keeps the layout consistent with other setting items */}
            </div>
          </div>
        );
      default:
        return (
          <div className={styles.settingItem} key={setting.key}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingTitle}>{setting.key}</h3>
              <p className={styles.settingDescription}>
                {setting.description || 'No description provided'}
              </p>
              <pre className={styles.settingValue}>
                {JSON.stringify(setting.value, null, 2)}
              </pre>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout activePage="settings">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading settings...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout activePage="settings">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <FaCog className={styles.headerIcon} /> System Settings
        </h1>
        <p className={styles.pageDescription}>
          Configure system-wide settings for your application
        </p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <FaTimes className={styles.errorIcon} /> {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          <FaCheck className={styles.successIcon} /> {success}
        </div>
      )}

      <div className={styles.settingsContainer}>
        {settings.length === 0 ? (
          <p className={styles.noSettings}>No settings found</p>
        ) : (
          settings.map(setting => renderSetting(setting))
        )}
      </div>

      {saving && (
        <div className={styles.savingOverlay}>
          <div className={styles.savingContent}>
            <FaSpinner className={styles.spinnerIcon} />
            <span>Saving changes...</span>
          </div>
        </div>
      )}

      {/* Location Assignment Modal */}
      <LocationAssignmentModal
        show={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSave={handleSaveLocationAssignments}
        admins={admins}
        existingAssignments={locationAssignments}
        saving={saving}
      />
    </SuperAdminLayout>
  );
};

export default SettingsPage;
