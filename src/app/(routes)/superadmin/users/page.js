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
  FaUndo,
  FaTachometerAlt,
  FaUserCog,
  FaUsers,
  FaChartBar,
  FaClipboardList,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";
import Link from "next/link";

// Array of 20 distinct colors for admin users with names
const COLOR_OPTIONS = [
  { code: '#4299e1', name: 'Blue' },
  { code: '#48bb78', name: 'Green' },
  { code: '#ed8936', name: 'Orange' },
  { code: '#f56565', name: 'Red' },
  { code: '#9f7aea', name: 'Purple' },
  { code: '#667eea', name: 'Indigo' },
  { code: '#f687b3', name: 'Pink' },
  { code: '#ecc94b', name: 'Yellow' },
  { code: '#38b2ac', name: 'Teal' },
  { code: '#fc8181', name: 'Light Red' },
  { code: '#68d391', name: 'Light Green' },
  { code: '#63b3ed', name: 'Light Blue' },
  { code: '#4c51bf', name: 'Dark Blue' },
  { code: '#6b46c1', name: 'Dark Purple' },
  { code: '#dd6b20', name: 'Dark Orange' },
  { code: '#805ad5', name: 'Medium Purple' },
  { code: '#b794f4', name: 'Light Purple' },
  { code: '#9ae6b4', name: 'Light Mint' },
  { code: '#f6ad55', name: 'Light Orange' },
  { code: '#feb2b2', name: 'Light Coral' }
];

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
    color: "#4299e1",
  });
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [userRole, setUserRole] = useState(null); // Store current user's role

  // Get a list of colors already in use by other admins
  const getUsedColors = (currentAdminId = null) => {
    return admins
      .filter(admin => currentAdminId ? admin._id !== currentAdminId : true)
      .map(admin => admin.color)
      .filter(Boolean); // Remove undefined/null values
  };

  // Get available colors (not used by other admins)
  const getAvailableColors = (currentAdminId = null) => {
    const usedColors = getUsedColors(currentAdminId);
    return COLOR_OPTIONS.filter(color => !usedColors.includes(color.code));
  };

  // Find color name by color code
  const getColorName = (colorCode) => {
    if (!colorCode) return 'Default Blue';
    const colorObj = COLOR_OPTIONS.find(color => color.code === colorCode);
    return colorObj ? colorObj.name : 'Custom';
  };

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

    // Fetch admins data (will be used if SuperAdmin, and for filtering available colors)
    fetchAdmins();
  }, [router]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch admin users");
      }

      const data = await response.json();
      console.log("Admin data fetched (raw):", data);

      // Ensure each admin has all required fields with defaults if missing
      const processedData = data.map(admin => ({
        ...admin,
        location: admin.location || "Other",
        color: admin.color || "#4299e1"
      }));

      console.log("Admin data processed:", processedData);
      setAdmins(processedData);

    } catch (err) {
      console.error("Error fetching admins:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Check username
    if (!formData.username.trim()) {
      errors.username = "Username is required";
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

    // Clear error for this field
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
    const defaultColor = availableColors.length > 0 ? availableColors[0].code : "#4299e1";

    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Admin",
      location: "Other",
      color: defaultColor,
    });
    setFormErrors({});
    setModalType("create");
    setShowModal(true);
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);

    // Log the admin object for debugging
    console.log("Opening edit modal for admin:", admin);

    setFormData({
      username: admin.username,
      email: admin.email || "",
      role: admin.role,
      active: admin.active,
      location: admin.location,
      color: admin.color,
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
    setModalType("edit");
    setShowModal(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setModalType("delete");
    setShowModal(true);
  };

  const openResetPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      ...formData,
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
    setModalType("reset");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAdmin(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modalType === "delete") {
      await handleDeleteAdmin();
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

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
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const createAdmin = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            location: formData.location,
            color: formData.color,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create admin");
      }

      // Success
      console.log("Admin created successfully");
      await fetchAdmins(); // Refresh the list
      closeModal();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateAdmin = async () => {
    try {
      const updateData = {
        role: formData.role,
        active: formData.active,
        email: formData.email,
        location: formData.location,
        color: formData.color,
      };

      console.log("Updating admin with data:", updateData);

      // Store the original color for comparison
      const originalColor = selectedAdmin?.color;
      const originalLocation = selectedAdmin?.location;

      console.log("Original values:", { originalColor, originalLocation });

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins/${selectedAdmin._id}`,
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
        throw new Error(data.message || "Failed to update admin");
      }

      const data = await response.json();

      // Update local admin data immediately
      if (data && data.admin) {
        console.log("Admin data updated:", data.admin);

        // Ensure the updated admin has all fields properly set
        const updatedAdmin = {
          ...data.admin,
          location: data.admin.location || formData.location,
          color: data.admin.color || formData.color
        };

        console.log("Processed updated admin:", updatedAdmin);

        setAdmins(prevAdmins => prevAdmins.map(admin =>
          admin._id === selectedAdmin._id
            ? { ...admin, ...updatedAdmin }
            : admin
        ));
      } else {
        // If we didn't get admin data in response, refresh the whole list
        console.log("Refreshing admin data after update");
        await fetchAdmins();
      }

      // If color was changed, notify the user
      if (originalColor !== formData.color) {
        alert(`Admin color updated to ${getColorName(formData.color)}. Please use the Refresh button on the Dashboard and Lead Management pages to see the updated colors for assigned leads.`);
      }

      closeModal();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins/${selectedAdmin._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to reset password");
      }

      // Success
      closeModal();
      alert("Password has been reset successfully");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleDeleteAdmin = async () => {
    setSubmitting(true);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins/${selectedAdmin._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete admin");
      }

      // Success
      await fetchAdmins(); // Refresh the list
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAdminStatus = async (admin) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins/${admin._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !admin.active,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update admin status");
      }

      // Success
      await fetchAdmins(); // Refresh the list
    } catch (err) {
      console.error("Error toggling admin status:", err);
      setError(err.message);
    }
  };

  const getCurrentUserID = () => {
    return localStorage.getItem("adminId");
  };

  if (loading) {
    return (
      <SuperAdminLayout activePage="users">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading users...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  // If Admin role, show restricted message
  if (userRole === "Admin") {
    return (
      <SuperAdminLayout activePage="users">
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
            You do not have access to the User Management section. Please contact a SuperAdmin for assistance.
          </p>
          <p>Your current role permissions do not allow access to this functionality.</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout activePage="users">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>User Management</h1>
        <p className={styles.pageDescription}>
          Create and manage admin users and their permissions.
        </p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.formActions} style={{ marginBottom: "1.5rem" }}>
        <button
          className={`${styles.button} ${styles.primaryButton}`}
          onClick={openCreateModal}
        >
          <FaUserPlus style={{ marginRight: "0.5rem" }} /> Create New Admin
        </button>
      </div>

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
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td data-label="Username">{admin.username}</td>
                  <td data-label="Email">{admin.email || "—"}</td>
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
                  <td data-label="Location">{admin.location}</td>
                  <td data-label="Color">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "4px",
                        backgroundColor: admin.color,
                        display: "inline-block",
                        border: "1px solid #ddd"
                      }}></div>
                      {/* <span style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backgroundColor: `${admin.color}20`,
                        border: `1px solid ${admin.color}40`
                      }}>
                        {getColorName(admin.color)} ({admin.color})
                      </span> */}
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={admin.active ? styles.badgeGreen : styles.badgeRed}>
                      {admin.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td data-label="Created At">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td data-label="Actions" style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => openEditModal(admin)}
                      className={`${styles.button} ${styles.secondaryButton}`}
                      style={{ padding: "0.25rem 0.5rem" }}
                      disabled={admin._id === getCurrentUserID() && admin.role === "SuperAdmin"}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => openResetPasswordModal(admin)}
                      className={`${styles.button} ${styles.secondaryButton}`}
                      style={{ padding: "0.25rem 0.5rem" }}
                      title="Reset Password"
                    >
                      <FaKey />
                    </button>
                    <button
                      onClick={() => toggleAdminStatus(admin)}
                      className={`${styles.button} ${admin.active ? styles.dangerButton : styles.primaryButton}`}
                      style={{ padding: "0.25rem 0.5rem" }}
                      disabled={admin._id === getCurrentUserID()}
                      title={admin.active ? "Deactivate" : "Activate"}
                    >
                      {admin.active ? <FaTimes /> : <FaCheck />}
                    </button>
                    <button
                      onClick={() => openDeleteModal(admin)}
                      className={`${styles.button} ${styles.dangerButton}`}
                      style={{ padding: "0.25rem 0.5rem" }}
                      disabled={admin._id === getCurrentUserID() || admin.role === "SuperAdmin"}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan="8" className={styles.errorMessage}>
                    No admin users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalType === "create" ? "Create New Admin User" :
                 modalType === "edit" ? "Edit Admin User" :
                 modalType === "delete" ? "Delete Admin User" :
                 "Reset Password"}
              </h3>
              <button
                className={styles.modalCloseButton}
                onClick={closeModal}
                disabled={submitting}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {modalType === "delete" ? (
                  <p>Are you sure you want to delete the admin user "{selectedAdmin?.username}"?</p>
                ) : (
                  <>
                    {/* Username field - readonly for edit mode */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="username">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        readOnly={modalType !== "create"}
                        required
                      />
                      {formErrors.username && (
                        <p className={styles.errorMessage}>{formErrors.username}</p>
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
                        className={styles.formInput}
                      />
                      {formErrors.email && (
                        <p className={styles.errorMessage}>{formErrors.email}</p>
                      )}
                    </div>

                    {/* Location field */}
                    {(modalType === "create" || modalType === "edit") && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="location">
                          Location
                        </label>
                        <select
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className={styles.formSelect}
                        >
                          <option value="Pune">Pune</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Raipur">Raipur</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    )}

                    {/* Color field */}
                    {(modalType === "create" || modalType === "edit") && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="color">
                          Color
                        </label>
                        <div className={styles.colorSelectContainer}>
                          <select
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className={styles.formSelect}
                            style={{ paddingLeft: '30px' }}
                          >
                            {/* Include current color if editing even if used elsewhere */}
                            {modalType === "edit" && formData.color &&
                              !getAvailableColors(selectedAdmin?._id).map(c => c.code).includes(formData.color) && (
                              <option value={formData.color} style={{ backgroundColor: `${formData.color}20` }}>
                                {getColorName(formData.color)} ({formData.color}) - Current
                              </option>
                            )}

                            {/* List available colors */}
                            {getAvailableColors(selectedAdmin?._id).map((color, index) => (
                              <option key={index} value={color.code} style={{ backgroundColor: `${color.code}20` }}>
                                {color.name} ({color.code})
                              </option>
                            ))}
                          </select>
                          <div
                            style={{
                              position: 'absolute',
                              left: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '16px',
                              height: '16px',
                              backgroundColor: formData.color || '#4299e1',
                              borderRadius: '3px',
                              border: '1px solid #ddd',
                              pointerEvents: 'none'
                            }}
                          />
                        </div>
                        <div style={{
                          marginTop: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem"
                        }}>
                          <div style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: formData.color || "#4299e1",
                            borderRadius: "4px",
                            border: "1px solid #ddd"
                          }} />
                          <span>Color Preview</span>
                        </div>
                      </div>
                    )}

                    {/* Password fields - only for create and reset */}
                    {(modalType === "create" || modalType === "reset") && (
                      <>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="password">
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={styles.formInput}
                            required
                          />
                          {formErrors.password && (
                            <p className={styles.errorMessage}>{formErrors.password}</p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="confirmPassword">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={styles.formInput}
                            required
                          />
                          {formErrors.confirmPassword && (
                            <p className={styles.errorMessage}>{formErrors.confirmPassword}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Role dropdown - only for create and edit */}
                    {(modalType === "create" || modalType === "edit") && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="role">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className={styles.formSelect}
                          disabled={selectedAdmin?.role === "SuperAdmin"}
                        >
                          <option value="Admin">Admin</option>
                          <option value="ViewMode">View Mode</option>
                          <option value="EditMode">Edit Mode</option>
                          <option value="SuperAdmin">Super Admin</option>
                        </select>
                      </div>
                    )}

                    {/* Active status toggle - only for edit */}
                    {modalType === "edit" && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="active">
                          Status
                        </label>
                        <select
                          id="active"
                          name="active"
                          value={formData.active.toString()}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              active: e.target.value === "true",
                            })
                          }
                          className={styles.formSelect}
                          disabled={selectedAdmin?._id === getCurrentUserID()}
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
                    modalType === "delete" ? styles.dangerButton : styles.primaryButton
                  }`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className={styles.spinner} style={{ marginRight: "0.5rem" }} />
                      {modalType === "create" ? "Creating..." :
                       modalType === "edit" ? "Updating..." :
                       modalType === "delete" ? "Deleting..." :
                       "Resetting..."}
                    </>
                  ) : (
                    <>
                      {modalType === "create" ? "Create Admin" :
                       modalType === "edit" ? "Update Admin" :
                       modalType === "delete" ? "Delete Admin" :
                       "Reset Password"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default UserManagement;
