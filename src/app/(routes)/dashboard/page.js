"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaTrash,
  FaSpinner,
  FaDownload,
  FaSignOutAlt,
  FaCheckSquare,
  FaSquare,
  FaUserCog,
  FaSync,
  FaEdit,
  FaSave,
  FaTimes,
  FaWindowClose,
  FaEye,
} from "react-icons/fa";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Utility function for authenticated API requests
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

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [editingLead, setEditingLead] = useState(null);
  const [editFormData, setEditFormData] = useState({
    contactedScore: "",
    contactedComment: "",
    status: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  // Settings state
  const [restrictLeadEditing, setRestrictLeadEditing] = useState(false);
  // States for modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLeadForModal, setSelectedLeadForModal] = useState(null);

  const router = useRouter();
  const leadsPerPage = 30;

  // Calculate pagination values
  const totalPages = useMemo(
    () => Math.ceil(leads.length / leadsPerPage),
    [leads.length]
  );

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;

  const currentLeads = useMemo(
    () => leads.slice(indexOfFirstLead, indexOfLastLead),
    [leads, indexOfFirstLead, indexOfLastLead]
  );

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken");
      const role = localStorage.getItem("adminRole");

      if (!token) {
        router.push("/AdminLogin");
        return false;
      }

      setUserRole(role);
      return true;
    };

    if (checkAuth()) {
      setIsAuthenticated(true);
      fetchLeads();
      fetchSettings();
    }
  }, [router]);

  // Fetch application settings
  const fetchSettings = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/restrictLeadEditing`
      );

      if (response.ok) {
        const data = await response.json();
        setRestrictLeadEditing(data.value);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Default to false if setting can't be fetched
      setRestrictLeadEditing(false);
    }
  };

  // Check "select all" status when leads or selection changes
  useEffect(() => {
    if (currentLeads.length > 0) {
      const allSelected = currentLeads.every((lead) =>
        selectedLeads.includes(lead._id)
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [currentLeads, selectedLeads]);

  // Fetch leads data
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors before fetching

      // Use the populated endpoint to get leads with assignedTo data
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads?populate=assignedTo`
      );

      if (!response.ok) {
        // Try to get error message from backend if available
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (jsonError) {
          // Ignore if response body is not JSON
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        console.error("API did not return an array:", data);
        setLeads([]); // Set to empty array if response is not as expected
        throw new Error("Received invalid data format from API.");
      }
    } catch (err) {
      console.error("Error fetching leads:", err); // Log the full error
      setError(err.message);
      setLeads([]); // Ensure leads is an empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Open modal for editing a lead
  const openEditModal = (lead) => {
    setSelectedLeadForModal(lead);
    setEditFormData({
      contactedScore: lead.contactedScore || "",
      contactedComment: lead.contactedComment || "",
      status: lead.status || "New",
    });
    setShowModal(true);
  };

  // Open view modal for a lead
  const openViewModal = (lead) => {
    setSelectedLeadForModal(lead);
    setShowViewModal(true);
  };

  // Close the edit modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedLeadForModal(null);
  };

  // Close the view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedLeadForModal(null);
    setEditFormData({
      contactedScore: "",
      contactedComment: "",
      status: "",
    });
  };

  // Handle form data change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Save lead updates from modal
  const saveLeadFromModal = async () => {
    if (!selectedLeadForModal) return;

    try {
      setUpdateLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${selectedLeadForModal._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 && errorData.restricted) {
          throw new Error("Access restricted: You can only edit leads assigned to you when restriction mode is enabled.");
        }
        throw new Error("Failed to update lead");
      }

      // Update the lead in the local state
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === selectedLeadForModal._id ? { ...lead, ...editFormData } : lead
        )
      );

      // Close modal
      closeModal();
    } catch (error) {
      console.error("Error updating lead:", error);
      alert(`Error updating lead: ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Start editing a lead (legacy method - keeping for reference)
  const startEditLead = (lead) => {
    // ViewMode users can edit Contacted and Status fields
    setEditingLead(lead._id);
    setEditFormData({
      contactedScore: lead.contactedScore || "",
      contactedComment: lead.contactedComment || "",
      status: lead.status || "New",
    });
  };

  // Cancel editing (legacy method - keeping for reference)
  const cancelEdit = () => {
    setEditingLead(null);
    setEditFormData({
      contactedScore: "",
      contactedComment: "",
      status: "",
    });
  };

  // Save lead updates (legacy method - keeping for reference)
  const saveLead = async (leadId) => {
    try {
      setUpdateLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${leadId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update lead");
      }

      // Update the lead in the local state
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === leadId ? { ...lead, ...editFormData } : lead
        )
      );

      // Cancel edit mode
      cancelEdit();
    } catch (error) {
      console.error("Error updating lead:", error);
      alert(`Error updating lead: ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete a single lead
  const deleteLead = async (id) => {
    // Check if user has permission to delete leads (SuperAdmin, Admin, or EditMode)
    if (userRole !== "SuperAdmin" && userRole !== "Admin" && userRole !== "EditMode") {
      alert("You don't have permission to delete leads.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      setDeleteLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setLeads((prevLeads) => prevLeads.filter((lead) => lead._id !== id));
      // If the lead was selected, remove it from selected leads
      if (selectedLeads.includes(id)) {
        setSelectedLeads((prev) => prev.filter((leadId) => leadId !== id));
      }
    } catch (error) {
      console.error("Error deleting lead:", error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Delete multiple selected leads
  const deleteSelectedLeads = async () => {
    // Check if user has permission to delete leads (SuperAdmin, Admin, or EditMode)
    if (userRole !== "SuperAdmin" && userRole !== "Admin" && userRole !== "EditMode") {
      alert("You don't have permission to delete leads.");
      return;
    }

    if (selectedLeads.length === 0) {
      alert("Please select at least one lead to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedLeads.length} selected leads?`
      )
    )
      return;

    setDeleteLoading(true);
    let successCount = 0;
    let errorCount = 0;

    // Using bulk delete endpoint if available
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/bulk-delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ leadIds: selectedLeads }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        successCount = result.deletedCount;

        setLeads((prevLeads) =>
          prevLeads.filter((lead) => !selectedLeads.includes(lead._id))
        );
        setSelectedLeads([]);
      } else {
        throw new Error("Bulk delete failed");
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);

      // Fallback: Delete one by one if bulk delete fails
      for (const id of selectedLeads) {
        try {
          const response = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (e) {
          errorCount++;
          console.error(`Error deleting lead ${id}:`, e);
        }
      }

      // Update the leads list to remove successfully deleted leads
      if (successCount > 0) {
        setLeads((prevLeads) =>
          prevLeads.filter((lead) => !selectedLeads.includes(lead._id))
        );
        setSelectedLeads([]);
      }
    } finally {
      setDeleteLoading(false);
      if (successCount > 0 || errorCount > 0) {
        alert(
          `Operation completed: ${successCount} leads deleted successfully, ${errorCount} errors.`
        );
      }
    }
  };

  // Download Excel file with all leads data and formatting
  const downloadCSV = () => {
    if (leads.length === 0) {
      alert("No data to download");
      return;
    }

    try {
      // First, prepare the data in a simple 2D array format
      // with headers as the first row
      const headers = [
        "Sr. No.",
        "Name",
        "Mobile Number",
        "Course Name",
        "Email ID",
        "Date & Time",
        "Location",
        "Assigned To",
        "Contacted Score",
        "Contacted Comment",
        "Status"
      ];

      // Add all lead data
      const data = [headers];

      leads.forEach((lead, index) => {
        const formattedDate = new Date(lead.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata' // Added IST timezone
        });

        data.push([
          index + 1,
          lead.name || "",
          lead.contact || "",
          lead.coursename || "",
          lead.email || "",
          formattedDate,
          lead.location || "",
          lead.assignedTo ? lead.assignedTo.username : "Not Assigned",
          lead.contactedScore || "",
          lead.contactedComment || "",
          lead.status || "New",
        ]);
      });

      // Create a workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Set column widths
      ws['!cols'] = [
        { wch: 8 },  // Sr. No.
        { wch: 25 }, // Name
        { wch: 15 }, // Mobile Number
        { wch: 25 }, // Course Name
        { wch: 30 }, // Email ID
        { wch: 22 }, // Date & Time
        { wch: 15 }, // Location
        { wch: 15 }, // Assigned To
        { wch: 15 }, // Contacted Score
        { wch: 30 }, // Contacted Comment
        { wch: 12 }  // Status
      ];

      // Style header row
      for (let i = 0; i < headers.length; i++) {
        const cellAddress = XLSX.utils.encode_cell({r: 0, c: i});
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { patternType: 'solid', fgColor: { rgb: "4A5568" } }
        };
      }

      // Style data rows based on status
      for (let i = 1; i < data.length; i++) {
        const status = data[i][10]; // Status column is index 10
        let fillColor;

        // Set color based on status
        if (status === "Contacted") {
          fillColor = "BEE3F8"; // Light blue
        } else if (status === "Converted") {
          fillColor = "C6F6D5"; // Light green
        } else if (status === "Rejected") {
          fillColor = "FED7D7"; // Light red
        } else {
          fillColor = "E2E8F0"; // Light gray (for New status)
        }

        // Apply the style to each cell in the row
        for (let j = 0; j < data[i].length; j++) {
          const cellAddress = XLSX.utils.encode_cell({r: i, c: j});

          if (!ws[cellAddress]) {
            ws[cellAddress] = { v: data[i][j] };
          }

          // Set fill color style with pattern type
          ws[cellAddress].s = {
            fill: {
              patternType: 'solid',
              fgColor: { rgb: fillColor }
            }
          };
        }
      }

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Leads");

      // Generate binary Excel and download
      const excelBinary = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'binary',
        cellStyles: true
      });

      // Convert binary to Blob
      const buffer = new ArrayBuffer(excelBinary.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < excelBinary.length; i++) {
        view[i] = excelBinary.charCodeAt(i) & 0xFF;
      }

      // Create blob and download
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`);

      console.log("Excel file exported with row colors based on status");
    } catch (error) {
      console.error("Error exporting Excel file:", error);
      alert(`Error creating Excel file: ${error.message}. Falling back to CSV export.`);
      fallbackCSVExport();
    }
  };

  // Fallback CSV export in case the Excel export fails
  const fallbackCSVExport = () => {
    // Create CSV header
    const headers = [
      "Sr. No.",
      "Name",
      "Mobile Number",
      "Course Name",
      "Email ID",
      "Date & Time",
      "Location",
      "Assigned To",
      "Contacted Score",
      "Contacted Comment",
      "Status",
    ];

    // Helper function to properly escape CSV fields
    const escapeCsvField = (field) => {
      if (field === null || field === undefined) return '""';

      // Convert to string
      const str = String(field);

      // Escape quotes by doubling them and always wrap in quotes
      return `"${str.replace(/"/g, '""')}"`;
    };

    // Format each lead data as CSV row with proper escaping
    const csvRows = leads.map((lead, index) => {
      const formattedDate = new Date(lead.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      return [
        escapeCsvField(index + 1),
        escapeCsvField(lead.name || ""),
        escapeCsvField(lead.contact || ""),
        escapeCsvField(lead.coursename || ""),
        escapeCsvField(lead.email || ""),
        escapeCsvField(formattedDate),
        escapeCsvField(lead.location || ""),
        escapeCsvField(lead.assignedTo ? lead.assignedTo.username : "Not Assigned"),
        escapeCsvField(lead.contactedScore || ""),
        escapeCsvField(lead.contactedComment || ""),
        escapeCsvField(lead.status || "New"),
      ];
    });

    // Create a BOM (Byte Order Mark) for Excel to recognize UTF-8
    const BOM = "\uFEFF";

    // Convert to CSV string with proper formatting
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(
        BOM +
        headers.map(header => escapeCsvField(header)).join(",") +
        "\n" +
        csvRows.map((row) => row.join(",")).join("\n")
      );

    // Create download link
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute(
      "download",
      `leads_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Basic CSV exported. For better formatting, please try again later.");
  };

  // Select/deselect a lead
  const handleSelectLead = (id) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  // Select/deselect all leads
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(currentLeads.map((lead) => lead._id));
    }
    setSelectAll(!selectAll);
  };

  // Pagination: go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Pagination: go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Navigate to super admin panel
  const goToSuperAdmin = () => {
    router.push("/superadmin");
  };

  // User logout
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminId");
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/AdminLogin");
  };

  // Refresh leads data
  const handleRefresh = () => {
    fetchLeads();
  };

  // If not authenticated, show loading screen
  if (!isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Contact Leads Dashboard</h2>
        <div className={styles.headerButtons}>
          <button onClick={handleRefresh} className={styles.actionButton}>
            <FaSync /> Refresh
          </button>
          {(userRole === "SuperAdmin" || userRole === "Admin") && (
            <button onClick={goToSuperAdmin} className={styles.actionButton}>
              <FaUserCog /> Admin Panel
            </button>
          )}
          <button onClick={downloadCSV} className={styles.actionButton}>
            <FaDownload /> Export CSV
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {selectedLeads.length > 0 && (
        <div className={styles.bulkActionBar}>
          <span>
            {selectedLeads.length}{" "}
            {selectedLeads.length === 1 ? "lead" : "leads"} selected
          </span>
          {(userRole === "SuperAdmin" || userRole === "Admin" || userRole === "EditMode") && (
            <button
              onClick={deleteSelectedLeads}
              className={styles.bulkDeleteButton}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <FaSpinner className={styles.spinner} />
              ) : (
                <FaTrash />
              )}
              Delete Selected
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading leads...</p>
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>Error: {error}</div>
      ) : (
        <>
          <div className={styles.tableCard}>
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {(userRole === "SuperAdmin" || userRole === "Admin" || userRole === "EditMode") && (
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
                    )}
                    <th className={styles.viewColumn}>View</th>
                    <th>Sr. No.</th>
                    <th>Name</th>
                    <th>Mobile Number</th>
                    <th>Course Name</th>
                    <th>Email ID</th>
                    <th>Date & Time</th>
                    <th>Location</th>
                    <th>Assigned To</th>
                    <th>Contacted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeads.length > 0 ? (
                    currentLeads.map((lead, index) => (
                      <tr
                        key={lead._id || index}
                        style={lead.assignedTo?.color ? {
                          backgroundColor: `${lead.assignedTo.color}30`, // Add transparency (30% opacity)
                          transition: 'background-color 0.3s ease'
                        } : {}}
                      >
                        {(userRole === "SuperAdmin" || userRole === "Admin" || userRole === "EditMode") && (
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
                        )}
                        <td data-label="View" className={styles.viewColumn}>
                          <button
                            onClick={() => openViewModal(lead)}
                            className={styles.viewButton}
                            title="View Lead Details"
                          >
                            <FaEye />
                          </button>
                        </td>
                        <td data-label="Sr. No.">
                          {indexOfFirstLead + index + 1}
                        </td>
                        <td data-label="Name">{lead.name}</td>
                        <td data-label="Mobile Number">{lead.contact}</td>
                        <td data-label="Course Name">{lead.coursename}</td>
                        <td data-label="Email ID">{lead.email}</td>
                        <td data-label="Date & Time">
                          {new Date(lead.createdAt).toLocaleString(
                            "en-US",
                            {
                              timeZone: "Asia/Kolkata", // Changed from UTC to IST timezone
                            }
                          )}
                        </td>
                        <td data-label="Location">{lead.location}</td>
                        <td data-label="Assigned To">
                          {lead.assignedTo ? lead.assignedTo.username : "Not Assigned"}
                        </td>
                        <td data-label="Contacted">
                          <div>
                            {lead.contactedScore ? (
                              <span className={styles.contactedScore}>
                                Score: {lead.contactedScore}
                                {lead.contactedComment && (
                                  <span className={styles.contactedComment}>
                                    <br />Comment: {lead.contactedComment.substring(0, 20)}
                                    {lead.contactedComment.length > 20 ? "..." : ""}
                                  </span>
                                )}
                              </span>
                            ) : (
                              "Not set"
                            )}
                          </div>
                        </td>
                        <td data-label="Status">
                          <span
                            className={`${styles.statusBadge} ${
                              lead.status === "Converted"
                                ? styles.convertedStatus
                                : lead.status === "Contacted"
                                ? styles.contactedStatus
                                : lead.status === "Rejected"
                                ? styles.rejectedStatus
                                : styles.newStatus
                            }`}
                          >
                            {lead.status || "New"}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <div className={styles.actionButtons}>
                            {/* Show edit button based on restrictions */}
                            {(!restrictLeadEditing || // No restriction
                              userRole === "SuperAdmin" || // SuperAdmin bypass
                              userRole === "Admin" || // Admin bypass
                              (lead.assignedTo && lead.assignedTo._id === localStorage.getItem("adminId")) // Assigned user
                            ) ? (
                              <button
                                onClick={() => openEditModal(lead)}
                                className={styles.editButton}
                              >
                                <FaEdit />
                              </button>
                            ) : (
                              <button
                                className={styles.editButton}
                                style={{ opacity: 0.3, cursor: 'not-allowed' }}
                                title="Editing restricted to assigned user or admin"
                                disabled
                              >
                                <FaEdit />
                              </button>
                            )}
                            {(userRole === "SuperAdmin" ||
                              userRole === "Admin" ||
                              userRole === "EditMode") && (
                              <button
                                onClick={() => deleteLead(lead._id)}
                                className={styles.deleteButton}
                                disabled={deleteLoading}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={userRole === "SuperAdmin" || userRole === "Admin" || userRole === "EditMode" ? 13 : 12} className={styles.errorMessage}>
                        No leads found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <span className={styles.pageIndicator}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages || leads.length === 0}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal for editing contacted and status */}
      {showModal && selectedLeadForModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Edit Lead: {selectedLeadForModal.name}
              </h3>
              <button
                onClick={closeModal}
                className={styles.modalCloseButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>How many times contacted:</label>
                <select
                  name="contactedScore"
                  value={editFormData.contactedScore}
                  onChange={handleEditFormChange}
                  className={styles.formSelect}
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contacted Comment</label>
                <textarea
                  name="contactedComment"
                  value={editFormData.contactedComment}
                  onChange={handleEditFormChange}
                  placeholder="Add detailed comment..."
                  className={styles.formTextarea}
                  rows="4"
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  className={styles.formSelect}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={closeModal}
                className={`${styles.button} ${styles.secondaryButton}`}
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                onClick={saveLeadFromModal}
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <FaSpinner className={styles.spinner} style={{ marginRight: "0.5rem" }} />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedLeadForModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Lead Details: {selectedLeadForModal.name}
              </h3>
              <button
                onClick={closeViewModal}
                className={styles.modalCloseButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.leadDetailsGrid}>
                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Name:</h4>
                  <p className={styles.leadDetailValue}>{selectedLeadForModal.name}</p>
                </div>

                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Mobile Number:</h4>
                  <p className={styles.leadDetailValue}>{selectedLeadForModal.contact}</p>
                </div>

                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Email:</h4>
                  <p className={styles.leadDetailValue}>{selectedLeadForModal.email}</p>
                </div>

                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Course Name:</h4>
                  <p className={styles.leadDetailValue}>{selectedLeadForModal.coursename}</p>
                </div>

                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Location:</h4>
                  <p className={styles.leadDetailValue}>{selectedLeadForModal.location}</p>
                </div>

                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Date & Time:</h4>
                  <p className={styles.leadDetailValue}>
                    {new Date(selectedLeadForModal.createdAt).toLocaleString(
                      "en-US",
                      {
                        timeZone: "Asia/Kolkata", // Using IST timezone
                      }
                    )}
                  </p>
                </div>

                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Assigned To:</h4>
                  <p className={styles.leadDetailValue}>
                    {selectedLeadForModal.assignedTo ? selectedLeadForModal.assignedTo.username : "Not Assigned"}
                  </p>
                </div>

                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Contacted Score:</h4>
                  <p className={styles.leadDetailValue}>
                    {selectedLeadForModal.contactedScore ? selectedLeadForModal.contactedScore : "Not set"}
                  </p>
                </div>

                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Contacted Comment:</h4>
                  <p className={styles.leadDetailValue}>
                    {selectedLeadForModal.contactedComment ? selectedLeadForModal.contactedComment : "No comment"}
                  </p>
                </div>

                <div className={styles.leadDetailItem}>
                  <h4 className={styles.leadDetailLabel}>Status:</h4>
                  <span
                    className={`${styles.statusBadge} ${
                      selectedLeadForModal.status === "Converted"
                        ? styles.convertedStatus
                        : selectedLeadForModal.status === "Contacted"
                        ? styles.contactedStatus
                        : selectedLeadForModal.status === "Rejected"
                        ? styles.rejectedStatus
                        : styles.newStatus
                    }`}
                  >
                    {selectedLeadForModal.status || "New"}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={closeViewModal}
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
