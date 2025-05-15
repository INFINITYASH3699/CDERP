"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaUsers,
  FaUserCog,
  FaChartBar,
  FaClipboardList,
  FaHistory,
  FaSignOutAlt,
  FaTachometerAlt,
  FaKey,
  FaCalendarAlt,
  FaSpinner,
  FaUserTag,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaCheck,
  FaPhoneAlt,
  FaBan,
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

// Simple bar chart component
const BarChart = ({ data, title, valuePrefix = "", valueSuffix = "" }) => {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.count));

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginTop: "1rem"
      }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{item._id || "Unknown"}</span>
              <span>{valuePrefix}{item.count}{valueSuffix}</span>
            </div>
            <div style={{
              width: "100%",
              backgroundColor: "#e2e8f0",
              height: "0.5rem",
              borderRadius: "0.25rem",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${(item.count / maxValue) * 100}%`,
                backgroundColor: "#4299e1",
                height: "100%"
              }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom date formatter
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Analytics Page
const AnalyticsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });
  const [error, setError] = useState(null);
  const [conversionRates, setConversionRates] = useState(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");

    if (!token) {
      router.push("/AdminLogin");
      return;
    }

    if (role !== "SuperAdmin" && role !== "Admin") {
      router.push("/dashboard");
      return;
    }

    // Fetch analytics data
    fetchAnalytics();
  }, [router]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalytics(data);

      // Calculate conversion rates
      if (data.leads.byStatus) {
        const totalLeads = data.leads.total;
        const convertedLeads = data.leads.byStatus.find(s => s._id === "Converted")?.count || 0;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        const conversionData = {
          rate: conversionRate.toFixed(2),
          totalLeads,
          convertedLeads,
        };

        setConversionRates(conversionData);
      }

    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value,
    });
  };

  // Apply date filters
  const applyDateFilter = async () => {
    setLoading(true);
    // In a real implementation, you would fetch filtered data
    // For now, just simulate a delay and re-use the same data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <SuperAdminLayout activePage="analytics">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading analytics data...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (error) {
    return (
      <SuperAdminLayout activePage="analytics">
        <div className={styles.errorMessage}>{error}</div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout activePage="analytics">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Analytics Dashboard</h1>
        <p className={styles.pageDescription}>
          View key metrics and performance indicators for your system.
        </p>
      </div>

      {/* Date Range Filter */}
      <div className={styles.chartContainer} style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 className={styles.chartTitle}>
            <FaCalendarAlt style={{ marginRight: "0.5rem" }} /> Date Range Filter
          </h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label>From:</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className={styles.formInput}
                style={{ width: "auto" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label>To:</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className={styles.formInput}
                style={{ width: "auto" }}
              />
            </div>
            <button
              onClick={applyDateFilter}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {analytics && (
        <>
          {/* Overview Stats */}
          <h2>Quick Overview</h2>
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
                <FaCheck />
              </div>
              <p className={styles.statLabel}>Converted Leads</p>
              <p className={styles.statValue}>
                {analytics.leads.byStatus.find(s => s._id === "Converted")?.count || 0}
              </p>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.cardIcon} ${styles.cardIconYellow}`}>
                <FaPhoneAlt />
              </div>
              <p className={styles.statLabel}>Contacted Leads</p>
              <p className={styles.statValue}>
                {analytics.leads.byStatus.find(s => s._id === "Contacted")?.count || 0}
              </p>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.cardIcon} ${styles.cardIconRed}`}>
                <FaBan />
              </div>
              <p className={styles.statLabel}>Rejected Leads</p>
              <p className={styles.statValue}>
                {analytics.leads.byStatus.find(s => s._id === "Rejected")?.count || 0}
              </p>
            </div>
          </div>

          {/* Time Frame Stats */}
          <h2>Time Frame Analysis</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.cardIcon} ${styles.cardIconBlue}`}>
                <FaCalendarAlt />
              </div>
              <p className={styles.statLabel}>Last 7 Days</p>
              <p className={styles.statValue}>{analytics.leads.lastWeek}</p>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.cardIcon} ${styles.cardIconPurple}`}>
                <FaCalendarAlt />
              </div>
              <p className={styles.statLabel}>Last 30 Days</p>
              <p className={styles.statValue}>{analytics.leads.lastMonth}</p>
            </div>

            {conversionRates && (
              <div className={styles.statCard}>
                <div className={`${styles.cardIcon} ${styles.cardIconGreen}`}>
                  <FaChartBar />
                </div>
                <p className={styles.statLabel}>Conversion Rate</p>
                <p className={styles.statValue}>{conversionRates.rate}%</p>
              </div>
            )}

            <div className={styles.statCard}>
              <div className={`${styles.cardIcon} ${styles.cardIconRed}`}>
                <FaUserCog />
              </div>
              <p className={styles.statLabel}>Active Admins</p>
              <p className={styles.statValue}>{analytics.admins.active}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
            {/* Status Breakdown */}
            <BarChart
              data={analytics.leads.byStatus}
              title="Lead Status Breakdown"
              valueSuffix=" leads"
            />

            {/* Course Breakdown */}
            <BarChart
              data={analytics.leads.byCourse}
              title="Leads by Course"
              valueSuffix=" leads"
            />

            {/* Location Breakdown */}
            <BarChart
              data={analytics.leads.byLocation}
              title="Leads by Location"
              valueSuffix=" leads"
            />

            {/* Admin Role Distribution */}
            <BarChart
              data={analytics.admins.byRole}
              title="Admin Users by Role"
              valueSuffix=" users"
            />
          </div>

          {/* Admin Performance */}
          <h2 style={{ marginTop: "2rem" }}>System Information</h2>
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Detail</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Category">Leads</td>
                  <td data-label="Detail">Total Count</td>
                  <td data-label="Value">{analytics.leads.total}</td>
                </tr>
                <tr>
                  <td data-label="Category">Leads</td>
                  <td data-label="Detail">Last 7 Days</td>
                  <td data-label="Value">{analytics.leads.lastWeek}</td>
                </tr>
                <tr>
                  <td data-label="Category">Leads</td>
                  <td data-label="Detail">Last 30 Days</td>
                  <td data-label="Value">{analytics.leads.lastMonth}</td>
                </tr>
                <tr>
                  <td data-label="Category">Admin Users</td>
                  <td data-label="Detail">Total Count</td>
                  <td data-label="Value">{analytics.admins.total}</td>
                </tr>
                <tr>
                  <td data-label="Category">Admin Users</td>
                  <td data-label="Detail">Active</td>
                  <td data-label="Value">{analytics.admins.active}</td>
                </tr>
                <tr>
                  <td data-label="Category">System</td>
                  <td data-label="Detail">Current Date</td>
                  <td data-label="Value">{formatDate(new Date())}</td>
                </tr>
                <tr>
                  <td data-label="Category">System</td>
                  <td data-label="Detail">Date Range</td>
                  <td data-label="Value">{formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </SuperAdminLayout>
  );
};

export default AnalyticsPage;
