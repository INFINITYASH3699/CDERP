"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaHistory,
  FaCalendarAlt,
  FaUserShield,
  FaFilter,
  FaUserCog,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
} from "react-icons/fa";
import Sidebar from "@/components/superadmin/Sidebar";
import AccessControl from "@/components/superadmin/AccessControl";
import { fetchWithAuth } from "@/utils/auth";
import AuditLogDetailsModal from "@/components/superadmin/AuditLogDetailsModal";

// Format date with time
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
  const [userRole, setUserRole] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
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
  }, [router]);

  // Fetch data when page or tab changes
  useEffect(() => {
    if (userRole !== "SuperAdmin" && userRole !== "Admin") return;
    if (activeTab === "audit") {
      fetchAuditLogs(currentPage, filters);
    } else {
      fetchLoginHistory(currentPage, filters);
    }
  }, [currentPage, activeTab]);

  // Fetch admins for filter dropdown
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || window.location.origin;
        const url = `${apiUrl}/api/admins`;
        const adminsResponse = await fetchWithAuth(url);

        if (adminsResponse.ok) {
          const adminsData = await adminsResponse.json();
          setAdmins(adminsData);
        }
      } catch (err) {
        console.error("Error fetching admin users:", err);
      }
    };
    fetchAdmins();
  }, []);

  const fetchAuditLogs = async (page = 1, filterObj = filters) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();

      // Fix for adminId parameter - use performedBy instead
      if (filterObj.adminId) {
        queryParams.append("performedBy", filterObj.adminId);
      }

      if (filterObj.action) queryParams.append("action", filterObj.action);
      if (filterObj.startDate)
        queryParams.append("startDate", filterObj.startDate);
      if (filterObj.endDate) queryParams.append("endDate", filterObj.endDate);

      // Always exclude login actions from audit logs tab
      queryParams.append("excludeActions", "login");

      queryParams.append("page", page);
      queryParams.append("limit", logsPerPage);

      // Debug the URL being fetched
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
      const url = `${apiUrl}/api/audit-logs?${queryParams.toString()}`;

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();

      // Check if we got valid data back
      if (Array.isArray(data.logs)) {
        setLogs(data.logs);
        setTotalItems(data.totalItems || 0);
        setTotalPages(data.totalPages || 1);
        setError(null);
      } else {
        throw new Error("Invalid response format from server");
      }
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

      // Fix for adminId parameter - use userId instead for login history
      if (filterObj.adminId) {
        queryParams.append("userId", filterObj.adminId);
      }

      if (filterObj.startDate)
        queryParams.append("startDate", filterObj.startDate);
      if (filterObj.endDate) queryParams.append("endDate", filterObj.endDate);
      queryParams.append("page", page);
      queryParams.append("limit", logsPerPage);

      // Debug the URL being fetched
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
      const url = `${apiUrl}/api/login-history?${queryParams.toString()}`;

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error("Failed to fetch login history");
      }

      const data = await response.json();

      // Check if we got valid data back
      if (Array.isArray(data.logs)) {
        setLogs(data.logs);
        setTotalItems(data.totalItems || 0);
        setTotalPages(data.totalPages || 1);
        setError(null);
      } else {
        throw new Error("Invalid response format from server");
      }
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

  const openLogModal = (log) => {
    setSelectedLog(log);
  };

  const closeLogModal = () => {
    setSelectedLog(null);
  };

  if (loading) {
    return (
      <div className={styles.adminPanelContainer}>
        <Sidebar activePage="audit-logs" />
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading audit logs...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminPanelContainer}>
      <Sidebar activePage="audit-logs" />
      <main className={styles.mainContent}>
        <AccessControl section="audit-logs">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Audit Logs</h1>
            <p className={styles.pageDescription}>
              Track all actions and login attempts in the system.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#fff5f5",
                borderRadius: "8px",
                border: "1px solid #fc8181",
                margin: "1rem 0",
                color: "#e53e3e",
              }}
            >
              {error}
            </div>
          )}

          <div className={styles.tabsContainer}>
            <div className={styles.tabsList}>
              <button
                className={`${styles.tabButton} ${activeTab === "audit" ? styles.activeTab : ""}`}
                onClick={() => changeTab("audit")}
              >
                <FaHistory style={{ marginRight: "0.5rem" }} /> Audit Logs
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === "login" ? styles.activeTab : ""}`}
                onClick={() => changeTab("login")}
              >
                <FaUserShield style={{ marginRight: "0.5rem" }} /> Login History
              </button>
            </div>

            <div className={styles.chartContainer}>
              <div
                className={styles.formGrid}
                style={{ marginBottom: "1.5rem" }}
              >
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FaUserCog style={{ marginRight: "0.5rem" }} />
                    {activeTab === "audit"
                      ? "Admin User (performedBy)"
                      : "Admin User (userId)"}
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
                      <option value="create_admin">Create Admin</option>
                      <option value="update_admin">Update Admin</option>
                      <option value="delete_admin">Delete Admin</option>
                    </select>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FaCalendarAlt style={{ marginRight: "0.5rem" }} /> Date
                    Range (Start)
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
                    <FaCalendarAlt style={{ marginRight: "0.5rem" }} /> Date
                    Range (End)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className={styles.formInput}
                  />
                </div>

                <div
                  className={styles.formActions}
                  style={{ alignSelf: "flex-end" }}
                >
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
                                  <span
                                    className={`${styles.roleBadge} ${
                                      log.adminId?.role === "SuperAdmin"
                                        ? styles.superAdminBadge
                                        : log.adminId?.role === "Admin"
                                          ? styles.adminBadge
                                          : log.adminId?.role === "ViewMode"
                                            ? styles.viewModeBadge
                                            : styles.editModeBadge
                                    }`}
                                  >
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
                                    <button
                                      onClick={() => openLogModal(log)}
                                      className={styles.viewDetailsBtn}
                                    >
                                      <FaEye className={styles.viewIcon} /> View
                                      Details
                                    </button>
                                  )}
                                </td>
                                <td data-label="Timestamp">
                                  {formatDateTime(log.createdAt)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="6"
                                style={{
                                  textAlign: "center",
                                  padding: "1.5rem",
                                  color: "#e53e3e",
                                }}
                              >
                                {Object.values(filters).some(
                                  (value) => value !== ""
                                )
                                  ? "No audit logs found matching your filter criteria. Try adjusting your filters."
                                  : "No audit logs found"}
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
                                  <span
                                    className={`${styles.roleBadge} ${
                                      log.adminId?.role === "SuperAdmin"
                                        ? styles.superAdminBadge
                                        : log.adminId?.role === "Admin"
                                          ? styles.adminBadge
                                          : log.adminId?.role === "ViewMode"
                                            ? styles.viewModeBadge
                                            : styles.editModeBadge
                                    }`}
                                  >
                                    {log.adminId?.role || "Unknown"}
                                  </span>
                                </td>
                                <td data-label="Status">
                                  <span
                                    className={`${styles.badge} ${log.success ? styles.badgeGreen : styles.badgeRed}`}
                                  >
                                    {log.success ? "Success" : "Failed"}
                                  </span>
                                </td>
                                <td data-label="IP Address">{log.ipAddress}</td>
                                <td data-label="User Agent">
                                  <button
                                    onClick={() => openLogModal(log)}
                                    className={styles.viewDetailsBtn}
                                  >
                                    <FaEye className={styles.viewIcon} /> View
                                    Details
                                  </button>
                                </td>
                                <td data-label="Login Time">
                                  {formatDateTime(log.loginAt)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="6"
                                style={{
                                  textAlign: "center",
                                  padding: "1.5rem",
                                  color: "#e53e3e",
                                }}
                              >
                                {Object.values(filters).some(
                                  (value) => value !== ""
                                )
                                  ? "No login history found matching your filter criteria. Try adjusting your filters."
                                  : "No login history found"}
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

          {/* Modal for displaying details */}
          {selectedLog && (
            <AuditLogDetailsModal log={selectedLog} onClose={closeLogModal} />
          )}
        </AccessControl>
      </main>
    </div>
  );
};

export default AuditLogsPage;
