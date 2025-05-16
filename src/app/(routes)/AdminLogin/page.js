"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/adminlogin/AdminLogin.module.css";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      const role = localStorage.getItem("adminRole");
      if (role === "SuperAdmin") {
        router.push("/superadmin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleSubmit = async (e, targetPage) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiBaseUrl}/api/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store auth info in localStorage
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminRole", data.role);
        localStorage.setItem("adminUsername", data.username);
        localStorage.setItem("adminId", data.id);
        localStorage.setItem("isAdminLoggedIn", "true");

        // Redirect based on role
        if (data.role === "SuperAdmin") {
          router.push("/superadmin");
        } else if (targetPage.startsWith("http")) {
          window.location.href = targetPage;
        } else {
          router.push("/dashboard");
        }
      } else {
        alert(data.message || "Admin login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <section className={styles.admin_login_section}>
      <div className={styles.form_box}>
        <form onSubmit={(e) => handleSubmit(e, "/dashboard")}>
          <h2>Admin Log-In</h2>
          <div className={styles.input_box}>
            <ion-icon name="person-outline"></ion-icon>
            <input
              type="text"
              name="username"
              id="admin_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="admin_username">Username</label>
          </div>

          <div className={styles.input_box}>
            <ion-icon name="lock-closed-outline"></ion-icon>
            <input
              type="password"
              name="password"
              id="login_password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="login_password">Password</label>
          </div>
          <div className={styles.submit_box}>
            <button
              type="button"
              className={styles.admin_btn}
              onClick={(e) => handleSubmit(e, "/dashboard")}
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login In to Dashboard"}
            </button>
            <button
              type="button"
              className={styles.admin_btn}
              onClick={(e) => handleSubmit(e, "https://blog-frontend-psi-bay.vercel.app/")}
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login In to Blogs"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminLogin;
