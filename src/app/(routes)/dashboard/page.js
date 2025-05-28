"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
// Removed styles import
// import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaTrash,
  FaSpinner,
  FaDownload,
  FaSignOutAlt,
  FaCheckSquare, // For checked checkbox
  FaSquare, // For unchecked checkbox
  FaUserCog, // For Admin Panel button icon
  FaSync, // For Refresh button icon
  FaEdit, // For Edit action icon
  FaSave, // Not used in this version, but keep if needed
  FaTimes, // For error message icon / close modal
  FaWindowClose, // Not used, FaTimes is sufficient for close
  FaEye, // For View action icon
  FaChevronLeft, // For pagination
  FaChevronRight, // For pagination
  FaExclamationTriangle, // For no data message
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Import the centralized fetchWithAuth utility
import { fetchWithAuth } from "@/utils/auth";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // Loading state for initial fetch/refresh
  const [error, setError] = useState(null); // Page-level error
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Basic auth check state
  const [selectedLeads, setSelectedLeads] = useState([]); // Leads selected for bulk actions
  const [selectAll, setSelectAll] = useState(false); // State for 'select all' checkbox
  const [deleteLoading, setDeleteLoading] = useState(false); // Loading state for delete operations
  const [userRole, setUserRole] = useState(""); // Current user's role
  // No longer using editingLead state for inline editing, using modal
  // const [editingLead, setEditingLead] = useState(null);
  const [editFormData, setEditFormData] = useState({
    // Form data for the edit modal
    contactedScore: "",
    contactedComment: "",
    status: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false); // Loading state for updates (edit modal)
  // Settings state for restriction
  const [restrictLeadEditing, setRestrictLeadEditing] = useState(false);
  // States for modals
  const [showModal, setShowModal] = useState(false); // State for Edit Lead modal
  const [showViewModal, setShowViewModal] = useState(false); // State for View Lead Details modal
  const [selectedLeadForModal, setSelectedLeadForModal] = useState(null); // Lead data for the currently open modal

  const router = useRouter();
  const leadsPerPage = 30; // Number of leads to display per page (client-side pagination)

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
      // Check if localStorage is available (for SSR/SSG safety)
      const token =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;
      const role =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("adminRole")
          : null;

      if (!token) {
        router.push("/AdminLogin");
        return false;
      }

      setUserRole(role || ""); // Set user role, default to empty string if null/undefined
      return true;
    };

    if (checkAuth()) {
      setIsAuthenticated(true);
      // Fetch initial data after authentication is confirmed
      fetchLeads();
      fetchSettings(); // Fetch settings immediately after authentication
    } else {
      // If auth fails, setIsAuthenticated remains false and the loading screen is shown
      // The checkAuth function handles the redirect.
    }
  }, [router]); // Depend on router for initial check

  // Fetch application settings (specifically restrictLeadEditing)
  const fetchSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL is not defined for settings");
        // setError("API URL is not configured for settings."); // Less critical, maybe don't show page error
        setRestrictLeadEditing(false); // Default to false if API URL missing
        return;
      }
      // Assuming /api/settings endpoint can filter by key or return a single setting
      const response = await fetchWithAuth(
        `${apiUrl}/api/settings/restrictLeadEditing` // Assuming this endpoint exists
      );

      if (response.ok) {
        const data = await response.json();
        // Assuming the response is an object like { key: 'restrictLeadEditing', value: true/false, ... }
        // Or just the value directly depending on the endpoint design
        setRestrictLeadEditing(Boolean(data?.value)); // Ensure value is treated as boolean
      } else {
        const errorText = await response.text();
        console.error(
          `Error fetching setting "restrictLeadEditing":`,
          response.status,
          errorText
        );
        // Default to false if setting can't be fetched or response is not ok
        setRestrictLeadEditing(false);
        // Optionally set a less critical error message
        // setError("Failed to load lead editing restriction setting.");
      }
    } catch (error) {
      console.error("Error fetching settings:", error); // Log the full error
      // Default to false if fetch fails
      setRestrictLeadEditing(false);
      // Optionally set a less critical error message
      // setError(`Error fetching lead editing restriction setting: ${error.message}`);
    }
  };

  // Check "select all" status when current leads or selected leads change
  useEffect(() => {
    // Only update selectAll if there are leads on the current page
    if (currentLeads.length > 0) {
      const allCurrentLeadsSelected = currentLeads.every((lead) =>
        selectedLeads.includes(lead._id)
      );
      setSelectAll(allCurrentLeadsSelected);
    } else {
      // If no leads on the page, selectAll should be false
      setSelectAll(false);
    }
  }, [currentLeads, selectedLeads]);

  // Fetch leads data
  const fetchLeads = async () => {
    try {
      setLoading(true); // Set loading true before fetching
      setError(null); // Clear previous page-level errors before fetching

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL is not defined for leads");
        setError("API URL is not configured.");
        setLoading(false); // Ensure loading is off
        return;
      }

      // Use the populated endpoint to get leads with assignedTo data
      // Added optional filtering if API supports it based on restrictLeadEditing and userRole
      const currentAdminId =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("adminId")
          : null;
      const queryParams = new URLSearchParams();

      // If restriction is enabled and user is not SuperAdmin/Admin, filter by assignedTo
      if (
        restrictLeadEditing &&
        userRole !== "SuperAdmin" &&
        userRole !== "Admin" &&
        currentAdminId
      ) {
        queryParams.append("assignedTo", currentAdminId);
      }
      // Note: Pagination is client-side here, but if implementing server-side,
      // add page and limit query params here.

      const response = await fetchWithAuth(
        `${apiUrl}/api/leads?populate=assignedTo&${queryParams.toString()}` // Append query params
      );

      if (!response.ok) {
        // Try to get error message from backend if available
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
          // If backend sends a specific message for restriction
          if (response.status === 403 && errorData.restricted) {
            errorMsg =
              "Access restricted: You can only view leads assigned to you.";
          }
        } catch (jsonError) {
          // Ignore if response body is not JSON
          console.error("Failed to parse error response body:", jsonError);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setLeads(data);
        // After fetching new leads, reset pagination and selection
        setCurrentPage(1);
        setSelectedLeads([]);
        setSelectAll(false);
      } else {
        console.error("API did not return an array for leads:", data);
        setLeads([]); // Set to empty array if response is not as expected
        // Do not throw a critical error that replaces the page if it's just malformed data
        setError("Received invalid data format for leads from API.");
      }
    } catch (err) {
      console.error("Error fetching leads:", err); // Log the full error
      setError(err.message || "Failed to load leads. Please try again."); // Set page-level error
      setLeads([]); // Ensure leads is an empty array on error
    } finally {
      setLoading(false); // Always set loading false after the fetch attempt
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
    setError(null); // Clear page error before opening modal
  };

  // Open view modal for a lead
  const openViewModal = (lead) => {
    setSelectedLeadForModal(lead);
    setShowViewModal(true);
    setError(null); // Clear page error before opening modal
  };

  // Close the edit modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedLeadForModal(null);
    // Optionally reset editFormData here if you want to clear it on close
    setEditFormData({ contactedScore: "", contactedComment: "", status: "" });
  };

  // Close the view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedLeadForModal(null);
    // No form data to reset for view modal
  };

  // Handle form data change in the edit modal
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

    // Basic client-side validation for edit form
    if (editFormData.contactedScore === "" || editFormData.status === "") {
      alert("Contacted Score and Status are required."); // Simple alert for now
      return; // Stop if validation fails
    }

    try {
      setUpdateLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        throw new Error("API URL is not configured.");
      }

      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/${selectedLeadForModal._id}`, // Endpoint to update lead
        {
          method: "PATCH", // Use PATCH for partial update
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData), // Send updated fields
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Error response during lead update:",
          response.status,
          errorData
        );
        // If backend sends a specific message for restriction
        if (response.status === 403 && errorData.restricted) {
          throw new Error(
            "Access restricted: You can only edit leads assigned to you when restriction mode is enabled."
          );
        }
        throw new Error(errorData.message || "Failed to update lead");
      }

      // Assuming backend returns the updated lead data on success
      // const updatedLead = await response.json(); // If API returns updated lead

      // Update the lead in the local state using the data sent in the request body
      setLeads((prevLeads) =>
        prevLeads.map(
          (lead) =>
            lead._id === selectedLeadForModal._id
              ? { ...lead, ...editFormData }
              : lead // Merge editFormData into existing lead data
        )
      );

      // Close modal on success
      closeModal();
    } catch (error) {
      console.error("Error updating lead:", error); // Log the full error
      // Show error in an alert or a modal-specific error area
      alert(`Error updating lead: ${error.message || error}`);
    } finally {
      setUpdateLoading(false); // Always set updateLoading false
    }
  };

  // Delete a single lead
  const deleteLead = async (id) => {
    // Check if user has permission to delete leads (SuperAdmin, Admin, or EditMode)
    if (
      userRole !== "SuperAdmin" &&
      userRole !== "Admin" &&
      userRole !== "EditMode"
    ) {
      alert("You don't have permission to delete leads.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      setDeleteLoading(true); // Use general delete loading state
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        throw new Error("API URL is not configured.");
      }
      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/${id}`, // Endpoint to delete lead
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete lead: ${response.statusText} - ${errorText}`
        );
      }

      // Remove the lead from the local state
      setLeads((prevLeads) => prevLeads.filter((lead) => lead._id !== id));
      // If the lead was selected, remove it from selected leads
      if (selectedLeads.includes(id)) {
        setSelectedLeads((prev) => prev.filter((leadId) => leadId !== id));
      }
    } catch (error) {
      console.error("Error deleting lead:", error.message); // Log the full error
      alert(`Error deleting lead: ${error.message}`); // Show error to user
    } finally {
      setDeleteLoading(false); // Always set delete loading false
    }
  };

  // Delete multiple selected leads (bulk delete)
  const deleteSelectedLeads = async () => {
    // Check if user has permission (same roles as single delete)
    if (
      userRole !== "SuperAdmin" &&
      userRole !== "Admin" &&
      userRole !== "EditMode"
    ) {
      alert("You don't have permission to delete leads.");
      return;
    }

    if (selectedLeads.length === 0) {
      alert("Please select at least one lead to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedLeads.length} selected leads? This action cannot be undone.`
      )
    )
      return;

    setDeleteLoading(true); // Use general delete loading state
    setError(null); // Clear previous errors

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        throw new Error("API URL is not configured.");
      }

      // Assuming your backend has a bulk delete endpoint that accepts an array of IDs
      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/bulk-delete`, // Example bulk delete endpoint
        {
          method: "POST", // Use POST or DELETE depending on API design (POST is common for body)
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ leadIds: selectedLeads }), // Send array of IDs in the body
        }
      );

      if (response.ok) {
        // Assuming backend returns a success message or status
        // const result = await response.json(); // Process result if needed

        // Optimistically update state by removing selected leads
        setLeads((prevLeads) =>
          prevLeads.filter((lead) => !selectedLeads.includes(lead._id))
        );
        setSelectedLeads([]); // Clear selection after successful deletion
        // Optionally show a success message
        // alert(`${selectedLeads.length} leads deleted successfully.`);
      } else {
        const errorText = await response.text();
        throw new Error(
          `Bulk delete failed: ${response.statusText} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error in bulk delete:", error); // Log the full error
      // Show error to user
      alert(`Error deleting leads: ${error.message}`);
      // You might want to re-fetch leads here to get the accurate list after partial failure
      fetchLeads();
    } finally {
      setDeleteLoading(false); // Always set delete loading false
    }
  };

  // Download Excel file with all leads data and formatting
  const downloadExcel = () => {
    if (leads.length === 0) {
      alert("No data to download");
      return;
    }

    try {
      // Prepare the data in a simple 2D array format with headers as the first row
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

      // Add all lead data
      const data = [headers];

      leads.forEach((lead, index) => {
        // Format date to IST timezone
        const formattedDate = new Date(lead.createdAt).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata", // Added IST timezone
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
      ws["!cols"] = [
        { wch: 8 }, // Sr. No.
        { wch: 25 }, // Name
        { wch: 15 }, // Mobile Number
        { wch: 25 }, // Course Name
        { wch: 30 }, // Email ID
        { wch: 22 }, // Date & Time
        { wch: 15 }, // Location
        { wch: 15 }, // Assigned To
        { wch: 15 }, // Contacted Score
        { wch: 30 }, // Contacted Comment
        { wch: 12 }, // Status
      ];

      // Style header row (bold font, white text, dark gray background)
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { patternType: "solid", fgColor: { rgb: "4A5568" } }, // Tailwind gray-700 equivalent
        alignment: { horizontal: "center" }, // Optional: center header text
      };
      for (let i = 0; i < headers.length; i++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i });
        // Ensure cell exists before trying to assign style
        if (!ws[cellAddress]) ws[cellAddress] = { v: data[0][i] };
        ws[cellAddress].s = headerStyle;
      }

      // Style data rows based on status
      for (let i = 1; i < data.length; i++) {
        const status = data[i][10]; // Status column is index 10
        let fillColor;

        // Map statuses to light background colors (Tailwind equivalents or similar)
        if (status === "Contacted") {
          fillColor = "EBF8FF"; // Tailwind blue-100
        } else if (status === "Converted") {
          fillColor = "F0FFF4"; // Tailwind green-100
        } else if (status === "Rejected") {
          fillColor = "FFF5F5"; // Tailwind red-100
        } else if (status === "Not Interested") {
          // Added Not Interested
          fillColor = "FFF5F5"; // Tailwind red-100
        } else if (status === "In Progress") {
          // Added In Progress
          fillColor = "FEFCBF"; // Tailwind yellow-100
        } else if (status === "Enrolled") {
          // Added Enrolled
          fillColor = "F0FFF4"; // Tailwind green-100
        } else {
          fillColor = "F7FAFC"; // Tailwind gray-50 (or white FFFFFF for no fill)
        }

        // Apply the style to each cell in the row if a color is set
        if (fillColor) {
          for (let j = 0; j < data[i].length; j++) {
            const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
            // Ensure cell exists
            if (!ws[cellAddress]) ws[cellAddress] = { v: data[i][j] };
            // Apply style, merge with existing style if any
            ws[cellAddress].s = {
              ...ws[cellAddress].s, // Keep any existing style (like bold for headers if they were rows)
              fill: {
                patternType: "solid",
                fgColor: { rgb: fillColor },
              },
            };
          }
        }
      }

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Leads");

      // Generate binary Excel and download
      const excelBinary = XLSX.write(wb, {
        bookType: "xlsx",
        type: "binary",
        cellStyles: true, // Ensure styles are included
      });

      // Convert binary string to Blob
      const buffer = new ArrayBuffer(excelBinary.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < excelBinary.length; i++) {
        view[i] = excelBinary.charCodeAt(i) & 0xff;
      }

      // Create blob and download
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      console.log("Excel file exported with row colors based on status");
    } catch (error) {
      console.error("Error exporting Excel file:", error); // Log the full error
      alert(
        `Error creating Excel file: ${error.message}. Falling back to CSV export.`
      );
      fallbackCSVExport(); // Offer CSV fallback
    }
  };

  // Fallback CSV export in case the Excel export fails
  const fallbackCSVExport = () => {
    if (leads.length === 0) {
      console.warn("No data to fallback export to CSV");
      return;
    }

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
      const formattedDate = new Date(lead.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata", // Using IST timezone
      });

      return [
        escapeCsvField(index + 1),
        escapeCsvField(lead.name || ""),
        escapeCsvField(lead.contact || ""),
        escapeCsvField(lead.coursename || ""),
        escapeCsvField(lead.email || ""),
        escapeCsvField(formattedDate),
        escapeCsvField(lead.location || ""),
        escapeCsvField(
          lead.assignedTo ? lead.assignedTo.username : "Not Assigned"
        ),
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
          headers.map((header) => escapeCsvField(header)).join(",") +
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

    // alert("Basic CSV exported."); // Already alerted in Excel function
  };

  // Select/deselect a lead
  const handleSelectLead = (id) => {
    // Prevent selection if deleting or updating is in progress
    if (deleteLoading || updateLoading) return;

    setSelectedLeads((prev) => {
      if (prev.includes(id)) {
        return prev.filter((leadId) => leadId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Select/deselect all leads on the current page
  const handleSelectAll = () => {
    // Prevent selection if deleting or updating is in progress
    if (deleteLoading || updateLoading) return;

    if (selectAll) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(currentLeads.map((lead) => lead._id));
    }
    // Toggle the selectAll state. The useEffect will sync the checkbox visually.
    setSelectAll(!selectAll);
  };

  // Pagination: go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Clear selection when changing pages
      setSelectedLeads([]);
      setSelectAll(false);
    }
  };

  // Pagination: go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Clear selection when changing pages
      setSelectedLeads([]);
      setSelectAll(false);
    }
  };

  // Navigate to super admin panel - Only for SuperAdmin and Admin
  const goToSuperAdmin = () => {
    if (userRole === "SuperAdmin" || userRole === "Admin") {
      router.push("/superadmin/dashboard"); // Redirect to the SuperAdmin dashboard page
    } else {
      alert("You do not have access to the Admin Panel.");
    }
  };

  // User logout
  const handleLogout = () => {
    // Clear all auth data
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminUsername");
      localStorage.removeItem("adminId");
      localStorage.removeItem("isAdminLoggedIn");
    }
    router.push("/AdminLogin"); // Redirect to login page
  };

  // Refresh leads data
  const handleRefresh = () => {
    fetchLeads(); // Re-fetch leads with current filters (if any)
  };

  // Get assigned admin color from leads data
  const getAssignedAdminColor = (assignedTo) => {
    // Assuming assignedTo is the populated admin object from the API
    return assignedTo?.color || null;
  };

  // If not authenticated, show loading screen (or the initial checkAuth handles redirect)
  // This check handles the brief moment before the useEffect runs or if checkAuth returns false
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <p className="mt-8 text-center text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  // Component rendering starts here
  return (
    // Main container using flex to manage layout, min-h-screen for full height
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Contact Leads Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={loading || deleteLoading || updateLoading} // Disable during any operation
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSync className="mr-2" />
              )}
              Refresh
            </button>
            {(userRole === "SuperAdmin" || userRole === "Admin") && (
              <button
                onClick={goToSuperAdmin}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={loading || deleteLoading || updateLoading} // Disable during any operation
              >
                <FaUserCog className="mr-2" /> Admin Panel
              </button>
            )}
            {/* Changed button to trigger Excel download */}
            <button
              onClick={downloadExcel}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={
                leads.length === 0 || loading || deleteLoading || updateLoading
              } // Disable if no leads or busy
            >
              <FaDownload className="mr-2" /> Export Excel ({leads.length}{" "}
              leads)
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={loading || deleteLoading || updateLoading} // Disable during any operation
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {" "}
        {/* p-6 padding, max-w-7xl width limit, mx-auto center, w-full takes available width */}
        {/* Bulk Actions Bar */}
        {selectedLeads.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md mb-4 gap-3">
            <span className="text-sm font-medium">
              {selectedLeads.length}{" "}
              {selectedLeads.length === 1 ? "lead" : "leads"} selected on this
              page
            </span>
            {(userRole === "SuperAdmin" ||
              userRole === "Admin" ||
              userRole === "EditMode") && (
              <button
                onClick={deleteSelectedLeads}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={deleteLoading || updateLoading || loading} // Disable if any operation is in progress
              >
                {deleteLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaTrash className="mr-2" />
                )}
                Delete Selected
              </button>
            )}
          </div>
        )}
        {/* Loading State */}
        {loading && leads.length === 0 && !error ? ( // Show loader only if loading AND no leads AND no error
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
            <p className="mt-8 text-center text-gray-600">Loading leads...</p>
          </div>
        ) : error ? ( // Show error message if there is an error
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md relative mb-4 flex items-center">
            <FaTimes className="mr-2 text-xl" />
            Error: {error}
          </div>
        ) : (
          <>
            {/* Leads Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Mobile View (Cards) */}
              <div className="lg:hidden divide-y divide-gray-200">
                {currentLeads.length > 0 ? (
                  currentLeads.map((lead, index) => {
                    const assignedAdminColor = getAssignedAdminColor(
                      lead.assignedTo
                    );
                    const cardBackgroundColor = selectedLeads.includes(lead._id)
                      ? "bg-blue-50" // Background for selected card
                      : assignedAdminColor
                        ? `${assignedAdminColor}10`
                        : "bg-white"; // Light tint of admin color or white

                    return (
                      <div
                        key={lead._id || index} // Use _id if available, fallback to index
                        className={`p-6 space-y-3 transition-colors duration-150 ${cardBackgroundColor}`}
                      >
                        {/* Select Checkbox and View Button */}
                        <div className="flex items-center justify-between">
                          {(userRole === "SuperAdmin" ||
                            userRole === "Admin" ||
                            userRole === "EditMode") && (
                            <div
                              className="flex items-center justify-center cursor-pointer text-xl text-blue-600"
                              onClick={() => handleSelectLead(lead._id)}
                              aria-label={`Select lead ${lead.name}`}
                              disabled={deleteLoading || updateLoading} // Disable checkbox while busy
                            >
                              {selectedLeads.includes(lead._id) ? (
                                <FaCheckSquare />
                              ) : (
                                <FaSquare />
                              )}
                            </div>
                          )}
                          {/* View Button */}
                          <button
                            onClick={() => openViewModal(lead)}
                            className="p-2 rounded-md text-purple-600 hover:bg-purple-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="View Lead Details"
                            aria-label={`View details for lead ${lead.name}`}
                            disabled={deleteLoading || updateLoading} // Disable view button while busy
                          >
                            <FaEye className="text-lg" />
                          </button>
                          {/* Status Badge */}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              lead.status === "Converted"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : lead.status === "Contacted"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : lead.status === "Rejected" ||
                                      lead.status === "Not Interested"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : lead.status === "In Progress"
                                      ? "bg-orange-100 text-orange-800 border-orange-200"
                                      : lead.status === "Enrolled"
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : "bg-gray-100 text-gray-800 border-gray-200" // Default New or unknown
                            }`}
                          >
                            {lead.status || "New"}
                          </span>
                        </div>

                        {/* Lead Details */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-gray-500">
                            Name:
                          </span>{" "}
                          {lead.name || "—"}
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-gray-500">
                            Mobile:
                          </span>{" "}
                          {lead.contact || "—"}
                        </div>
                        {/* Email field */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-gray-500">
                            Email:
                          </span>{" "}
                          {lead.email || "—"}
                        </div>
                        {/* Course field */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-gray-500">
                            Course:
                          </span>{" "}
                          {lead.coursename || "—"}
                        </div>
                        {/* Location field */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-gray-500">
                            Location:
                          </span>{" "}
                          {lead.location || "—"}
                        </div>
                        {/* Date & Time */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-gray-500">
                            Created:
                          </span>{" "}
                          {new Date(lead.createdAt).toLocaleString("en-US", {
                            timeZone: "Asia/Kolkata",
                          })}
                        </div>
                        {/* Assigned To */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-gray-500">
                            Assigned To:
                          </span>{" "}
                          {lead.assignedTo
                            ? lead.assignedTo.username
                            : "Not Assigned"}
                        </div>
                        {/* Contacted Info */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-gray-500">
                            Contacted Info:
                          </span>
                          <div className="ml-2 mt-1">
                            {lead.contactedScore ? (
                              <span className="block text-gray-700">
                                Score: {lead.contactedScore}
                                {lead.contactedComment && (
                                  <span className="block text-gray-600 italic text-xs">
                                    Comment:{" "}
                                    {lead.contactedComment.substring(0, 50)}
                                    {lead.contactedComment.length > 50
                                      ? "..."
                                      : ""}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-500">Not set</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          {/* Show edit button based on restrictions */}
                          {!restrictLeadEditing || // No restriction
                          userRole === "SuperAdmin" || // SuperAdmin bypass
                          userRole === "Admin" || // Admin bypass
                          (lead.assignedTo &&
                            lead.assignedTo._id ===
                              (typeof localStorage !== "undefined"
                                ? localStorage.getItem("adminId")
                                : null)) ? ( // Assigned user check
                            <button
                              onClick={() => openEditModal(lead)}
                              className="p-2 rounded-md text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit Lead Contact Info"
                              aria-label={`Edit lead ${lead.name}`}
                              disabled={deleteLoading || updateLoading} // Disable edit while busy
                            >
                              <FaEdit className="text-lg" />
                            </button>
                          ) : (
                            <button
                              className="p-2 rounded-md text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ cursor: "not-allowed" }}
                              title="Editing restricted to assigned user or admin"
                              disabled
                              aria-label={`Editing restricted for lead ${lead.name}`}
                            >
                              <FaEdit className="text-lg" />
                            </button>
                          )}
                          {(userRole === "SuperAdmin" ||
                            userRole === "Admin" ||
                            userRole === "EditMode") && (
                            <button
                              onClick={() => deleteLead(lead._id)}
                              className="p-2 rounded-md text-red-600 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Lead"
                              aria-label={`Delete lead ${lead.name}`}
                              disabled={
                                deleteLoading || updateLoading || loading
                              } // Disable delete while busy
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-600 flex flex-col items-center">
                    <FaExclamationTriangle className="text-yellow-500 text-3xl mb-4" />
                    No leads found.
                  </div>
                )}
              </div>

              {/* Desktop View (Table) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {(userRole === "SuperAdmin" ||
                        userRole === "Admin" ||
                        userRole === "EditMode") && (
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                          {" "}
                          {/* Fixed width */}
                          <div
                            className="flex items-center justify-center cursor-pointer"
                            onClick={handleSelectAll}
                            aria-label="Select all leads on page"
                            disabled={deleteLoading || updateLoading || loading} // Disable header checkbox while busy
                          >
                            {selectAll ? (
                              <FaCheckSquare className="text-blue-600 text-xl" />
                            ) : (
                              <FaSquare className="text-blue-600 text-xl" />
                            )}
                          </div>
                        </th>
                      )}
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                        View
                      </th>{" "}
                      {/* Fixed width */}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                        Sr. No.
                      </th>{" "}
                      {/* Fixed width */}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mobile Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Course Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                        Assigned To
                      </th>{" "}
                      {/* Added min-width */}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                        Contacted
                      </th>{" "}
                      {/* Added min-width */}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                        Status
                      </th>{" "}
                      {/* Fixed width */}
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                        Actions
                      </th>{" "}
                      {/* Fixed width */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentLeads.length > 0 ? (
                      currentLeads.map((lead, index) => {
                        const assignedAdminColor = getAssignedAdminColor(
                          lead.assignedTo
                        );
                        // Add transition for background color change
                        const rowBackgroundColor = selectedLeads.includes(
                          lead._id
                        )
                          ? "bg-blue-50" // Background for selected row
                          : assignedAdminColor
                            ? `${assignedAdminColor}10`
                            : ""; // Light tint of admin color if assigned, otherwise empty

                        const rowStyle = {
                          backgroundColor: rowBackgroundColor,
                          transition: "background-color 0.3s ease",
                        };

                        return (
                          <tr
                            key={lead._id || index}
                            className="hover:bg-gray-100"
                            style={rowStyle}
                          >
                            {(userRole === "SuperAdmin" ||
                              userRole === "Admin" ||
                              userRole === "EditMode") && (
                              <td className="px-6 py-4 whitespace-nowrap text-center w-12">
                                <div
                                  className="flex items-center justify-center cursor-pointer text-xl text-blue-600"
                                  onClick={() => handleSelectLead(lead._id)}
                                  aria-label={`Select lead ${lead.name}`}
                                  disabled={
                                    deleteLoading || updateLoading || loading
                                  } // Disable checkbox while busy
                                >
                                  {selectedLeads.includes(lead._id) ? (
                                    <FaCheckSquare />
                                  ) : (
                                    <FaSquare />
                                  )}
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm w-16">
                              {" "}
                              {/* Fixed width */}
                              <button
                                onClick={() => openViewModal(lead)}
                                className="p-2 rounded-md text-purple-600 hover:bg-purple-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="View Lead Details"
                                aria-label={`View details for lead ${lead.name}`}
                                disabled={
                                  deleteLoading || updateLoading || loading
                                } // Disable view button while busy
                              >
                                <FaEye className="text-lg" />
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 w-16">
                              {" "}
                              {/* Fixed width */}
                              {indexOfFirstLead + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {lead.name || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {lead.contact || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {lead.email || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {lead.coursename || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {lead.location || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 min-w-[150px]">
                              {" "}
                              {/* Added min-width */}
                              {lead.assignedTo ? (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border text-white ${
                                    lead.assignedTo.role === "SuperAdmin"
                                      ? "bg-purple-600 border-purple-700"
                                      : lead.assignedTo.role === "Admin"
                                        ? "bg-blue-600 border-blue-700"
                                        : lead.assignedTo.role === "ViewMode"
                                          ? "bg-green-600 border-green-700"
                                          : "bg-yellow-600 border-yellow-700" // EditMode
                                  }`}
                                  style={
                                    assignedAdminColor
                                      ? { backgroundColor: assignedAdminColor }
                                      : {}
                                  } // Apply admin color if available
                                >
                                  {lead.assignedTo.username}
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-700 border border-gray-200 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                  Not Assigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 min-w-[200px]">
                              {" "}
                              {/* Added min-width */}
                              <div>
                                {lead.contactedScore ? (
                                  <span className="block text-gray-700">
                                    Score: {lead.contactedScore}
                                    {lead.contactedComment && (
                                      <span className="block text-gray-600 italic text-xs">
                                        <span className="font-medium">
                                          Comment:
                                        </span>{" "}
                                        {lead.contactedComment.substring(0, 50)}
                                        {lead.contactedComment.length > 50
                                          ? "..."
                                          : ""}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">Not set</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 w-32">
                              {" "}
                              {/* Fixed width */}
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                  lead.status === "Converted"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : lead.status === "Contacted"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : lead.status === "Rejected" ||
                                          lead.status === "Not Interested"
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : lead.status === "In Progress"
                                          ? "bg-orange-100 text-orange-800 border-orange-200"
                                          : lead.status === "Enrolled"
                                            ? "bg-green-100 text-green-800 border-green-200"
                                            : "bg-gray-100 text-gray-800 border-gray-200" // Default New or unknown
                                }`}
                              >
                                {lead.status || "New"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-32">
                              {" "}
                              {/* Fixed width */}
                              <div className="flex gap-2 justify-center">
                                {/* Show edit button based on restrictions */}
                                {!restrictLeadEditing || // No restriction
                                userRole === "SuperAdmin" || // SuperAdmin bypass
                                userRole === "Admin" || // Admin bypass
                                (lead.assignedTo &&
                                  lead.assignedTo._id ===
                                    (typeof localStorage !== "undefined"
                                      ? localStorage.getItem("adminId")
                                      : null)) ? ( // Assigned user check
                                  <button
                                    onClick={() => openEditModal(lead)}
                                    className="p-2 rounded-md text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Edit Lead Contact Info"
                                    aria-label={`Edit lead ${lead.name}`}
                                    disabled={
                                      deleteLoading || updateLoading || loading
                                    } // Disable edit while busy
                                  >
                                    <FaEdit className="text-lg" />
                                  </button>
                                ) : (
                                  <button
                                    className="p-2 rounded-md text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ cursor: "not-allowed" }}
                                    title="Editing restricted to assigned user or admin"
                                    disabled
                                    aria-label={`Editing restricted for lead ${lead.name}`}
                                  >
                                    <FaEdit className="text-lg" />
                                  </button>
                                )}
                                {(userRole === "SuperAdmin" ||
                                  userRole === "Admin" ||
                                  userRole === "EditMode") && ( // Only allow delete for these roles
                                  <button
                                    onClick={() => deleteLead(lead._id)}
                                    className="p-2 rounded-md text-red-600 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete Lead"
                                    aria-label={`Delete lead ${lead.name}`}
                                    disabled={
                                      deleteLoading || updateLoading || loading
                                    } // Disable delete while busy
                                  >
                                    <FaTrash className="text-lg" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={
                            userRole === "SuperAdmin" ||
                            userRole === "Admin" ||
                            userRole === "EditMode"
                              ? 13
                              : 12
                          }
                          className="px-6 py-4 text-center text-gray-600"
                        >
                          <div className="flex flex-col items-center">
                            <FaExclamationTriangle className="text-yellow-500 text-3xl mb-4" />
                            No leads found.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={prevPage}
                  disabled={
                    currentPage === 1 ||
                    loading ||
                    deleteLoading ||
                    updateLoading
                  } // Disable while any operation is busy
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm inline-flex items-center gap-2"
                  aria-label="Previous page"
                >
                  <FaChevronLeft /> Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={nextPage}
                  disabled={
                    currentPage === totalPages ||
                    leads.length === 0 ||
                    loading ||
                    deleteLoading ||
                    updateLoading
                  } // Disable while any operation is busy
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm inline-flex items-center gap-2"
                  aria-label="Next page"
                >
                  Next <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal for editing contacted and status */}
      {showModal && selectedLeadForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Lead: {selectedLeadForModal.name}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updateLoading} // Disable close button while saving
                aria-label="Close edit lead modal"
              >
                ×
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6">
              {/* Contacted Score */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="contactedScore"
                >
                  How many times contacted:
                </label>
                <select
                  id="contactedScore"
                  name="contactedScore"
                  value={editFormData.contactedScore}
                  onChange={handleEditFormChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updateLoading} // Disable while saving
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contacted Comment */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="contactedComment"
                >
                  Contacted Comment
                </label>
                <textarea
                  id="contactedComment"
                  name="contactedComment"
                  value={editFormData.contactedComment}
                  onChange={handleEditFormChange}
                  placeholder="Add detailed comment..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  rows="4"
                  disabled={updateLoading} // Disable while saving
                ></textarea>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updateLoading} // Disable while saving
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Enrolled">Enrolled</option>
                </select>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                disabled={updateLoading} // Disable while saving
              >
                Cancel
              </button>
              <button
                onClick={saveLeadFromModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updateLoading} // Disable while saving
              >
                {updateLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Lead Details: {selectedLeadForModal.name}
              </h3>
              <button
                onClick={closeViewModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl leading-none"
                aria-label="Close lead details modal"
              >
                ×
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {/* Lead Details Items */}
                <div className="col-span-full sm:col-span-1">
                  {" "}
                  {/* Example spanning */}
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Name:
                  </h4>
                  <p className="text-base text-gray-900 break-words">
                    {selectedLeadForModal.name || "—"}
                  </p>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Mobile Number:
                  </h4>
                  <p className="text-base text-gray-900 break-words">
                    {selectedLeadForModal.contact || "—"}
                  </p>
                </div>
                <div className="col-span-full">
                  {" "}
                  {/* Span full width */}
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Email:
                  </h4>
                  <p className="text-base text-gray-900 break-words">
                    {selectedLeadForModal.email || "—"}
                  </p>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Course Name:
                  </h4>
                  <p className="text-base text-gray-900 break-words">
                    {selectedLeadForModal.coursename || "—"}
                  </p>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Location:
                  </h4>
                  <p className="text-base text-gray-900 break-words">
                    {selectedLeadForModal.location || "—"}
                  </p>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Date & Time:
                  </h4>
                  <p className="text-base text-gray-900 break-words">
                    {selectedLeadForModal.createdAt
                      ? new Date(selectedLeadForModal.createdAt).toLocaleString(
                          "en-US",
                          { timeZone: "Asia/Kolkata" }
                        )
                      : "—"}
                  </p>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Assigned To:
                  </h4>
                  <p className="text-base text-gray-900 break-words">
                    {selectedLeadForModal.assignedTo
                      ? selectedLeadForModal.assignedTo.username
                      : "Not Assigned"}
                  </p>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Contacted Score:
                  </h4>
                  <p className="text-base text-gray-900 break-words">
                    {selectedLeadForModal.contactedScore
                      ? selectedLeadForModal.contactedScore
                      : "Not set"}
                  </p>
                </div>
                <div className="col-span-full">
                  {" "}
                  {/* Span full width */}
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Contacted Comment:
                  </h4>
                  <p className="text-base text-gray-900 break-words">
                    {selectedLeadForModal.contactedComment
                      ? selectedLeadForModal.contactedComment
                      : "No comment"}
                  </p>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Status:
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${
                      selectedLeadForModal.status === "Converted"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : selectedLeadForModal.status === "Contacted"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : selectedLeadForModal.status === "Rejected" ||
                              selectedLeadForModal.status === "Not Interested"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : selectedLeadForModal.status === "In Progress"
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : selectedLeadForModal.status === "Enrolled"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200" // Default New or unknown
                    }`}
                  >
                    {selectedLeadForModal.status || "New"}
                  </span>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
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
