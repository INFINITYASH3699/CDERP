"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaKey,
  FaUndo, // Although not used in this specific component, keep if part of shared styles
  // Removed icons that are now in the reusable Sidebar
  // FaTachometerAlt, FaUserCog, FaUsers, FaChartBar,
  // FaClipboardList, FaHistory, FaSignOutAlt, FaCog,
} from "react-icons/fa";
// Removed Link import from here as it's used within the Sidebar
// import Link from "next/link";

import Sidebar from "@/components/superadmin/Sidebar"; // Import reusable Sidebar
import AccessControl from "@/components/superadmin/AccessControl"; // Import reusable AccessControl
import { fetchWithAuth } from "@/utils/auth"; // Import reusable fetch utility

// Array of 20 distinct colors for admin users with names
const COLOR_OPTIONS = [
  { code: "#4299e1", name: "Blue" },
  { code: "#48bb78", name: "Green" },
  { code: "#ed8936", name: "Orange" },
  { code: "#f56565", name: "Red" },
  { code: "#9f7aea", name: "Purple" },
  { code: "#667eea", name: "Indigo" },
  { code: "#f687b3", name: "Pink" },
  { code: "#ecc94b", name: "Yellow" },
  { code: "#38b2ac", name: "Teal" },
  { code: "#fc8181", name: "Light Red" },
  { code: "#68d391", name: "Light Green" },
  { code: "#63b3ed", name: "Light Blue" },
  { code: "#4c51bf", name: "Dark Blue" },
  { code: "#6b46c1", name: "Dark Purple" },
  { code: "#dd6b20", name: "Dark Orange" },
  { code: "#805ad5", name: "Medium Purple" },
  { code: "#b794f4", name: "Light Purple" },
  { code: "#9ae6b4", name: "Light Mint" },
  { code: "#f6ad55", name: "Light Orange" },
  { code: "#feb2b2", name: "Light Coral" },
];

// Removed the inline Authenticated fetch utility definition
// Removed the inline SuperAdminLayout Component definition

