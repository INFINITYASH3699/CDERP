"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaSave,
  FaUndo,
  FaSpinner,
  FaInfoCircle,
  // Removed icons that are now in the reusable Sidebar
  // FaTachometerAlt, FaUserCog, FaUsers, FaChartBar,
  // FaClipboardList, FaHistory, FaSignOutAlt, FaKey, FaCog,
} from "react-icons/fa";
// Removed Link import from here as it's used within the Sidebar
// import Link from "next/link";

import Sidebar from "@/components/superadmin/Sidebar"; // Import reusable Sidebar
import AccessControl from "@/components/superadmin/AccessControl"; // Import reusable AccessControl
import { fetchWithAuth } from "@/utils/auth"; // Import reusable fetch utility

// Removed the inline SuperAdminLayout Component definition

// Permission Table Component (remains the same, keep it in this file or move to its own component if reused elsewhere)
const PermissionTable = ({ roleData, onChange, readOnly }) => {
  const handleCheckboxChange = (category, action, value) => {
    if (readOnly) return;

    const newPermissions = {
      ...roleData.permissions,
      [category]: {
        ...roleData.permissions[category], // Keep existing actions for the category
        [action]: value, // Update the specific action
      },
    };

    onChange(newPermissions);
  };

  // Helper to handle indeterminate state for checkboxes (optional, but good UX)
  const isIndeterminate = (category, actions) => {
    const total = actions.length;
    if (total === 0) return false; // No actions to check
     // Use optional chaining here
    const checkedCount = actions.filter(action => roleData.permissions[category]?.[action]).length;
    return checkedCount > 0 && checkedCount < total;
  };

   const allChecked = (category, actions) => {
     if (actions.length === 0) return false;
      // Use optional chaining here
     return actions.every(action => roleData.permissions[category]?.[action]);
   };

  const handleSelectAllCategory = (category, actions, checked) => {
     if (readOnly) return;
     const newPermissions = {
        ...roleData.permissions,
        [category]: {
           ...roleData.permissions[category] // Keep existing actions
        }
     };
     actions.forEach(action => {
        newPermissions[category][action] = checked;
     });
     onChange(newPermissions);
  };


  return (
    <table className={styles.permissionTable}>
      <thead>
        <tr>
          <th>Feature / Action</th>
          <th>Create</th>
          <th>Read</th>
          <th>Update</th>
          <th>Delete</th>
          <th>View</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Users</td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.users?.create || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("users", "create", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.users?.read || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("users", "read", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.users?.update || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("users", "update", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.users?.delete || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("users", "delete", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>-</td> {/* Users don't typically have a 'view' permission separate from 'read' in this context */}
        </tr>
        <tr>
          <td>Leads</td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.leads?.create || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("leads", "create", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.leads?.read || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("leads", "read", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.leads?.update || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("leads", "update", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.leads?.delete || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("leads", "delete", e.target.checked)}
              disabled={readOnly}
            />
          </td>
           <td>-</td>{/* Leads don't typically have a 'view' permission separate from 'read' in this context */}
        </tr>
        <tr>
          <td>Admins</td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.admins?.create || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("admins", "create", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.admins?.read || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("admins", "read", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.admins?.update || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("admins", "update", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.admins?.delete || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("admins", "delete", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>-</td> {/* Admins don't typically have a 'view' permission separate from 'read' in this context */}
        </tr>
        <tr>
          <td>Analytics</td>
           <td>-</td><td>-</td><td>-</td><td>-</td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.analytics?.view || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("analytics", "view", e.target.checked)}
              disabled={readOnly}
            />
          </td>
        </tr>
        <tr>
          <td>Audit Logs</td>
           <td>-</td><td>-</td><td>-</td><td>-</td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.auditLogs?.view || false} // Add ?. and default to false
              onChange={(e) => handleCheckboxChange("auditLogs", "view", e.target.checked)}
              disabled={readOnly}
            />
          </td>
        </tr>
         {/* Add other features here */}
         {/* Example: Settings */}
         <tr>
            <td>Settings</td>
            <td>-</td><td>-</td><td>-</td><td>-</td>
             <td>
               <input
                 type="checkbox"
                 checked={roleData.permissions.settings?.view || false} // Add ?. and default to false
                 onChange={(e) => handleCheckboxChange("settings", "view", e.target.checked)}
                 disabled={readOnly}
               />
             </td>
         </tr>
      </tbody>
    </table>
  );
};


// Role Permissions Management Page
const RolePermissionsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState(null);
  const [activeRole, setActiveRole] = useState("Admin"); // Default to Admin
  const [hasChanges, setHasChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeRoleData, setActiveRoleData] = useState(null);
  const [originalRoleData, setOriginalRoleData] = useState(null);
  const [userRole, setUserRole] = useState(null); // Track user role from localStorage

  // Authentication check and initial data fetch
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");
    setUserRole(role); // Set user role state

    if (!token) {
      router.push("/AdminLogin");
      return; // Stop further execution if not authenticated
    }

    // No need to explicitly redirect non-SuperAdmins here, AccessControl handles it visually.
    // But we should still fetch permissions so the sidebar works correctly and the restricted
    // message shows up with the proper layout.

    fetchPermissions();

    // The fetchPermissions function will set loading to false when done.
    // If fetchPermissions fails, loading will also be set to false, and error will be set.

  }, [router]); // Depend on router for initial check

   // Effect to set active role data when permissions are fetched or activeRole changes
   useEffect(() => {
     if (permissions.length > 0) {
       const roleData = permissions.find(r => r.role === activeRole);
       if (roleData) {
         setActiveRoleData(roleData);
         // Create a deep copy for change tracking
         setOriginalRoleData(JSON.parse(JSON.stringify(roleData)));
         setHasChanges(false); // Reset changes when active role data is set
       } else {
         // Handle case where activeRole doesn't match any fetched roles (e.g., first load)
         // Default to the first available role if "Admin" is not found
         const defaultRoleData = permissions[0];
          if (defaultRoleData) {
             setActiveRole(defaultRoleData.role);
             setActiveRoleData(defaultRoleData);
             setOriginalRoleData(JSON.parse(JSON.stringify(defaultRoleData)));
             setHasChanges(false);
          } else {
             console.error("No role permissions found in API response.");
             setError("Could not load role permissions.");
             setLoading(false); // Ensure loading is off if no permissions are found
          }
       }
     }
   }, [permissions, activeRole]); // Depend on permissions and activeRole


  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);

    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (!apiUrl) {
             throw new Error("API URL is not configured.");
        }
      const response = await fetchWithAuth(
        `${apiUrl}/api/role-permissions`
      );

      if (!response.ok) {
         const errorText = await response.text();
         console.error("Failed to fetch role permissions:", response.status, errorText);
        throw new Error(`Failed to fetch role permissions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

       if (Array.isArray(data)) {
          // Ensure each role has a complete permissions structure with defaults if missing
          const processedData = data.map(role => ({
              ...role,
              permissions: {
                  users: { create: false, read: false, update: false, delete: false, ...(role.permissions?.users || {}) },
                  leads: { create: false, read: false, update: false, delete: false, ...(role.permissions?.leads || {}) },
                  admins: { create: false, read: false, update: false, delete: false, ...(role.permissions?.admins || {}) },
                  analytics: { view: false, ...(role.permissions?.analytics || {}) },
                  auditLogs: { view: false, ...(role.permissions?.auditLogs || {}) },
                  settings: { view: false, ...(role.permissions?.settings || {}) }, // Ensure settings.view exists
                  // Add other categories with default permissions here
                  ...(role.permissions || {}), // Include any other categories returned by the API
              }
          })).sort((a, b) => {
            if (a.role === "SuperAdmin") return -1;
            if (b.role === "SuperAdmin") return 1;
            return 0; // Keep other roles' order if not SuperAdmin
          });
          setPermissions(processedData);
       } else {
           throw new Error("Invalid response format from server: Expected an array.");
       }

    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError(err.message || "Failed to fetch role permissions. Please try again.");
       setPermissions([]); // Clear permissions on error
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    // Check for unsaved changes before switching tabs
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Discard them and switch role?")) {
        return; // User clicked Cancel
      }
    }
    // If user confirmed or no changes, update active role state
    setActiveRole(role);
    // The useEffect hook tied to [activeRole] and [permissions] will handle setting activeRoleData and originalRoleData
  };

  const handlePermissionsChange = (newPermissions) => {
    // Find the index of the active role in the permissions array
    const activeRoleIndex = permissions.findIndex(p => p.role === activeRoleData.role);

    if (activeRoleIndex === -1) {
        console.error("Active role not found in permissions list.");
        return;
    }

    // Create a new array of permissions with the updated data for the active role
    const updatedPermissionsList = [
        ...permissions.slice(0, activeRoleIndex),
        { ...activeRoleData, permissions: newPermissions },
        ...permissions.slice(activeRoleIndex + 1)
    ];

    setPermissions(updatedPermissionsList); // Update the main permissions state
    setActiveRoleData({ // Update the active role data state
      ...activeRoleData,
      permissions: newPermissions,
    });


    // Check if there are changes compared to the original data
     if (originalRoleData) {
       setHasChanges(JSON.stringify(newPermissions) !== JSON.stringify(originalRoleData.permissions));
     } else {
        // If original data wasn't set for some reason, treat any change as having changes
        setHasChanges(true);
     }
  };

  const handleReset = () => {
    if (originalRoleData) {
       // Find the index of the active role in the permissions array
       const activeRoleIndex = permissions.findIndex(p => p.role === activeRoleData.role);

       if (activeRoleIndex === -1) {
           console.error("Active role not found in permissions list during reset.");
           return;
       }

       // Create a new array of permissions with the original data for the active role
       const updatedPermissionsList = [
           ...permissions.slice(0, activeRoleIndex),
           JSON.parse(JSON.stringify(originalRoleData)), // Reset to deep copy of original
           ...permissions.slice(activeRoleIndex + 1)
       ];

       setPermissions(updatedPermissionsList); // Update the main permissions state
       setActiveRoleData(JSON.parse(JSON.stringify(originalRoleData))); // Reset active role data state
       setHasChanges(false); // No changes after resetting
    } else {
      console.warn("Original role data not available for reset.");
    }
  };

  const handleSave = async () => {
    if (!activeRoleData || activeRoleData.role === "SuperAdmin" || !hasChanges) return;

    setSubmitting(true);
    setError(null);

    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (!apiUrl) {
             throw new Error("API URL is not configured.");
        }
      const response = await fetchWithAuth(
        `${apiUrl}/api/role-permissions/${activeRoleData.role}`, // Endpoint by role name
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            permissions: activeRoleData.permissions, // Send only the updated permissions object
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update role permissions");
      }

      // Success
      setHasChanges(false);
      setOriginalRoleData(JSON.parse(JSON.stringify(activeRoleData))); // Update original to reflect saved state

      // Optionally refresh all permissions from the server to be absolutely sure
      // await fetchPermissions(); // This will re-trigger the effect that sets activeRoleData

    } catch (err) {
      console.error("Error updating permissions:", err);
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Use the imported Sidebar and AccessControl components
  return (
    <div className={styles.adminPanelContainer}>
      {/* Sidebar is always present */}
      <Sidebar activePage="roles" />

      <main className={styles.mainContent}>
        {/* AccessControl handles the overall access to this page's content */}
        <AccessControl section="roles">
          {/* Content only visible to SuperAdmins based on AccessControl */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Role Permissions</h1>
            <p className={styles.pageDescription}>
              Manage what each role can access and modify in the system.
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <FaTimes className={styles.errorIcon} style={{ marginRight: "0.5rem" }} /> {error}
            </div>
          )}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loader}></div>
              <p>Loading role permissions...</p>
            </div>
          ) : (
            <>
              <div className={styles.tabsContainer}>
                <div className={styles.tabsList}>
                  {permissions.map((p) => (
                    <button
                      key={p.role}
                      className={`${styles.tabButton} ${activeRole === p.role ? styles.activeTab : ''}`}
                      onClick={() => handleRoleChange(p.role)}
                      disabled={submitting}
                    >
                      {p.role}
                    </button>
                  ))}
                </div>

                {activeRoleData && (
                  <div className={styles.chartContainer}> {/* Using chartContainer for styling */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                      <h2 className={styles.chartTitle}>
                        {activeRoleData.role} Role Permissions
                      </h2>

                      {activeRoleData.role !== "SuperAdmin" && (
                        <div className={styles.formActions} style={{ margin: 0 }}> {/* Reset margin */}
                          <button
                            onClick={handleReset}
                            className={`${styles.button} ${styles.secondaryButton}`}
                            disabled={!hasChanges || submitting}
                          >
                            <FaUndo style={{ marginRight: "0.5rem" }} /> Reset
                          </button>
                          <button
                            onClick={handleSave}
                            className={`${styles.button} ${styles.primaryButton}`}
                            disabled={!hasChanges || submitting}
                          >
                            {submitting ? (
                              <>
                                <FaSpinner className={styles.spinner} style={{ marginRight: "0.5rem" }} />
                                Saving...
                              </>
                            ) : (
                              <>
                                <FaSave style={{ marginRight: "0.5rem" }} /> Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {activeRoleData.role === "SuperAdmin" && (
                      <div className={styles.bulkActionBar} style={{ backgroundColor: "#fff5f5", color: "#e53e3e" }}> {/* Adjusted styling */}
                        <FaInfoCircle style={{ marginRight: "0.5rem" }} />
                        <span>SuperAdmin permissions cannot be modified. SuperAdmins have full access to all features.</span>
                      </div>
                    )}

                    <div className={styles.tableResponsive}> {/* Wrap table in responsive div */}
                      <PermissionTable
                        roleData={activeRoleData}
                        onChange={handlePermissionsChange}
                        readOnly={activeRoleData.role === "SuperAdmin"}
                      />
                    </div>

                    {activeRoleData.role !== "SuperAdmin" && (
                      <p style={{ marginTop: "1rem" }}>
                        <strong>Note:</strong> Changes to role permissions will affect all users with this role.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
           {/* Removed the duplicate loading and restricted message rendering */}
        </AccessControl>
      </main>
    </div>
  );
};

export default RolePermissionsPage;