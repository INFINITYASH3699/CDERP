"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/adminlogin/AdminLogin.module.css";

const AdminLogin = () => {
  const [username, set_username] = useState("");
  const [password, set_password] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handle_submit = async (e, target_page) => {
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
        localStorage.setItem("isAdminLoggedIn", "true");
        if (target_page.startsWith("http")) {
          window.location.href = target_page;
        } else {
          router.push(target_page);
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
        <form onSubmit={(e) => handle_submit(e, "/dashboard")}>
          <h2>Admin Log-In</h2>
          <div className={styles.input_box}>
            <ion-icon name="person-outline"></ion-icon>
            <input
              type="text"
              name="username"
              id="admin_username"
              value={username}
              onChange={(e) => set_username(e.target.value)}
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
              onChange={(e) => set_password(e.target.value)}
              required
            />
            <label htmlFor="login_password">Password</label>
          </div>
          <div className={styles.submit_box}>
            <button
              type="button"
              className={styles.admin_btn}
              onClick={(e) => handle_submit(e, "/dashboard")}
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login In to Dashboard"}
            </button>
            <button
              type="button"
              className={styles.admin_btn}
              onClick={(e) => handle_submit(e, "https://blog-frontend-psi-bay.vercel.app/")}
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
