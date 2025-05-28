"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaUsers,
  FaUserCog,
  FaChartBar,
} from "react-icons/fa";
import Link from "next/link";
import Sidebar from "@/components/superadmin/Sidebar";
import AccessControl from "@/components/superadmin/AccessControl";
import { fetchWithAuth } from "@/utils/auth";

const SuperAdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);

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

    fetchDashboardData();
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
      <div className={styles.adminPanelContainer}>
        <Sidebar activePage="dashboard" />
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading dashboard data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.adminPanelContainer}>
        <Sidebar activePage="dashboard" />
        <main className={styles.mainContent}>
          <div className={styles.errorMessage}>Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminPanelContainer}>
      <Sidebar activePage="dashboard" />
      <main className={styles.mainContent}>
        <AccessControl section="dashboard">
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
        </AccessControl>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;