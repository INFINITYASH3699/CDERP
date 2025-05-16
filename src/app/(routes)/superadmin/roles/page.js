"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaSave,
  FaUndo,
  FaSpinner,
  FaInfoCircle,
  FaTachometerAlt,
  FaUserCog,
  FaUsers,
  FaChartBar,
  FaClipboardList,
  FaHistory,
  FaSignOutAlt,
  FaKey,
} from "react-icons/fa";
import Link from "next/link";

// Authenticated fetch utility
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

// SuperAdmin Layout Component
const SuperAdminLayout = ({ children, activePage }) => {
  const router = useRouter();
  const [roleChecked, setRoleChecked] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("adminRole");
    if (role === "SuperAdmin") {
      setIsSuperAdmin(true);
    } else {
      setIsSuperAdmin(false);
    }
    setRoleChecked(true);
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminId");
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/AdminLogin");
  };

  if (!roleChecked) {
    // Prevent flicker
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

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

// Permission Table Component
const PermissionTable = ({ roleData, onChange, readOnly }) => {
  const handleCheckboxChange = (category, action, value) => {
    if (readOnly) return;

    const newPermissions = {
      ...roleData.permissions,
      [category]: {
        ...roleData.permissions[category],
        [action]: value,
      },
    };

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
              checked={roleData.permissions.users.create}
              onChange={(e) => handleCheckboxChange("users", "create", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.users.read}
              onChange={(e) => handleCheckboxChange("users", "read", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.users.update}
              onChange={(e) => handleCheckboxChange("users", "update", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.users.delete}
              onChange={(e) => handleCheckboxChange("users", "delete", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>-</td>
        </tr>
        <tr>
          <td>Leads</td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.leads.create}
              onChange={(e) => handleCheckboxChange("leads", "create", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.leads.read}
              onChange={(e) => handleCheckboxChange("leads", "read", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.leads.update}
              onChange={(e) => handleCheckboxChange("leads", "update", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.leads.delete}
              onChange={(e) => handleCheckboxChange("leads", "delete", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>-</td>
        </tr>
        <tr>
          <td>Admins</td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.admins.create}
              onChange={(e) => handleCheckboxChange("admins", "create", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.admins.read}
              onChange={(e) => handleCheckboxChange("admins", "read", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.admins.update}
              onChange={(e) => handleCheckboxChange("admins", "update", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.admins.delete}
              onChange={(e) => handleCheckboxChange("admins", "delete", e.target.checked)}
              disabled={readOnly}
            />
          </td>
          <td>-</td>
        </tr>
        <tr>
          <td>Analytics</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.analytics.view}
              onChange={(e) => handleCheckboxChange("analytics", "view", e.target.checked)}
              disabled={readOnly}
            />
          </td>
        </tr>
        <tr>
          <td>Audit Logs</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>
            <input
              type="checkbox"
              checked={roleData.permissions.auditLogs.view}
              onChange={(e) => handleCheckboxChange("auditLogs", "view", e.target.checked)}
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
  const [activeRole, setActiveRole] = useState("Admin");
  const [hasChanges, setHasChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeRoleData, setActiveRoleData] = useState(null);
  const [originalRoleData, setOriginalRoleData] = useState(null);
  const [userRole, setUserRole] = useState(null); // Track user role

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");
    setUserRole(role);

    if (!token) {
      router.push("/AdminLogin");
      return;
    }

    if (role !== "SuperAdmin" && role !== "Admin") {
      router.push("/dashboard");
      return;
    }

    // Fetch role permissions
    fetchPermissions();
    // eslint-disable-next-line
  }, [router]);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/role-permissions`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch role permissions");
      }

      const data = await response.json();
      setPermissions(data);

      // Set active role data
      const activeRoleData = data.find(r => r.role === activeRole);
      if (activeRoleData) {
        setActiveRoleData(activeRoleData);
        setOriginalRoleData(JSON.parse(JSON.stringify(activeRoleData))); // Deep copy
      }

    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    // Check for unsaved changes
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Discard them?")) {
        return;
      }
    }

    setActiveRole(role);
    const roleData = permissions.find(r => r.role === role);
    if (roleData) {
      setActiveRoleData(roleData);
      setOriginalRoleData(JSON.parse(JSON.stringify(roleData))); // Deep copy
      setHasChanges(false);
    }
  };

  const handlePermissionsChange = (newPermissions) => {
    setActiveRoleData({
      ...activeRoleData,
      permissions: newPermissions,
    });

    // Check if there are changes
    setHasChanges(JSON.stringify(newPermissions) !== JSON.stringify(originalRoleData.permissions));
  };

  const handleReset = () => {
    if (originalRoleData) {
      setActiveRoleData(JSON.parse(JSON.stringify(originalRoleData))); // Reset to original
      setHasChanges(false);
    }
  };

  const handleSave = async () => {
    if (!activeRoleData) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/role-permissions/${activeRoleData.role}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            permissions: activeRoleData.permissions,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update role permissions");
      }

      // Success
      setHasChanges(false);
      setOriginalRoleData(JSON.parse(JSON.stringify(activeRoleData))); // Update original

      // Refresh all permissions
      await fetchPermissions();

    } catch (err) {
      console.error("Error updating permissions:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout activePage="roles">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading role permissions...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  // If Admin role, show restricted message
  if (userRole === "Admin") {
    return (
      <SuperAdminLayout activePage="roles">
        <div style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#fff5f5",
          borderRadius: "8px",
          border: "1px solid #fc8181",
          margin: "2rem auto",
          maxWidth: "800px"
        }}>
          <h2 style={{ color: "#e53e3e", marginBottom: "1rem" }}>Access Restricted</h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
            You do not have access to the Role Permissions section. Please contact a SuperAdmin for assistance.
          </p>
          <p>Your current role permissions do not allow access to this functionality.</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout activePage="roles">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Role Permissions</h1>
        <p className={styles.pageDescription}>
          Manage what each role can access and modify in the system.
        </p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

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
          <div className={styles.chartContainer}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 className={styles.chartTitle}>
                {activeRoleData.role} Role Permissions
              </h2>

              <div className={styles.formActions}>
                {activeRoleData.role !== "SuperAdmin" && (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {activeRoleData.role === "SuperAdmin" && (
              <div className={styles.bulkActionBar} style={{ backgroundColor: "#fff5f5" }}>
                <FaInfoCircle style={{ color: "#e53e3e", marginRight: "0.5rem" }} />
                <span>SuperAdmin permissions cannot be modified. SuperAdmins have full access to all features.</span>
              </div>
            )}

            <PermissionTable
              roleData={activeRoleData}
              onChange={handlePermissionsChange}
              readOnly={activeRoleData.role === "SuperAdmin"}
            />

            {activeRoleData.role !== "SuperAdmin" && (
              <p>
                <strong>Note:</strong> Changes to role permissions will affect all users with this role.
              </p>
            )}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default RolePermissionsPage;
