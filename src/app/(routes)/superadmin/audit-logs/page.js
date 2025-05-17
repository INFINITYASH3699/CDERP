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
  FaChevronLeft,
  FaChevronRight,
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
  const [role, setRole] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("adminRole");
    setRole(storedRole);
    setChecked(true);
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

  if (!checked) {
    // Wait for role to be loaded from localStorage
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (role !== "SuperAdmin") {
    // Show complete sidebar with styled restricted message for non-SuperAdmin users
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
                  className={styles.sidebarLink}
                >
                  <FaTachometerAlt className={styles.sidebarIcon} />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/superadmin/users"
                  className={styles.sidebarLink}
                >
                  <FaUserCog className={styles.sidebarIcon} />
                  User Management
                </Link>
              </li>
              <li>
                <Link
                  href="/superadmin/leads"
                  className={styles.sidebarLink}
                >
                  <FaUsers className={styles.sidebarIcon} />
                  Lead Management
                </Link>
              </li>
              <li>
                <Link
                  href="/superadmin/analytics"
                  className={styles.sidebarLink}
                >
                  <FaChartBar className={styles.sidebarIcon} />
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/superadmin/audit-logs"
                  className={`${styles.sidebarLink} ${styles.activeLink}`}
                >
                  <FaHistory className={styles.sidebarIcon} />
                  Audit Logs
                </Link>
              </li>
              <li>
                <Link
                  href="/superadmin/roles"
                  className={styles.sidebarLink}
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
              You do not have access to the Audit Logs section. Please contact a SuperAdmin for assistance.
            </p>
            <p>Your current role permissions do not allow access to this functionality.</p>
          </div>
        </main>
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
  const [logs, setLogs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("audit"); // "audit" or "login"
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    adminId: "",
    action: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [userRole, setUserRole] = useState(null); // To track current user role
  const logsPerPage = 10;
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

    if (role !== "SuperAdmin" && role !== "Admin") {
      router.push("/dashboard");
      return;
    }

    // Fetch initial data
    if (activeTab === "audit") {
      fetchAuditLogs(1, filters);
    } else {
      fetchLoginHistory(1, filters);
    }
    // eslint-disable-next-line
  }, [router]);

  // Fetch data when page or tab changes
  useEffect(() => {
    if (userRole !== "SuperAdmin" && userRole !== "Admin") return;
    if (activeTab === "audit") {
      fetchAuditLogs(currentPage, filters);
    } else {
      fetchLoginHistory(currentPage, filters);
    }
    // eslint-disable-next-line
  }, [currentPage, activeTab]);

  // Fetch admins for filter dropdown
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminsResponse = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admins`
        );
        if (adminsResponse.ok) {
          const adminsData = await adminsResponse.json();
          setAdmins(adminsData);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchAdmins();
  }, []);

  const fetchAuditLogs = async (page = 1, filterObj = filters) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterObj.adminId) queryParams.append('adminId', filterObj.adminId);
      if (filterObj.action) queryParams.append('action', filterObj.action);
      if (filterObj.startDate) queryParams.append('startDate', filterObj.startDate);
      if (filterObj.endDate) queryParams.append('endDate', filterObj.endDate);

      // Always exclude login actions from audit logs tab
      queryParams.append('excludeActions', 'login');

      queryParams.append('page', page);
      queryParams.append('limit', logsPerPage);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/audit-logs?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
      setLogs([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async (page = 1, filterObj = filters) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterObj.adminId) queryParams.append('adminId', filterObj.adminId);
      if (filterObj.startDate) queryParams.append('startDate', filterObj.startDate);
      if (filterObj.endDate) queryParams.append('endDate', filterObj.endDate);
      queryParams.append('page', page);
      queryParams.append('limit', logsPerPage);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login-history?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch login history");
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
      setLogs([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
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
    setCurrentPage(1); // Reset to first page when applying filters
    setLoading(true);

    try {
      if (activeTab === "audit") {
        await fetchAuditLogs(1, filters);
      } else {
        await fetchLoginHistory(1, filters);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    const reset = {
      adminId: "",
      action: "",
      startDate: "",
      endDate: "",
    };
    setFilters(reset);
    setCurrentPage(1);

    setLoading(true);

    try {
      if (activeTab === "audit") {
        await fetchAuditLogs(1, reset);
      } else {
        await fetchLoginHistory(1, reset);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changeTab = async (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setLoading(true);
    try {
      if (tab === "audit") {
        await fetchAuditLogs(1, filters);
      } else {
        await fetchLoginHistory(1, filters);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
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

  // If Admin role, show restricted message
  if (userRole === "Admin") {
    return (
      <SuperAdminLayout activePage="audit-logs">
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
            You do not have access to the Audit Logs section. Please contact a SuperAdmin for assistance.
          </p>
          <p>Your current role permissions do not allow access to this functionality.</p>
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

      {error && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#fff5f5",
          borderRadius: "8px",
          border: "1px solid #fc8181",
          margin: "1rem 0",
          color: "#e53e3e"
        }}>
          {error}
        </div>
      )}

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

            {activeTab === "audit" && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaFilter style={{ marginRight: "0.5rem" }} /> Action Type
                </label>
                <select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  className={styles.formSelect}
                >
                  <option value="">All Actions</option>
                  <option value="create_lead">Create Lead</option>
                  <option value="update_lead">Update Lead</option>
                  <option value="delete_lead">Delete Lead</option>
                  {/* Removed login option since it's in Login History tab */}
                  <option value="create_admin">Create Admin</option>
                  <option value="update_admin">Update Admin</option>
                  <option value="delete_admin">Delete Admin</option>
                </select>
              </div>
            )}

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
                        <th>Details</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length > 0 ? (
                        logs.map((log) => (
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
                            <td data-label="Details">
                              {log.metadata && (
                                <details>
                                  <summary>View Details</summary>
                                  <div style={{
                                    whiteSpace: "pre-wrap",
                                    fontSize: "0.75rem",
                                    margin: "0.5rem 0",
                                    padding: "0.5rem",
                                    backgroundColor: "#f7fafc",
                                    borderRadius: "0.25rem"
                                  }}>
                                    {log.metadata.userId && (
                                      <div className={styles.auditDetail}>
                                        <strong>Lead ID:</strong> {log.metadata.userId}
                                      </div>
                                    )}
                                    {log.metadata.leadName && (
                                      <div className={styles.auditDetail}>
                                        <strong>Name:</strong> {log.metadata.leadName}
                                      </div>
                                    )}
                                    {log.metadata.leadEmail && (
                                      <div className={styles.auditDetail}>
                                        <strong>Email:</strong> {log.metadata.leadEmail}
                                      </div>
                                    )}
                                    {log.metadata.leadContact && (
                                      <div className={styles.auditDetail}>
                                        <strong>Contact:</strong> {log.metadata.leadContact}
                                      </div>
                                    )}
                                    {log.metadata && log.metadata.updateFields && (
                                      <div className={styles.auditDetail}>
                                        <strong>Updated Fields:</strong>
                                        <pre style={{
                                          margin: "8px 0",
                                          padding: "12px",
                                          backgroundColor: "#f8f9fa",
                                          borderRadius: "4px",
                                          border: "1px solid #eaeaea",
                                          fontSize: "13px",
                                          whiteSpace: "pre-wrap",
                                          wordBreak: "break-word"
                                        }}>
                                          {(() => {
                                            // Extremely safe rendering of updateFields
                                            const updateFields = log?.metadata?.updateFields;
                                            if (
                                              updateFields &&
                                              typeof updateFields === "object" &&
                                              !Array.isArray(updateFields)
                                            ) {
                                              try {
                                                return JSON.stringify(updateFields, null, 2);
                                              } catch (e) {
                                                return "[Unable to display updateFields]";
                                              }
                                            }
                                            if (updateFields === null) return "null";
                                            if (updateFields === undefined) return "undefined";
                                            return String(updateFields);
                                          })()}
                                        </pre>
                                      </div>
                                    )}
                                    {!log.metadata.userId && !log.metadata.updateFields && (
                                      <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                                    )}
                                  </div>
                                </details>
                              )}
                            </td>
                            <td data-label="Timestamp">
                              {formatDateTime(log.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: "1.5rem", color: "#e53e3e" }}>
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
                      {logs.length > 0 ? (
                        logs.map((log) => (
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
                          <td colSpan="6" style={{ textAlign: "center", padding: "1.5rem", color: "#e53e3e" }}>
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

          {/* Pagination controls */}
          <div className={styles.paginationControls}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className={styles.pageIndicator}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalItems === 0}
              className={styles.paginationButton}
            >
              Next <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default AuditLogsPage;
