"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import Sidebar from "@/components/superadmin/Sidebar";

const SuperAdmin = () => {
  const router = useRouter();

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

    // Redirect to dashboard by default
    router.push("/superadmin/dashboard");
  }, [router]);

  return (
    <div className={styles.adminPanelContainer}>
      <Sidebar activePage="" />
      <main className={styles.mainContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading...</p>
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;