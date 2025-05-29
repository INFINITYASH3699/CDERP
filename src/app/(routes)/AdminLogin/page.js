"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons, including eye icons

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State for login error message
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  // Check if already logged in
  useEffect(() => {
    // Check if localStorage is available (for SSR/SSG safety)
    if (typeof localStorage !== "undefined") {
      const token = localStorage.getItem("adminToken");
      if (token) {
        const role = localStorage.getItem("adminRole");
        // Redirect based on role if token exists
        if (role === "SuperAdmin" || role === "Admin") {
          router.push("/superadmin/dashboard"); // Redirect to superadmin dashboard
        } else {
          router.push("/dashboard"); // Redirect to regular dashboard
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e, targetPage) => {
    e.preventDefault(); // Prevent default form submission if called from a button inside a form
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBaseUrl) {
        console.error("NEXT_PUBLIC_API_URL is not defined");
        setError("API URL is not configured.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiBaseUrl}/api/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store auth info in localStorage
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("adminToken", data.token);
          localStorage.setItem("adminRole", data.role);
          localStorage.setItem("adminUsername", data.username);
          localStorage.setItem("adminId", data.id);
          localStorage.setItem("isAdminLoggedIn", "true"); // Consider if this is necessary
        }

        // Redirect based on role
        if (data.role === "SuperAdmin" || data.role === "Admin") {
          router.push("/superadmin/dashboard"); // Redirect SuperAdmins/Admins to their dashboard
        } else if (targetPage.startsWith("http")) {
          window.location.href = targetPage; // Redirect to external URL if specified
        } else {
          router.push("/dashboard"); // Default redirect for other roles
        }
      } else {
        // Login failed
        setError(data.message || "Admin login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again."); // Set a generic server error message
    }

    setLoading(false); // Always set loading false after attempt
  };

  return (
    // Main section with background image, centering, and full viewport height
    <section
      className="flex justify-center items-center min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://img.freepik.com/premium-vector/background-night-mountains-whimsical-cartoon-illustration-night-mountains_198565-8267.jpg')`,
      }}
    >
      {/* Form Box Container with blur effect */}
      <div className="relative w-full max-w-sm md:max-w-md bg-transparent backdrop-filter backdrop-blur-md border border-wheat text-yellow-100 flex flex-col justify-center items-center text-center rounded-3xl p-6 md:p-8 min-h-[400px]">
        {" "}
        {/* Adjusted size and padding */}
        <form
          onSubmit={(e) => handleSubmit(e, "/dashboard")}
          className="w-full"
        >
          {" "}
          {/* Added w-full to form */}
          {/* Heading */}
          <h2 className="text-2xl font-bold text-center mb-6 text-yellow-100 text-shadow-sm">
            {" "}
            {/* Added mb for spacing, explicit color and shadow */}
            Admin Log-In
          </h2>
          {/* Optional: Display error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
              {error}
            </div>
          )}
          {/* Username/Email Input */}
          <div className="relative mx-auto mb-6 w-full border-b-2 border-yellow-100 text-shadow">
            {" "}
            {/* Adjusted margin, explicit border color/width */}
            <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-yellow-100" />{" "}
            {/* Icon with positioning and color */}
            <input
              type="text"
              name="username"
              id="admin_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="peer w-full h-12 bg-transparent border-none outline-none text-base px-3 pr-10 text-yellow-100 placeholder-transparent" // peer for label, placeholder-transparent to hide default, adjusted padding
              placeholder="Username or Email" // Added placeholder for accessibility
            />
            <label
              htmlFor="admin_username"
              className="absolute top-1/2 left-0 transform -translate-y-1/2 text-base pointer-events-none transition-all duration-400 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-shadow-none peer-valid:-top-2 peer-valid:text-sm peer-valid:text-shadow-none" // Peer focus/valid states, adjusted top
            >
              Username or Email
            </label>
          </div>
          {/* Password Input with Show/Hide Toggle */}
          <div className="relative mx-auto mb-8 w-full border-b-2 border-yellow-100 text-shadow">
            {" "}
            {/* Adjusted margin */}
            <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-yellow-100" />{" "}
            {/* Lock Icon on the left */}
            <input
              // Dynamically change type based on showPassword state
              type={showPassword ? "text" : "password"}
              name="password"
              id="login_password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              // Adjusted padding to accommodate icons on both sides
              className="peer w-full h-12 bg-transparent border-none outline-none text-base px-3 pl-10 pr-10 text-yellow-100 placeholder-transparent" // peer for label, adjusted padding
              placeholder="Password" // Added placeholder for accessibility
            />
            <label
              htmlFor="login_password"
              className="absolute top-1/2 left-0 transform -translate-y-1/2 text-base pointer-events-none transition-all duration-400 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-shadow-none peer-valid:-top-2 peer-valid:text-sm peer-valid:text-shadow-none" // Peer focus/valid states, adjusted top
            >
              Password
            </label>
            {/* Show/Hide Password Toggle Button */}
            <button
              type="button" // Important: Use type="button" to prevent form submission
              onClick={() => setShowPassword((prev) => !prev)} // Toggle state
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xl text-yellow-100 p-1 focus:outline-none" // Positioning and basic styling
              aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility label
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}{" "}
              {/* Conditionally render eye icons */}
            </button>
          </div>
          {/* Submit Buttons */}
          <div className="flex flex-col items-center gap-4 w-full">
            {" "}
            {/* Added w-full */}
            {/* Dashboard Login Button */}
            <button
              type="button" // Keep type="button" as you are using onClick
              onClick={(e) => handleSubmit(e, "/dashboard")}
              disabled={loading} // Disable button while loading
              className="w-4/5 h-11 rounded-full bg-orange-700 text-white text-lg font-semibold border-none outline-none cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center" // Adjusted height, added flex/center for loading spinner
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Logging In...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </button>
            {/* Blogs Login Button */}
            <button
              type="button" // Keep type="button" as you are using onClick
              onClick={(e) =>
                handleSubmit(e, "https://blog-frontend-psi-bay.vercel.app/")
              }
              disabled={loading} // Disable button while loading
              className="w-4/5 h-11 rounded-full bg-orange-700 text-white text-lg font-semibold border-none outline-none cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center" // Adjusted height, added flex/center for loading spinner
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Logging In...
                </>
              ) : (
                "Login to Blogs"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminLogin;
