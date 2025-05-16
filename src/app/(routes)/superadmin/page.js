"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaUsers,
  FaUserCog,
  FaChartBar,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt,
  FaHistory,
  FaKey,
  FaSpinner,
} from "react-icons/fa";
import Link from "next/link";

// Helper function to check if Admin has access to a section
const checkAdminAccess = (section) => {
  // Get user role from local storage
  const role = typeof localStorage !== 'undefined' ? localStorage.getItem("adminRole") : null;

  // Admin can access: Dashboard, Lead Management, Analytics, Go to Dashboard
  if (role === "Admin") {
    const allowedSections = ["dashboard", "leads", "analytics"];
    return allowedSections.includes(section);
  }

  // SuperAdmin can access all sections
  return true;
};

// Restricted section component
const RestrictedSection = () => {
  return (
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
        You do not have access to this section. Please contact a SuperAdmin for assistance.
      </p>
      <p>Your current role permissions do not allow access to this functionality.</p>
    </div>
  );
};

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
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    // Check if current user (when Admin) is allowed to access the current section
    const userRole = localStorage.getItem("adminRole");

    if (userRole === "Admin") {
      setHasAccess(checkAdminAccess(activePage));
    } else {
      setHasAccess(true);
    }
  }, [activePage]);

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
        {!hasAccess ? <RestrictedSection /> : children}
      </main>
    </div>
  );
};

// SuperAdmin Dashboard Component
const SuperAdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

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

    // Fetch dashboard data
    fetchDashboardData();
    // eslint-disable-next-line
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch analytics data
      const analyticsResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics`
      );

      if (!analyticsResponse.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      // Fetch admin users
      const adminsResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins`
      );

      if (!adminsResponse.ok) {
        throw new Error("Failed to fetch admin users");
      }

      const adminsData = await adminsResponse.json();
      setAdmins(adminsData);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout activePage="dashboard">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading dashboard data...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (error) {
    return (
      <SuperAdminLayout activePage="dashboard">
        <div className={styles.errorMessage}>Error: {error}</div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout activePage="dashboard">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageDescription}>
          Welcome to the SuperAdmin panel. Here's an overview of your system.
        </p>
      </div>

      {analytics && (
        <>
          <h2>Lead Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.cardIcon} ${styles.cardIconBlue}`}>
                <FaUsers />
              </div>
              <p className={styles.statLabel}>Total Leads</p>
              <p className={styles.statValue}>{analytics.leads.total}</p>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.cardIcon} ${styles.cardIconGreen}`}>
                <FaChartBar />
              </div>
              <p className={styles.statLabel}>Last Week</p>
              <p className={styles.statValue}>{analytics.leads.lastWeek}</p>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.cardIcon} ${styles.cardIconPurple}`}>
                <FaChartBar />
              </div>
              <p className={styles.statLabel}>Last Month</p>
              <p className={styles.statValue}>{analytics.leads.lastMonth}</p>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.cardIcon} ${styles.cardIconRed}`}>
                <FaUserCog />
              </div>
              <p className={styles.statLabel}>Active Admins</p>
              <p className={styles.statValue}>{analytics.admins.active}</p>
            </div>
          </div>

          <h2>Lead Status Breakdown</h2>
          <div className={styles.chartContainer}>
            <div className={styles.statsGrid}>
              {analytics.leads.byStatus.map((status, index) => (
                <div className={styles.statCard} key={index}>
                  <p className={styles.statLabel}>{status._id || "Unspecified"}</p>
                  <p className={styles.statValue}>{status.count}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <h2>Admin Users</h2>
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td data-label="Username">{admin.username}</td>
                  <td data-label="Role">
                    <span className={`${styles.roleBadge} ${
                      admin.role === "SuperAdmin" ? styles.superAdminBadge :
                      admin.role === "Admin" ? styles.adminBadge :
                      admin.role === "ViewMode" ? styles.viewModeBadge :
                      styles.editModeBadge
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={admin.active ? styles.badgeGreen : styles.badgeRed}>
                      {admin.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td data-label="Created At">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.formActions}>
        <Link href="/superadmin/users" className={`${styles.button} ${styles.primaryButton}`}>
          Manage Users
        </Link>
        <Link href="/superadmin/leads" className={`${styles.button} ${styles.secondaryButton}`}>
          Manage Leads
        </Link>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
