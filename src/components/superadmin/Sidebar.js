"use client";
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
} from "react-icons/fa";
import Link from "next/link";

const Sidebar = ({ activePage }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminId");
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/AdminLogin");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Super Admin</h2>
      </div>
      <nav>
        <ul className={styles.sidebarNav}>
          <li>
            <Link
              href="/superadmin/dashboard"
              className={`${styles.sidebarLink} ${activePage === "dashboard" ? styles.activeLink : ""}`}
            >
              <FaTachometerAlt className={styles.sidebarIcon} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/superadmin/users"
              className={`${styles.sidebarLink} ${activePage === "users" ? styles.activeLink : ""}`}
            >
              <FaUserCog className={styles.sidebarIcon} />
              User Management
            </Link>
          </li>
          <li>
            <Link
              href="/superadmin/leads"
              className={`${styles.sidebarLink} ${activePage === "leads" ? styles.activeLink : ""}`}
            >
              <FaUsers className={styles.sidebarIcon} />
              Lead Management
            </Link>
          </li>
          <li>
            <Link
              href="/superadmin/analytics"
              className={`${styles.sidebarLink} ${activePage === "analytics" ? styles.activeLink : ""}`}
            >
              <FaChartBar className={styles.sidebarIcon} />
              Analytics
            </Link>
          </li>
          <li>
            <Link
              href="/superadmin/audit-logs"
              className={`${styles.sidebarLink} ${activePage === "audit-logs" ? styles.activeLink : ""}`}
            >
              <FaHistory className={styles.sidebarIcon} />
              Audit Logs
            </Link>
          </li>
          <li>
            <Link
              href="/superadmin/roles"
              className={`${styles.sidebarLink} ${activePage === "roles" ? styles.activeLink : ""}`}
            >
              <FaKey className={styles.sidebarIcon} />
              Role Permissions
            </Link>
          </li>
          <li>
            <Link
              href="/superadmin/settings"
              className={`${styles.sidebarLink} ${activePage === "settings" ? styles.activeLink : ""}`}
            >
              <FaCog className={styles.sidebarIcon} />
              Settings
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className={styles.sidebarLink}>
              <FaClipboardList className={styles.sidebarIcon} />
              Go to Dashboard
            </Link>
          </li>
          <li>
            <a href="#" onClick={handleLogout} className={styles.sidebarLink}>
              <FaSignOutAlt className={styles.sidebarIcon} />
              Logout
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
