"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaHistory,
  FaCalendarAlt,
  FaUserShield,
  FaFilter,
  FaTachometerAlt,
  FaUserCog,
  FaUsers,
  FaChartBar,
  FaClipboardList,
  FaSignOutAlt,
  FaKey,
  FaSpinner,
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

// Format date with time
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Audit Logs Page
const AuditLogsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("audit");
  const [filters, setFilters] = useState({
    adminId: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");

    if (!token) {
      router.push("/AdminLogin");
      return;
    }

    if (role !== "SuperAdmin") {
      router.push("/dashboard");
      return;
    }

    // Fetch audit logs and admins
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch admins for filter dropdown
      const adminsResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins`
      );

      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        setAdmins(adminsData);
      }

      // Fetch audit logs
      await fetchAuditLogs();

      // Fetch login history
      await fetchLoginHistory();

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.adminId) queryParams.append('adminId', filters.adminId);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/audit-logs?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();
      setAuditLogs(data);

    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(err.message);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.adminId) queryParams.append('adminId', filters.adminId);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login-history?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch login history");
      }

      const data = await response.json();
      setLoginHistory(data);

    } catch (err) {
      console.error("Error fetching login history:", err);
      setError(err.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const applyFilters = async () => {
    setLoading(true);

    try {
      if (activeTab === "audit") {
        await fetchAuditLogs();
      } else {
        await fetchLoginHistory();
      }
    } catch (err) {
      console.error("Error applying filters:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    setFilters({
      adminId: "",
      action: "",
      startDate: "",
      endDate: "",
    });

    // Fetch data with reset filters
    setLoading(true);

    try {
      if (activeTab === "audit") {
        await fetchAuditLogs();
      } else {
        await fetchLoginHistory();
      }
    } catch (err) {
      console.error("Error resetting filters:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changeTab = async (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <SuperAdminLayout activePage="audit-logs">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading audit logs...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout activePage="audit-logs">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Audit Logs</h1>
        <p className={styles.pageDescription}>
          Track all actions and login attempts in the system.
        </p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          <button
            className={`${styles.tabButton} ${activeTab === 'audit' ? styles.activeTab : ''}`}
            onClick={() => changeTab('audit')}
          >
            <FaHistory style={{ marginRight: "0.5rem" }} /> Audit Logs
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'login' ? styles.activeTab : ''}`}
            onClick={() => changeTab('login')}
          >
            <FaUserShield style={{ marginRight: "0.5rem" }} /> Login History
          </button>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.formGrid} style={{ marginBottom: "1.5rem" }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FaUserCog style={{ marginRight: "0.5rem" }} /> Admin User
              </label>
              <select
                name="adminId"
                value={filters.adminId}
                onChange={handleFilterChange}
                className={styles.formSelect}
              >
                <option value="">All Admins</option>
                {admins.map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.username} ({admin.role})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FaCalendarAlt style={{ marginRight: "0.5rem" }} /> Date Range (Start)
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FaCalendarAlt style={{ marginRight: "0.5rem" }} /> Date Range (End)
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formActions} style={{ alignSelf: "flex-end" }}>
              <button
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={resetFilters}
              >
                Reset
              </button>
              <button
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={applyFilters}
              >
                <FaFilter style={{ marginRight: "0.5rem" }} /> Apply Filters
              </button>
            </div>
          </div>

          {activeTab === "audit" ? (
            <>
              <h2 className={styles.chartTitle}>System Audit Logs</h2>
              <div className={styles.tableCard}>
                <div className={styles.tableResponsive}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Admin</th>
                        <th>Role</th>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Timestamp</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length > 0 ? (
                        auditLogs.map((log) => (
                          <tr key={log._id}>
                            <td data-label="Admin">
                              {log.adminId?.username || "Unknown"}
                            </td>
                            <td data-label="Role">
                              <span className={`${styles.roleBadge} ${
                                log.adminId?.role === "SuperAdmin" ? styles.superAdminBadge :
                                log.adminId?.role === "Admin" ? styles.adminBadge :
                                log.adminId?.role === "ViewMode" ? styles.viewModeBadge :
                                styles.editModeBadge
                              }`}>
                                {log.adminId?.role || "Unknown"}
                              </span>
                            </td>
                            <td data-label="Action">
                              <span className={styles.badge}>
                                {log.action}
                              </span>
                            </td>
                            <td data-label="Target">{log.target}</td>
                            <td data-label="Timestamp">
                              {formatDateTime(log.createdAt)}
                            </td>
                            <td data-label="Details">
                              {log.metadata && (
                                <details>
                                  <summary>View Details</summary>
                                  <pre style={{
                                    whiteSpace: "pre-wrap",
                                    fontSize: "0.75rem",
                                    margin: "0.5rem 0",
                                    padding: "0.5rem",
                                    backgroundColor: "#f7fafc",
                                    borderRadius: "0.25rem"
                                  }}>
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className={styles.errorMessage}>
                            No audit logs found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className={styles.chartTitle}>Login History</h2>
              <div className={styles.tableCard}>
                <div className={styles.tableResponsive}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Admin</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>IP Address</th>
                        <th>User Agent</th>
                        <th>Login Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginHistory.length > 0 ? (
                        loginHistory.map((log) => (
                          <tr key={log._id}>
                            <td data-label="Admin">
                              {log.adminId?.username || "Unknown"}
                            </td>
                            <td data-label="Role">
                              <span className={`${styles.roleBadge} ${
                                log.adminId?.role === "SuperAdmin" ? styles.superAdminBadge :
                                log.adminId?.role === "Admin" ? styles.adminBadge :
                                log.adminId?.role === "ViewMode" ? styles.viewModeBadge :
                                styles.editModeBadge
                              }`}>
                                {log.adminId?.role || "Unknown"}
                              </span>
                            </td>
                            <td data-label="Status">
                              <span className={`${styles.badge} ${log.success ? styles.badgeGreen : styles.badgeRed}`}>
                                {log.success ? "Success" : "Failed"}
                              </span>
                            </td>
                            <td data-label="IP Address">{log.ipAddress}</td>
                            <td data-label="User Agent">
                              <details>
                                <summary>View User Agent</summary>
                                <div style={{
                                  whiteSpace: "pre-wrap",
                                  fontSize: "0.75rem",
                                  margin: "0.5rem 0"
                                }}>
                                  {log.userAgent}
                                </div>
                              </details>
                            </td>
                            <td data-label="Login Time">
                              {formatDateTime(log.loginAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className={styles.errorMessage}>
                            No login history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default AuditLogsPage;
