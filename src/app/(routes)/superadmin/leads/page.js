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
  FaFilter,
  FaDownload,
  FaSearch,
  FaCalendarAlt,
  FaTrash,
  FaEdit,
  FaSpinner,
  FaCheckSquare,
  FaSquare,
  FaUserEdit,
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

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Lead Management Page
const LeadManagementPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // "create", "edit", "assign"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    countryCode: "",
    coursename: "",
    location: "",
    status: "New",
    notes: "",
    assignedTo: "",
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    assignedTo: "",
    coursename: "",
    location: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const leadsPerPage = 20;
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState("status"); // "status", "assign", "delete"
  const [bulkFormData, setBulkFormData] = useState({
    status: "New",
    assignedTo: "",
  });

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");

    if (!token) {
      router.push("/AdminLogin");
      return;
    }

    if (role !== "SuperAdmin") {
      router.push("/dashboard");
      return;
    }

    // Fetch data
    fetchData();
  }, [router]);

  // Fetch leads when filters or pagination changes
  useEffect(() => {
    if (admins.length > 0) {
      fetchLeads();
    }
  }, [currentPage, filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch admins for assign dropdown
      const adminsResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins`
      );

      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        setAdmins(adminsData);
      }

      // Fetch leads
      await fetchLeads();

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
      if (filters.coursename) queryParams.append('coursename', filters.coursename);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.search) queryParams.append('search', filters.search);

      // Add pagination
      //queryParams.append('page', currentPage);
      //queryParams.append('limit', leadsPerPage);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/filter?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data);
      setTotalLeads(data.length);

      // Extract unique course names and locations for filters
      const courses = [...new Set(data.map(lead => lead.coursename).filter(Boolean))];
      const locations = [...new Set(data.map(lead => lead.location).filter(Boolean))];

      setCourseOptions(courses);
      setLocationOptions(locations);

      // Reset selected leads when fetching new data
      setSelectedLeads([]);
      setSelectAll(false);

    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      assignedTo: "",
      coursename: "",
      location: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      contact: "",
      countryCode: "",
      coursename: "",
      location: "",
      status: "New",
      notes: "",
      assignedTo: "",
    });
    setModalType("create");
    setShowModal(true);
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name || "",
      email: lead.email || "",
      contact: lead.contact || "",
      countryCode: lead.countryCode || "",
      coursename: lead.coursename || "",
      location: lead.location || "",
      status: lead.status || "New",
      notes: lead.notes || "",
      assignedTo: lead.assignedTo?._id || "",
    });
    setModalType("edit");
    setShowModal(true);
  };

  const openAssignModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      ...formData,
      assignedTo: lead.assignedTo?._id || "",
    });
    setModalType("assign");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      if (modalType === "create") {
        await createLead();
      } else if (modalType === "edit") {
        await updateLead();
      } else if (modalType === "assign") {
        await assignLead();
      }
    } catch (err) {
      console.error("Error in form submission:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const createLead = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create lead");
      }

      // Success
      await fetchLeads(); // Refresh the list
      closeModal();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateLead = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${selectedLead._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update lead");
      }

      // Success
      await fetchLeads(); // Refresh the list
      closeModal();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const assignLead = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${selectedLead._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignedTo: formData.assignedTo || null,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to assign lead");
      }

      // Success
      await fetchLeads(); // Refresh the list
      closeModal();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete lead");
      }

      // Success
      await fetchLeads(); // Refresh the list
    } catch (err) {
      console.error("Error deleting lead:", err);
      setError(err.message);
    }
  };

  // Handle selection of leads
  const handleSelectLead = (id) => {
    setSelectedLeads((prev) => {
      if (prev.includes(id)) {
        return prev.filter((leadId) => leadId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all leads
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead._id));
    }
    setSelectAll(!selectAll);
  };

  // Open bulk action modal
  const openBulkActionModal = (actionType) => {
    if (selectedLeads.length === 0) {
      alert("Please select at least one lead");
      return;
    }

    setBulkActionType(actionType);
    setBulkFormData({
      status: "New",
      assignedTo: "",
    });
    setBulkActionModalOpen(true);
  };

  // Handle bulk action submission
  const handleBulkAction = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      if (bulkActionType === "delete") {
        await bulkDeleteLeads();
      } else {
        await bulkUpdateLeads();
      }
    } catch (err) {
      console.error("Error in bulk action:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
      setBulkActionModalOpen(false);
    }
  };

  // Bulk update leads
  const bulkUpdateLeads = async () => {
    try {
      const updateData = {};

      if (bulkActionType === "status") {
        updateData.status = bulkFormData.status;
      } else if (bulkActionType === "assign") {
        updateData.assignedTo = bulkFormData.assignedTo || null;
      }

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/bulk-update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadIds: selectedLeads,
            updateData,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update leads");
      }

      // Success
      await fetchLeads(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Bulk delete leads
  const bulkDeleteLeads = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/bulk-delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadIds: selectedLeads,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete leads");
      }

      // Success
      await fetchLeads(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Download CSV
  const downloadCSV = () => {
    if (leads.length === 0) {
      alert("No data available for download");
      return;
    }

    const headers = [
      "Name",
      "Mobile Number",
      "Course Name",
      "Email ID",
      "Location",
      "Status",
      "Assigned To",
      "Date & Time",
    ];
    const csvRows = leads.map((lead) => [
      lead.name,
      lead.contact,
      lead.coursename,
      lead.email,
      lead.location,
      lead.status,
      lead.assignedTo?.username || "Unassigned",
      new Date(lead.createdAt).toLocaleString("en-US", { timeZone: "UTC" }),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle pagination
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const displayedLeads = leads.slice(startIndex, startIndex + leadsPerPage);

  if (loading) {
    return (
      <SuperAdminLayout activePage="leads">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading leads...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout activePage="leads">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Lead Management</h1>
        <p className={styles.pageDescription}>
          Manage, filter, and assign leads to admin users.
        </p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Action Buttons */}
      <div className={styles.formActions} style={{ marginBottom: "1rem" }}>
        <button
          className={`${styles.button} ${styles.primaryButton}`}
          onClick={openCreateModal}
        >
          <FaUsers style={{ marginRight: "0.5rem" }} /> Add New Lead
        </button>
        <button
          className={`${styles.button} ${styles.secondaryButton}`}
          onClick={downloadCSV}
        >
          <FaDownload style={{ marginRight: "0.5rem" }} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className={styles.chartContainer} style={{ marginBottom: "1rem" }}>
        <h3 className={styles.chartTitle}>
          <FaFilter style={{ marginRight: "0.5rem" }} /> Filter Leads
        </h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className={styles.formSelect}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Assigned To</label>
            <select
              name="assignedTo"
              value={filters.assignedTo}
              onChange={handleFilterChange}
              className={styles.formSelect}
            >
              <option value="">All</option>
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Any Admin</option>
              {admins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.username}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Course</label>
            <select
              name="coursename"
              value={filters.coursename}
              onChange={handleFilterChange}
              className={styles.formSelect}
            >
              <option value="">All Courses</option>
              {courseOptions.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Location</label>
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className={styles.formSelect}
            >
              <option value="">All Locations</option>
              {locationOptions.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaCalendarAlt style={{ marginRight: "0.5rem" }} /> Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaCalendarAlt style={{ marginRight: "0.5rem" }} /> End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaSearch style={{ marginRight: "0.5rem" }} /> Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name, Email, or Phone"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formActions} style={{ alignSelf: "flex-end" }}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={resetFilters}
            >
              Reset
            </button>
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className={styles.bulkActionBar}>
          <span>
            {selectedLeads.length} {selectedLeads.length === 1 ? "lead" : "leads"} selected
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => openBulkActionModal("status")}
              className={`${styles.button} ${styles.secondaryButton}`}
              style={{ padding: "0.5rem 0.75rem" }}
            >
              Change Status
            </button>
            <button
              onClick={() => openBulkActionModal("assign")}
              className={`${styles.button} ${styles.secondaryButton}`}
              style={{ padding: "0.5rem 0.75rem" }}
            >
              Assign
            </button>
            <button
              onClick={() => openBulkActionModal("delete")}
              className={`${styles.button} ${styles.dangerButton}`}
              style={{ padding: "0.5rem 0.75rem" }}
            >
              <FaTrash style={{ marginRight: "0.5rem" }} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxColumn}>
                  <div
                    className={styles.checkboxWrapper}
                    onClick={handleSelectAll}
                  >
                    {selectAll ? (
                      <FaCheckSquare className={styles.checkIcon} />
                    ) : (
                      <FaSquare className={styles.checkIcon} />
                    )}
                  </div>
                </th>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Course</th>
                <th>Location</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedLeads.length > 0 ? (
                displayedLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td
                      data-label="Select"
                      className={styles.checkboxColumn}
                    >
                      <div
                        className={styles.checkboxWrapper}
                        onClick={() => handleSelectLead(lead._id)}
                      >
                        {selectedLeads.includes(lead._id) ? (
                          <FaCheckSquare className={styles.checkIcon} />
                        ) : (
                          <FaSquare className={styles.checkIcon} />
                        )}
                      </div>
                    </td>
                    <td data-label="Name">{lead.name}</td>
                    <td data-label="Contact">{lead.contact}</td>
                    <td data-label="Email">{lead.email}</td>
                    <td data-label="Course">{lead.coursename}</td>
                    <td data-label="Location">{lead.location}</td>
                    <td data-label="Status">
                      <span className={`${styles.badge} ${
                        lead.status === "New" ? styles.badgeBlue :
                        lead.status === "Contacted" ? styles.badgeYellow :
                        lead.status === "Converted" ? styles.badgeGreen :
                        styles.badgeRed
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td data-label="Assigned To">
                      {lead.assignedTo ? (
                        <span className={`${styles.roleBadge} ${
                          lead.assignedTo.role === "SuperAdmin" ? styles.superAdminBadge :
                          lead.assignedTo.role === "Admin" ? styles.adminBadge :
                          lead.assignedTo.role === "ViewMode" ? styles.viewModeBadge :
                          styles.editModeBadge
                        }`}>
                          {lead.assignedTo.username}
                        </span>
                      ) : (
                        <span className={styles.badgeGray}>Unassigned</span>
                      )}
                    </td>
                    <td data-label="Created">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td data-label="Actions" style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => openEditModal(lead)}
                        className={`${styles.button} ${styles.secondaryButton}`}
                        style={{ padding: "0.25rem 0.5rem" }}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => openAssignModal(lead)}
                        className={`${styles.button} ${styles.secondaryButton}`}
                        style={{ padding: "0.25rem 0.5rem" }}
                        title="Assign"
                      >
                        <FaUserEdit />
                      </button>
                      <button
                        onClick={() => deleteLead(lead._id)}
                        className={`${styles.button} ${styles.dangerButton}`}
                        style={{ padding: "0.25rem 0.5rem" }}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className={styles.errorMessage}>
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          <span className={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit/Assign Modal */}
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalType === "create" ? "Add New Lead" :
                 modalType === "edit" ? "Edit Lead" :
                 "Assign Lead"}
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
                {modalType !== "assign" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="name">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="email">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="contact">
                        Contact Number
                      </label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="text"
                          id="countryCode"
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleInputChange}
                          className={styles.formInput}
                          placeholder="+91"
                          style={{ width: "80px" }}
                        />
                        <input
                          type="text"
                          id="contact"
                          name="contact"
                          value={formData.contact}
                          onChange={handleInputChange}
                          className={styles.formInput}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="coursename">
                        Course
                      </label>
                      <input
                        type="text"
                        id="coursename"
                        name="coursename"
                        value={formData.coursename}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="location">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="status">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={styles.formSelect}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Converted">Converted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="notes">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className={styles.formTextarea}
                        rows="3"
                      ></textarea>
                    </div>
                  </>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="assignedTo">
                    Assigned To
                  </label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="">Unassigned</option>
                    {admins.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.username} ({admin.role})
                      </option>
                    ))}
                  </select>
                </div>
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
                  className={`${styles.button} ${styles.primaryButton}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className={styles.spinner} style={{ marginRight: "0.5rem" }} />
                      {modalType === "create" ? "Creating..." :
                       modalType === "edit" ? "Updating..." :
                       "Assigning..."}
                    </>
                  ) : (
                    <>
                      {modalType === "create" ? "Create Lead" :
                       modalType === "edit" ? "Update Lead" :
                       "Assign Lead"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {bulkActionModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {bulkActionType === "status" ? "Bulk Update Status" :
                 bulkActionType === "assign" ? "Bulk Assign Leads" :
                 "Bulk Delete Leads"}
              </h3>
              <button
                className={styles.modalCloseButton}
                onClick={() => setBulkActionModalOpen(false)}
                disabled={submitting}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleBulkAction}>
              <div className={styles.modalBody}>
                {bulkActionType === "delete" ? (
                  <p>Are you sure you want to delete {selectedLeads.length} leads? This action cannot be undone.</p>
                ) : bulkActionType === "status" ? (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="bulk-status">
                      New Status
                    </label>
                    <select
                      id="bulk-status"
                      value={bulkFormData.status}
                      onChange={(e) => setBulkFormData({...bulkFormData, status: e.target.value})}
                      className={styles.formSelect}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                ) : (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="bulk-assignedTo">
                      Assign To
                    </label>
                    <select
                      id="bulk-assignedTo"
                      value={bulkFormData.assignedTo}
                      onChange={(e) => setBulkFormData({...bulkFormData, assignedTo: e.target.value})}
                      className={styles.formSelect}
                    >
                      <option value="">Unassigned</option>
                      {admins.map((admin) => (
                        <option key={admin._id} value={admin._id}>
                          {admin.username} ({admin.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setBulkActionModalOpen(false)}
                  className={`${styles.button} ${styles.secondaryButton}`}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.button} ${bulkActionType === "delete" ? styles.dangerButton : styles.primaryButton}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className={styles.spinner} style={{ marginRight: "0.5rem" }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      {bulkActionType === "status" ? "Update Status" :
                       bulkActionType === "assign" ? "Assign Leads" :
                       "Delete Leads"}
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

export default LeadManagementPage;