// User Management Page
const UserManagement = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // "create", "edit", "delete", "reset"
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Admin",
    location: "Other",
    color: "#4299e1", // Default color
    active: true, // Default status for new admin
  });
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [userRole, setUserRole] = useState(null); // Store current user's role from localStorage

  // Get a list of colors already in use by other admins
  const getUsedColors = (currentAdminId = null) => {
    return admins
      .filter((admin) => (currentAdminId ? admin._id !== currentAdminId : true))
      .map((admin) => admin.color)
      .filter(Boolean); // Remove undefined/null values
  };

  // Get available colors (not used by other admins)
  const getAvailableColors = (currentAdminId = null) => {
    const usedColors = getUsedColors(currentAdminId);
    return COLOR_OPTIONS.filter((color) => !usedColors.includes(color.code));
  };

  // Find color name by color code
  const getColorName = (colorCode) => {
    if (!colorCode) return "Default Blue";
    const colorObj = COLOR_OPTIONS.find((color) => color.code === colorCode);
    return colorObj ? colorObj.name : "Custom";
  };

  // Authentication check and initial data fetch
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");
    setUserRole(role); // Set user role state

    if (!token) {
      router.push("/AdminLogin");
      return; // Stop further execution if not authenticated
    }

    // The AccessControl component will handle showing the restricted message
    // for non-SuperAdmins. We still fetch admins data if authenticated,
    // as it's needed for the table even if restricted.

    fetchAdmins();

    // The fetchAdmins function will set loading to false when done.
    // If fetchAdmins fails, loading will also be set to false, and error will be set.
  }, [router]); // Depend on router for initial check

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Use empty string as fallback
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL is not defined");
        setError("API URL is not configured.");
        setLoading(false);
        return;
      }

      const response = await fetchWithAuth(`${apiUrl}/api/admins`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch admin users response:",
          response.status,
          errorText
        );
        throw new Error(
          `Failed to fetch admin users: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Ensure each admin has all required fields with defaults if missing
      const processedData = Array.isArray(data)
        ? data.map((admin) => ({
            ...admin,
            location: admin.location || "Other",
            color: admin.color || "#4299e1", // Ensure default color if missing
            active: admin.active !== undefined ? admin.active : true, // Ensure active status exists, default to true
          }))
        : [];

      setAdmins(processedData);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError(err.message || "Failed to fetch admin users. Please try again.");
      setAdmins([]); // Clear admins on error
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Check username
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Check email format (only if provided)
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Invalid email address";
    }

    // Check passwords for create or reset operations
    if (modalType === "create" || modalType === "reset") {
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const openCreateModal = () => {
    // Get the first available color or default to blue if none available
    const availableColors = getAvailableColors();
    const defaultColor =
      availableColors.length > 0 ? availableColors[0].code : "#4299e1";

    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Admin", // Default role
      location: "Other", // Default location
      color: defaultColor, // Assign an available color
      active: true, // Default status
    });
    setFormErrors({}); // Clear previous errors
    setModalType("create");
    setShowModal(true);
    setError(null); // Clear page-level error
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);

    setFormData({
      username: admin.username || "",
      email: admin.email || "",
      role: admin.role || "Admin", // Default role if missing
      active: admin.active !== undefined ? admin.active : true, // Default active if missing
      location: admin.location || "Other", // Default location if missing
      color: admin.color || "#4299e1", // Default color if missing
      password: "", // Passwords are not pre-filled for security
      confirmPassword: "",
    });
    setFormErrors({}); // Clear previous errors
    setModalType("edit");
    setShowModal(true);
    setError(null); // Clear page-level error
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setModalType("delete");
    setShowModal(true);
    setError(null); // Clear page-level error
  };

  const openResetPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    // Only reset password fields, keep admin info for display
    setFormData({
      ...formData, // Keep existing values like role, location etc.
      username: admin.username || "",
      email: admin.email || "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({}); // Clear previous errors
    setModalType("reset");
    setShowModal(true);
    setError(null); // Clear page-level error
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAdmin(null);
    setFormErrors({}); // Clear errors when closing modal
    setError(null); // Clear page-level error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle delete separately as it doesn't use form validation the same way
    if (modalType === "delete") {
      await handleDeleteAdmin();
      return;
    }

    // Validate form for create, edit, and reset
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setSubmitting(true);
    setError(null); // Clear previous page-level errors on submit

    try {
      if (modalType === "create") {
        await createAdmin();
      } else if (modalType === "edit") {
        await updateAdmin();
      } else if (modalType === "reset") {
        await resetPassword();
      }
    } catch (err) {
      console.error("Error in form submission:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const createAdmin = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) throw new Error("API URL is not configured.");

      const response = await fetchWithAuth(
        `${apiUrl}/api/admins`, // Assuming this is the correct endpoint for creating admins
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username.trim(), // Trim whitespace
            email: formData.email.trim() || undefined, // Send undefined if empty
            password: formData.password,
            role: formData.role,
            location: formData.location,
            color: formData.color,
            active: true, // New admins are active by default
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create admin");
      }

      // Success
      await fetchAdmins(); // Refresh the list
      closeModal();
    } catch (err) {
      console.error("Error creating admin:", err);
      // Error state is set in handleSubmit
      throw err; // Re-throw to be caught by handleSubmit
    }
  };

  const updateAdmin = async () => {
    try {
      if (!selectedAdmin?._id) throw new Error("No admin selected for update.");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) throw new Error("API URL is not configured.");

      const updateData = {
        role: formData.role,
        active: formData.active,
        email: formData.email.trim() || undefined, // Send undefined if empty
        location: formData.location,
        color: formData.color,
        // Password is not sent in the general update; use resetPassword instead
      };

      // Prevent changing role or status of the currently logged-in SuperAdmin
      if (
        selectedAdmin._id === getCurrentUserID() &&
        userRole === "SuperAdmin"
      ) {
        // Should not be able to change role or status of self if SuperAdmin
        // Frontend should ideally disable these fields, but double-check here too.
        delete updateData.role;
        delete updateData.active;
        console.warn(
          "Attempted to change role or status of logged-in SuperAdmin. Action prevented."
        );
      }

      const response = await fetchWithAuth(
        `${apiUrl}/api/admins/${selectedAdmin._id}`, // Assuming this is the correct endpoint
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error(
          "Error response during admin update:",
          response.status,
          data
        );
        throw new Error(
          data.message || `Failed to update admin: ${response.statusText}`
        );
      }

      const data = await response.json(); // Assuming backend returns the updated admin

      // Update local admin data immediately with the response from the server
      if (data && data.admin) {
        // Ensure the updated admin has all fields properly set from the response
        const updatedAdmin = {
          ...data.admin,
          // Add any missing fields from response using defaults if needed
          location: data.admin.location || "Other",
          color: data.admin.color || "#4299e1",
          active: data.admin.active !== undefined ? data.admin.active : true,
        };

        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin._id === selectedAdmin._id
              ? updatedAdmin // Use the complete updatedAdmin object from server response
              : admin
          )
        );
      } else {
        // If we didn't get admin data back, refresh the whole list
        await fetchAdmins();
      }

      closeModal();
    } catch (err) {
      console.error("Error updating admin:", err);
      // Error state is set in handleSubmit
      throw err; // Re-throw to be caught by handleSubmit
    }
  };

  const resetPassword = async () => {
    try {
      if (!selectedAdmin?._id)
        throw new Error("No admin selected for password reset.");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) throw new Error("API URL is not configured.");

      const response = await fetchWithAuth(
        `${apiUrl}/api/admins/${selectedAdmin._id}/reset-password`, // Assuming a specific endpoint for password reset
        {
          method: "POST", // Or PUT, depending on your API design
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: formData.password,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error(
          "Error response during password reset:",
          response.status,
          data
        );
        throw new Error(
          data.message || `Failed to reset password: ${response.statusText}`
        );
      }

      closeModal();
      alert(
        `Password for "${selectedAdmin.username}" has been reset successfully.`
      );
    } catch (err) {
      console.error("Error resetting password:", err);
      // Error state is set in handleSubmit
      throw err; // Re-throw to be caught by handleSubmit
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin?._id) {
      console.warn("No admin selected for deletion. Skipping.");
      closeModal();
      return;
    }

    // Prevent deleting the currently logged-in user
    if (selectedAdmin._id === getCurrentUserID()) {
      alert("You cannot delete your own user account.");
      console.warn("Attempted to delete logged-in user.");
      closeModal();
      return;
    }
    // Prevent deleting the SuperAdmin role if it's the only SuperAdmin
    // This check might be better handled on the backend, but a frontend check is also good.
    if (selectedAdmin.role === "SuperAdmin") {
      const superAdmins = admins.filter((admin) => admin.role === "SuperAdmin");
      if (superAdmins.length <= 1) {
        alert("Cannot delete the last SuperAdmin account.");
        console.warn("Attempted to delete the last SuperAdmin account.");
        closeModal();
        return;
      }
    }

    setSubmitting(true);
    setError(null); // Clear previous page-level errors

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) throw new Error("API URL is not configured.");

      const response = await fetchWithAuth(
        `${apiUrl}/api/admins/${selectedAdmin._id}`, // Assuming this is the correct endpoint
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error(
          "Error response during admin delete:",
          response.status,
          data
        );
        throw new Error(
          data.message || `Failed to delete admin: ${response.statusText}`
        );
      }

      await fetchAdmins(); // Refresh the list (will also turn off loading)
      closeModal();
    } catch (err) {
      console.error("Error deleting admin:", err);
      setError(err.message || "Failed to delete admin. Please try again.");
      setSubmitting(false); // Turn off submitting on error
    }
    // Submitting is turned off inside fetchAdmins finally block if successful
  };

  const toggleAdminStatus = async (admin) => {
    // Prevent changing status of the currently logged-in user
    if (admin._id === getCurrentUserID()) {
      alert("You cannot change the status of your own user account.");
      console.warn("Attempted to change status of logged-in user.");
      return;
    }

    setLoading(true); // Show loading indicator
    setError(null); // Clear previous errors

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) throw new Error("API URL is not configured.");

      const response = await fetchWithAuth(
        `${apiUrl}/api/admins/${admin._id}`, // Assuming this is the correct endpoint for status update
        {
          method: "PUT", // Using PUT for partial update
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !admin.active, // Toggle the active status
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error(
          "Error response during status toggle:",
          response.status,
          data
        );
        throw new Error(
          data.message ||
            `Failed to update admin status: ${response.statusText}`
        );
      }

      // Success
      // Update the specific admin in the local state without refetching the whole list
      setAdmins((prevAdmins) =>
        prevAdmins.map((a) =>
          a._id === admin._id ? { ...a, active: !a.active } : a
        )
      );
    } catch (err) {
      console.error("Error toggling admin status:", err);
      setError(
        err.message || "Failed to update admin status. Please try again."
      );
    } finally {
      setLoading(false); // Turn off loading after status update attempt
    }
  };

  const getCurrentUserID = () => {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem("adminId")
      : null;
  };

  // If still loading initial data and user role is not yet determined/checked
  if (loading && userRole === null) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading authentication...</p>
      </div>
    );
  }

  // Use the imported Sidebar and AccessControl components
  return (
    <div className={styles.adminPanelContainer}>
      {/* Sidebar is always present */}
      <Sidebar activePage="users" />

      <main className={styles.mainContent}>
        {/* AccessControl handles the overall access to this page's content */}
        <AccessControl section="users">
          {/* Content only visible to SuperAdmins (and possibly specific Admins) based on AccessControl */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>User Management</h1>
            <p className={styles.pageDescription}>
              Create and manage admin users and their permissions.
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <FaTimes
                className={styles.errorIcon}
                style={{ marginRight: "0.5rem" }}
              />{" "}
              {error}
            </div>
          )}

          <div
            className={styles.formActions}
            style={{ marginBottom: "1.5rem" }}
          >
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={openCreateModal}
              disabled={loading || submitting}
            >
              <FaUserPlus style={{ marginRight: "0.5rem" }} /> Create New Admin
            </button>
          </div>

          {loading && !admins.length ? ( // Show full-page loader only if no admins are loaded yet
            <div className={styles.loadingContainer}>
              <div className={styles.loader}></div>
              <p>Loading users...</p>
            </div>
          ) : (
            <div className={styles.tableCard}>
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Color</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length > 0 ? (
                      admins.map((admin) => (
                        <tr key={admin._id}>
                          <td data-label="Username">{admin.username}</td>
                          <td data-label="Email">{admin.email || "—"}</td>
                          <td data-label="Role">
                            <span
                              className={`${styles.roleBadge} ${
                                admin.role === "SuperAdmin"
                                  ? styles.superAdminBadge
                                  : admin.role === "Admin"
                                    ? styles.adminBadge
                                    : admin.role === "ViewMode"
                                      ? styles.viewModeBadge
                                      : styles.editModeBadge // Assuming EditMode uses editModeBadge
                              }`}
                            >
                              {admin.role}
                            </span>
                          </td>
                          <td data-label="Location">{admin.location || "—"}</td>{" "}
                          {/* Display default if null/undefined */}
                          <td data-label="Color">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <div
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "4px",
                                  backgroundColor: admin.color || "#4299e1", // Use default if color is missing
                                  display: "inline-block",
                                  border: "1px solid #ddd",
                                }}
                              ></div>
                              {/* Optional: Display color name/code next to swatch */}
                              {/* <span style={{ color: '#555' }}>{getColorName(admin.color)}</span> */}
                            </div>
                          </td>
                          <td data-label="Status">
                            <span
                              className={
                                admin.active
                                  ? styles.badgeGreen
                                  : styles.badgeRed
                              }
                            >
                              {admin.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td data-label="Created At">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </td>
                          <td
                            data-label="Actions"
                            style={{ display: "flex", gap: "0.5rem" }}
                          >
                            <button
                              onClick={() => openEditModal(admin)}
                              className={`${styles.button} ${styles.secondaryButton}`}
                              style={{ padding: "0.25rem 0.5rem" }}
                              disabled={
                                submitting ||
                                (admin._id === getCurrentUserID() &&
                                  userRole === "SuperAdmin")
                              } // Prevent editing self if SuperAdmin
                              title="Edit User"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => openResetPasswordModal(admin)}
                              className={`${styles.button} ${styles.secondaryButton}`}
                              style={{ padding: "0.25rem 0.5rem" }}
                              disabled={
                                submitting || admin.role === "SuperAdmin"
                              } // Prevent resetting SuperAdmin password via this interface
                              title="Reset Password"
                            >
                              <FaKey />
                            </button>
                            <button
                              onClick={() => toggleAdminStatus(admin)}
                              className={`${styles.button} ${admin.active ? styles.dangerButton : styles.primaryButton}`}
                              style={{ padding: "0.25rem 0.5rem" }}
                              disabled={
                                submitting ||
                                admin._id === getCurrentUserID() ||
                                admin.role === "SuperAdmin"
                              } // Prevent deactivating self or SuperAdmin role
                              title={
                                admin.active
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >
                              {admin.active ? <FaTimes /> : <FaCheck />}
                            </button>
                            <button
                              onClick={() => openDeleteModal(admin)}
                              className={`${styles.button} ${styles.dangerButton}`}
                              style={{ padding: "0.25rem 0.5rem" }}
                              disabled={
                                submitting ||
                                admin._id === getCurrentUserID() ||
                                admin.role === "SuperAdmin"
                              } // Prevent deleting self or SuperAdmin role
                              title="Delete User"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className={styles.noDataMessage}>
                          {" "}
                          {/* Use noDataMessage class */}
                          {error
                            ? `Error loading admin users: ${error}`
                            : "No admin users found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>
                    {modalType === "create"
                      ? "Create New Admin User"
                      : modalType === "edit"
                        ? "Edit Admin User"
                        : modalType === "delete"
                          ? "Delete Admin User"
                          : "Reset Password"}
                  </h3>
                  <button
                    className={styles.modalCloseButton}
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>
                {error && ( // Display modal-specific errors (though handled by page error state now)
                  <div className={styles.errorMessage}>
                    <FaTimes
                      className={styles.errorIcon}
                      style={{ marginRight: "0.5rem" }}
                    />{" "}
                    {error}
                  </div>
                )}
                {/* Display form errors inline */}
                <form onSubmit={handleSubmit}>
                  <div className={styles.modalBody}>
                    {modalType === "delete" ? (
                      <p>
                        Are you sure you want to delete the admin user "
                        {selectedAdmin?.username}"?
                      </p>
                    ) : (
                      <>
                        {/* Username field - readonly for edit mode */}
                        <div className={styles.formGroup}>
                          <label
                            className={styles.formLabel}
                            htmlFor="username"
                          >
                            Username <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={`${styles.formInput} ${formErrors.username ? styles.inputError : ""}`}
                            readOnly={modalType !== "create"} // Readonly if not creating
                            required
                            disabled={submitting}
                          />
                          {formErrors.username && (
                            <p className={styles.formError}>
                              {formErrors.username}
                            </p>
                          )}
                        </div>

                        {/* Email field */}
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="email">
                            Email (optional)
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`${styles.formInput} ${formErrors.email ? styles.inputError : ""}`}
                            disabled={submitting}
                          />
                          {formErrors.email && (
                            <p className={styles.formError}>
                              {formErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Location field */}
                        {(modalType === "create" || modalType === "edit") && (
                          <div className={styles.formGroup}>
                            <label
                              className={styles.formLabel}
                              htmlFor="location"
                            >
                              Location
                            </label>
                            <select
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              className={styles.formSelect}
                              disabled={submitting}
                            >
                              <option value="Pune">Pune</option>
                              <option value="Mumbai">Mumbai</option>
                              <option value="Raipur">Raipur</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        )}

                        {/* Color field */}
                        {(modalType === "create" || modalType === "edit") &&
                          // Disable color selection for SuperAdmins (or remove if they shouldn't have colors)
                          selectedAdmin?.role !== "SuperAdmin" && (
                            <div className={styles.formGroup}>
                              <label
                                className={styles.formLabel}
                                htmlFor="color"
                              >
                                Color
                              </label>
                              <div className={styles.colorSelectContainer}>
                                <select
                                  id="color"
                                  name="color"
                                  value={formData.color}
                                  onChange={handleInputChange}
                                  className={styles.formSelect}
                                  style={{ paddingLeft: "30px" }}
                                  disabled={submitting}
                                >
                                  {/* Add current color if editing and it's not in available list */}
                                  {modalType === "edit" &&
                                    selectedAdmin?.color &&
                                    !getAvailableColors(
                                      selectedAdmin?._id
                                    ).some(
                                      (c) => c.code === selectedAdmin.color
                                    ) && (
                                      <option
                                        value={selectedAdmin.color}
                                        style={{
                                          backgroundColor: `${selectedAdmin.color}20`,
                                        }}
                                      >
                                        {getColorName(selectedAdmin.color)} (
                                        {selectedAdmin.color}) - Current
                                      </option>
                                    )}

                                  {/* List available colors */}
                                  {getAvailableColors(selectedAdmin?._id).map(
                                    (color, index) => (
                                      <option
                                        key={index}
                                        value={color.code}
                                        style={{
                                          backgroundColor: `${color.code}20`,
                                        }}
                                      >
                                        {color.name} ({color.code})
                                      </option>
                                    )
                                  )}
                                  {/* Add a generic option if no colors are available, or if you allow custom colors */}
                                  {getAvailableColors(selectedAdmin?._id)
                                    .length === 0 &&
                                    modalType !== "edit" && (
                                      <option value="" disabled>
                                        No colors available
                                      </option>
                                    )}
                                </select>
                                <div
                                  style={{
                                    position: "absolute",
                                    left: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "16px",
                                    height: "16px",
                                    backgroundColor:
                                      formData.color || "#4299e1",
                                    borderRadius: "3px",
                                    border: "1px solid #ddd",
                                    pointerEvents: "none",
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  marginTop: "0.5rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor:
                                      formData.color || "#4299e1",
                                    borderRadius: "4px",
                                    border: "1px solid #ddd",
                                  }}
                                />
                                <span>Color Preview</span>
                              </div>
                            </div>
                          )}

                        {/* Password fields - only for create and reset */}
                        {(modalType === "create" || modalType === "reset") && (
                          <>
                            <div className={styles.formGroup}>
                              <label
                                className={styles.formLabel}
                                htmlFor="password"
                              >
                                New Password{" "}
                                <span className={styles.required}>*</span>
                              </label>
                              <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`${styles.formInput} ${formErrors.password ? styles.inputError : ""}`}
                                required
                                disabled={submitting}
                              />
                              {formErrors.password && (
                                <p className={styles.formError}>
                                  {formErrors.password}
                                </p>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label
                                className={styles.formLabel}
                                htmlFor="confirmPassword"
                              >
                                Confirm New Password{" "}
                                <span className={styles.required}>*</span>
                              </label>
                              <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={`${styles.formInput} ${formErrors.confirmPassword ? styles.inputError : ""}`}
                                required
                                disabled={submitting}
                              />
                              {formErrors.confirmPassword && (
                                <p className={styles.formError}>
                                  {formErrors.confirmPassword}
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        {/* Role dropdown - only for create and edit */}
                        {(modalType === "create" || modalType === "edit") && (
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="role">
                              Role <span className={styles.required}>*</span>
                            </label>
                            <select
                              id="role"
                              name="role"
                              value={formData.role}
                              onChange={handleInputChange}
                              className={styles.formSelect}
                              disabled={
                                submitting ||
                                selectedAdmin?.role === "SuperAdmin"
                              } // Prevent changing role of SuperAdmin
                              required
                            >
                              <option value="Admin">Admin</option>
                              <option value="ViewMode">View Mode</option>
                              <option value="EditMode">Edit Mode</option>
                              {/* Only allow creating/assigning SuperAdmin role if current user is SuperAdmin */}
                              {userRole === "SuperAdmin" && (
                                <option value="SuperAdmin">Super Admin</option>
                              )}
                            </select>
                          </div>
                        )}

                        {/* Active status toggle - only for edit */}
                        {modalType === "edit" && (
                          <div className={styles.formGroup}>
                            <label
                              className={styles.formLabel}
                              htmlFor="active"
                            >
                              Status <span className={styles.required}>*</span>
                            </label>
                            <select
                              id="active"
                              name="active"
                              value={formData.active.toString()} // Use toString for select value
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  active: e.target.value === "true", // Convert string back to boolean
                                })
                              }
                              className={styles.formSelect}
                              disabled={
                                submitting ||
                                selectedAdmin?._id === getCurrentUserID()
                              } // Prevent changing status of logged-in user
                              required
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      onClick={closeModal}
                      className={`${styles.button} ${styles.secondaryButton}`}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`${styles.button} ${
                        modalType === "delete"
                          ? styles.dangerButton
                          : styles.primaryButton
                      }`}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <FaSpinner
                            className={styles.spinner}
                            style={{ marginRight: "0.5rem" }}
                          />
                          {modalType === "create"
                            ? "Creating..."
                            : modalType === "edit"
                              ? "Updating..."
                              : modalType === "delete"
                                ? "Deleting..."
                                : "Resetting..."}
                        </>
                      ) : (
                        <>
                          {modalType === "create"
                            ? "Create Admin"
                            : modalType === "edit"
                              ? "Update Admin"
                              : modalType === "delete"
                                ? "Delete Admin"
                                : "Reset Password"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </AccessControl>
      </main>
    </div>
  );
};

export default UserManagement;
