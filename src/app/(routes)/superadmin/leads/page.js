"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboard/Dashboard.module.css";
import {
  FaUsers,
  FaUserCog,
  FaChartBar,
  FaClipboardList, // Keep for "Go to Dashboard" link
  FaHistory, // Keep for Audit Logs link
  FaSignOutAlt, // Keep for Logout
  FaTachometerAlt, // Keep for Dashboard link
  FaKey, // Keep for Roles link
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
  FaSync,
  FaTimes,
  FaCog, // Keep for Settings link
} from "react-icons/fa";
// Removed Link import from here as it's used within the Sidebar
// import Link from "next/link";

import Sidebar from "@/components/superadmin/Sidebar"; // Import reusable Sidebar
import AccessControl from "@/components/superadmin/AccessControl"; // Import reusable AccessControl
import { fetchWithAuth } from "@/utils/auth"; // Import reusable fetch utility

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "";
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
  const [error, setError] = useState(null); // Page-level error
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
  const [formErrors, setFormErrors] = useState({}); // **Declared formErrors state**
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
  const [totalPages, setTotalPages] = useState(1);
  const leadsPerPage = 20; // Note: Pagination logic is client-side for now, server-side pagination needed for large datasets
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState("status"); // "status", "assign", "delete"
  const [bulkFormData, setBulkFormData] = useState({
    status: "New",
    assignedTo: "",
  });
  const [userRole, setUserRole] = useState(null); // State to store user role

  // Authentication and initial data check
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");
    setUserRole(role); // Set user role state

    if (!token) {
      router.push("/AdminLogin");
      return; // Stop further execution if not authenticated
    }

    // If role is neither SuperAdmin nor Admin, redirect
    if (role !== "SuperAdmin" && role !== "Admin") {
       // The AccessControl component will handle showing the restricted message
       // but a client-side redirect is also good for initial load
      router.push("/dashboard"); // Or some other appropriate page
      return;
    }

    // Fetch necessary data (admins, initial leads)
    fetchData();
  }, [router]); // Depend on router for initial check

  // Fetch leads when filters or pagination changes
  useEffect(() => {
     // Only fetch if the user role is authorized and admins data is loaded
    if ((userRole === "SuperAdmin" || userRole === "Admin") && admins.length > 0) {
        fetchLeads();
    }
  }, [currentPage, filters, admins.length, userRole]); // Add userRole and admins.length as dependencies


  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch admins for assign dropdown
      const adminsResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admins`
      );

      let adminsData = [];
      if (adminsResponse.ok) {
        adminsData = await adminsResponse.json();
        setAdmins(adminsData);
      } else {
         console.error("Failed to fetch admins:", await adminsResponse.text());
      }

      // Fetch leads immediately after (or in parallel with) admins
      // The fetchLeads effect hook will trigger when admins state is updated
      // but we can also call it here to ensure initial data load
      await fetchLeads();


    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err.message);
      setLoading(false); // Ensure loading is false even if initial fetch fails
    }
     // setLoading(false); // setLoading moved inside fetchLeads for better control
  };

  const fetchLeads = async () => {
    setLoading(true); // Set loading true before fetching leads
    setError(null);
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.assignedTo && filters.assignedTo !== 'assigned') queryParams.append('assignedTo', filters.assignedTo);
      if (filters.assignedTo === 'unassigned') queryParams.append('assignedTo', 'null'); // Assuming 'null' string signifies unassigned in API
      if (filters.assignedTo === 'assigned') queryParams.append('assignedTo', 'notnull'); // Assuming 'notnull' signifies any assigned lead in API

      if (filters.coursename) queryParams.append('coursename', filters.coursename);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.search) queryParams.append('search', filters.search);

      // Add pagination (if server supports it, otherwise client-side slicing)
      // queryParams.append('page', currentPage);
      // queryParams.append('limit', leadsPerPage);

       const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Use empty string as fallback
       if (!apiUrl) {
            console.error("NEXT_PUBLIC_API_URL is not defined");
            setError("API URL is not configured.");
            setLoading(false);
            return;
       }

      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/filter?${queryParams.toString()}`
      );

      if (!response.ok) {
        const errorText = await response.text();
         console.error("Failed to fetch leads response:", response.status, errorText);
        throw new Error(`Failed to fetch leads: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Assuming the API returns an array of leads directly or an object with a 'leads' array and 'totalItems'/'totalPages'
      // Adjust based on your actual API response structure
      const leadsData = Array.isArray(data) ? data : data.leads || [];
      const totalItemsData = Array.isArray(data) ? data.length : data.totalItems || leadsData.length; // Estimate total if API doesn't provide it

      setLeads(leadsData);
      setTotalLeads(totalItemsData);
      setTotalPages(Math.ceil(totalItemsData / leadsPerPage)); // Calculate total pages based on fetched total

      // Extract unique course names and locations for filters from *all* fetched data
      const courses = [...new Set(leadsData.map(lead => lead.coursename).filter(Boolean))].sort();
      const locations = [...new Set(leadsData.map(lead => lead.location).filter(Boolean))].sort();

      setCourseOptions(courses);
      setLocationOptions(locations);

      // Reset selected leads when fetching new data
      setSelectedLeads([]);
      setSelectAll(false);

    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.message);
    } finally {
      setLoading(false); // Set loading false after fetch attempt
    }
  };

  // Basic form validation for modal
  const validateModalForm = (formData, modalType) => {
      const errors = {};
      // Basic validation rules apply to create and edit forms
      if (modalType !== 'assign') {
          if (!formData.name.trim()) errors.name = "Name is required";
          if (!formData.email.trim()) errors.email = "Email is required";
          if (!formData.contact.trim()) errors.contact = "Contact number is required";
          if (!formData.status) errors.status = "Status is required";

           // Optional: Add email format validation
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
           if (formData.email.trim() && !emailPattern.test(formData.email.trim())) {
             errors.email = "Invalid email address";
           }

           // Optional: Add contact number format/length validation if needed
           // This requires countryCodes logic, which is currently only in Stickyform
           // If needed here, you'd need to duplicate or refactor that logic
      }
      // No specific validation needed for assign modal beyond assignedTo existence (which is handled by backend)

      return errors;
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

     // Clear specific form error when input changes
     if (formErrors[name]) {
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: undefined // Or null, depending on how you check for errors
        }));
     }
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
    // Fetch leads is triggered by the filters state change in the useEffect
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
    // Fetch leads is triggered by the filters state change in the useEffect
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
    setFormErrors({}); // Clear form errors
    setModalType("create");
    setShowModal(true);
     setError(null); // Clear previous page-level errors
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
      assignedTo: lead.assignedTo?._id || "", // Use _id for the assignedTo value
    });
    setFormErrors({}); // Clear form errors
    setModalType("edit");
    setShowModal(true);
     setError(null); // Clear previous page-level errors
  };

  const openAssignModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      ...formData, // Keep other formData values if needed, or just the assignedTo
      assignedTo: lead.assignedTo?._id || "",
    });
     setFormErrors({}); // Clear form errors
    setModalType("assign");
    setShowModal(true);
    setError(null); // Clear previous page-level errors
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLead(null);
     setFormErrors({}); // Clear form errors when closing modal
     setError(null); // Clear page-level error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous form errors before validating
    setFormErrors({});

    // Perform validation for modal forms (create/edit)
    if (modalType !== 'assign') {
        const errors = validateModalForm(formData, modalType);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            console.warn("Modal form validation failed:", errors);
            return; // Stop submission if validation fails
        }
    }


    setSubmitting(true);
     setError(null); // Clear previous page-level errors on submit attempt


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
      // Set page-level error to display above the table
      setError(err.message || "An unexpected error occurred during form submission.");
    } finally {
      setSubmitting(false);
      // Error is handled by the page-level error state, modal might still show.
      // If you want the modal to close on success but stay open on error,
      // the closeModal call needs to be conditional or moved inside create/update/assignLead on success.
    }
  };

  const createLead = async () => {
    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Use empty string as fallback
       if (!apiUrl) throw new Error("API URL is not configured.");

      const response = await fetchWithAuth(
        `${apiUrl}/api/leads`, // Assuming the endpoint for creating leads is /api/leads (was /api/users)
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
        // If backend returns validation errors, set formErrors
         if (response.status === 400 && data.errors) {
             setFormErrors(data.errors);
             throw new Error("Validation failed"); // Throw a generic error to be caught by handleSubmit
         }
        throw new Error(data.message || "Failed to create lead");
      }

      // Success
      await fetchLeads(); // Refresh the list
      closeModal(); // Close modal on success
    } catch (err) {
      console.error("Error creating lead:", err);
      // Error state is set in handleSubmit or here if validation failed
      throw err; // Re-throw to be caught by handleSubmit
    }
  };

  const updateLead = async () => {
    try {
       if (!selectedLead?._id) throw new Error("No lead selected for update.");
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Use empty string as fallback
       if (!apiUrl) throw new Error("API URL is not configured.");


      const leadData = { ...formData };

      // Convert empty strings to null for certain fields expected by backend
      // Ensure assignedTo is null if empty string
      if (leadData.assignedTo === "") {
        leadData.assignedTo = null;
      } else {
         // Ensure assignedTo is a string if it's not empty
         leadData.assignedTo = String(leadData.assignedTo);
      }

      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/${selectedLead._id}`, // Assuming the endpoint for updating leads is /api/leads/:id (was /api/users)
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(leadData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response during lead update:", response.status, errorData);
         // If backend returns validation errors, set formErrors
         if (response.status === 400 && errorData.errors) {
             setFormErrors(errorData.errors);
             throw new Error("Validation failed"); // Throw a generic error to be caught by handleSubmit
         }
        throw new Error(errorData.message || `Failed to update lead: ${response.statusText}`);
      }

      // Success
      await fetchLeads(); // Refresh the list
      closeModal(); // Close modal on success
    } catch (err) {
      console.error("Error updating lead:", err);
      // Error state is set in handleSubmit or here if validation failed
      throw err; // Re-throw to be caught by handleSubmit
    }
  };

  const assignLead = async () => {
    try {
      if (!selectedLead?._id) throw new Error("No lead selected for assignment.");
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Use empty string as fallback
       if (!apiUrl) throw new Error("API URL is not configured.");


      const assignedToId = formData.assignedTo || null; // Use null if empty string


      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/${selectedLead._id}`, // Assuming the endpoint for assigning is part of update
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignedTo: assignedToId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to assign lead");
      }

      // Success
      await fetchLeads(); // Refresh the list
      closeModal(); // Close modal on success
    } catch (err) {
      console.error("Error assigning lead:", err);
      // Error state is set in handleSubmit
      throw err; // Re-throw to be caught by handleSubmit
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }
    setLoading(true); // Show loading indicator during delete
    setError(null); // Clear previous errors

    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Use empty string as fallback
       if (!apiUrl) throw new Error("API URL is not configured.");


      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/${id}`, // Assuming the endpoint is /api/leads/:id (was /api/users)
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete lead");
      }

      // Success
      await fetchLeads(); // Refresh the list (will also turn off loading)
    } catch (err) {
      console.error("Error deleting lead:", err);
      setError(err.message || "Error deleting lead. Please try again.");
      setLoading(false); // Turn off loading on error
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

  // Handle select all leads on the current page
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads([]);
    } else {
      // Select all leads currently displayed on the page
      setSelectedLeads(displayedLeads.map(lead => lead._id));
    }
    setSelectAll(!selectAll);
  };

  // Open bulk action modal
  const openBulkActionModal = (actionType) => {
    if (selectedLeads.length === 0) {
      alert("Please select at least one lead.");
      return;
    }

    setBulkActionType(actionType);
    // Reset bulk form data based on action type default
    if (actionType === "status") {
        setBulkFormData({ status: "New", assignedTo: "" });
    } else if (actionType === "assign") {
         setBulkFormData({ status: "", assignedTo: "" });
    } else if (actionType === "delete") {
         setBulkFormData({ status: "", assignedTo: "" }); // Not needed for delete
    }

    setBulkActionModalOpen(true);
     setError(null); // Clear previous page-level errors
  };

  // Handle bulk action submission
  const handleBulkAction = async (e) => {
    e.preventDefault();

    setSubmitting(true);
     setError(null); // Clear previous page-level errors on submit attempt

    try {
      if (bulkActionType === "delete") {
        await bulkDeleteLeads();
      } else { // status or assign
        await bulkUpdateLeads();
      }
    } catch (err) {
      console.error("Error in bulk action:", err);
      setError(err.message || "An unexpected error occurred during bulk action.");
    } finally {
      setSubmitting(false);
      setBulkActionModalOpen(false); // Close bulk action modal regardless of success/failure
    }
  };

  // Bulk update leads
  const bulkUpdateLeads = async () => {
    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Use empty string as fallback
       if (!apiUrl) throw new Error("API URL is not configured.");

      const updateData = {};

      if (bulkActionType === "status") {
        updateData.status = bulkFormData.status;
      } else if (bulkActionType === "assign") {
        updateData.assignedTo = bulkFormData.assignedTo || null; // Use null if empty string
      } else {
          throw new Error("Invalid bulk update action type.");
      }

       if (selectedLeads.length === 0) {
           console.warn("No leads selected for bulk update. Skipping.");
           return; // Do nothing if no leads are selected
       }


      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/bulk-update`, // Assuming this is your bulk update endpoint
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
      await fetchLeads(); // Refresh the list (will also turn off loading)
    } catch (err) {
      console.error("Error in bulk update:", err);
      setError(err.message);
      throw err; // Re-throw to be caught by handleBulkAction
    }
  };

  // Bulk delete leads
  const bulkDeleteLeads = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads? This action cannot be undone.`)) {
      return; // User cancelled
    }

    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Use empty string as fallback
       if (!apiUrl) throw new Error("API URL is not configured.");

       if (selectedLeads.length === 0) {
           console.warn("No leads selected for bulk delete. Skipping.");
           return; // Do nothing if no leads are selected
       }


      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/bulk-delete`, // Assuming this is your bulk delete endpoint
        {
          method: "POST", // Use POST for body with DELETE semantics
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
      await fetchLeads(); // Refresh the list (will also turn off loading)
    } catch (err) {
      console.error("Error in bulk delete:", err);
      setError(err.message);
      throw err; // Re-throw to be caught by handleBulkAction
    }
  };


  // Download CSV with enhanced formatting
  const downloadCSV = () => {
    if (leads.length === 0) {
      alert("No data available for download");
      return;
    }

    // Define headers with all available fields
    const headers = [
      "Sr. No.",
      "Name",
      "Mobile Number",
      "Course Name",
      "Email ID",
      "Location",
      "Status",
      "Contacted Score", // Assuming these fields exist in your lead objects
      "Comments", // Assuming these fields exist in your lead objects
      "Assigned To",
      "Creation Date & Time",
      "Last Updated"
    ];

    // Map leads data including all fields
    const csvRows = leads.map((lead, index) => {
      // Format dates nicely for better readability in UTC
      const createdDate = lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-US", {
        timeZone: "UTC",
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : "";

      const updatedDate = lead.updatedAt ? new Date(lead.updatedAt).toLocaleString("en-US", {
        timeZone: "UTC",
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : "";


      // Quote strings to handle commas and quotes in fields properly
      const quoteValue = (value) => {
        if (value === null || value === undefined) return '""';
        // Convert boolean to string, handle objects
        const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        // Replace double quotes with two double quotes, wrap in double quotes
        return `"${strValue.replace(/"/g, '""')}"`;
      };

      // Prepare row with all fields, using quoteValue for each potentially problematic field
      return [
        index + 1, // Sr. No.
        quoteValue(lead.name),
        quoteValue(lead.countryCode ? `${lead.countryCode}${lead.contact}` : lead.contact), // Combine country code and contact
        quoteValue(lead.coursename),
        quoteValue(lead.email),
        quoteValue(lead.location),
        quoteValue(lead.status || "New"),
        quoteValue(lead.contactedScore || ""), // Use actual field names from your lead object
        quoteValue(lead.contactedComment || ""), // Use actual field names from your lead object
        quoteValue(lead.assignedTo?.username || "Unassigned"), // Safely access username
        quoteValue(createdDate),
        quoteValue(updatedDate)
      ];
    });

    // Create CSV content with headers and rows
    const csvContent = [
      headers.map(header => `"${header}"`).join(","), // Quote headers too
      ...csvRows.map((row) => row.join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    // Generate filename with date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    a.href = url;
    a.download = `leads_export_${dateStr}.csv`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up
  };

  // Handle pagination - NOTE: This is client-side pagination on the currently fetched data.
  // For large datasets, implement server-side pagination.
  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  // Calculate pagination values for client-side rendering
  const startIndex = (currentPage - 1) * leadsPerPage;
  const displayedLeads = leads.slice(startIndex, startIndex + leadsPerPage);


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
      <Sidebar activePage="leads" /> {/* Pass activePage prop */}

      <main className={styles.mainContent}>
        {/* AccessControl handles the overall access to this page's content */}
        <AccessControl section="leads"> {/* Wrap content with AccessControl */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Lead Management</h1>
            <p className={styles.pageDescription}>
              Manage, filter, and assign leads to admin users.
            </p>
          </div>

          {error && <div className={styles.errorMessage}>
             <FaTimes className={styles.errorIcon} style={{ marginRight: "0.5rem" }} /> {error}
             </div>}

          {/* Action Buttons */}
          <div className={styles.formActions} style={{ marginBottom: "1rem" }}>
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={openCreateModal}
              disabled={loading || submitting}
            >
              <FaUsers style={{ marginRight: "0.5rem" }} /> Add New Lead
            </button>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={fetchLeads} // This will refetch based on current filters and reset to page 1
              disabled={loading || submitting}
            >
              {loading ? (
                 <FaSpinner className={styles.spinner} />
              ) : (
                 <FaSync />
              )}
               <span style={{ marginLeft: "0.5rem" }}>Refresh Data</span>
            </button>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={downloadCSV}
              disabled={leads.length === 0}
            >
              <FaDownload style={{ marginRight: "0.5rem" }} /> Export CSV ({leads.length} leads)
            </button>
          </div>

          {/* Filters */}
          <div className={styles.chartContainer} style={{ marginBottom: "1rem" }}>
            <h3 className={styles.chartTitle}>
              <FaFilter style={{ marginRight: "0.5rem", display: "inline" }} /> Filter Leads
            </h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={styles.formSelect}
                  disabled={loading || submitting}
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                  <option value="Rejected">Rejected</option>
                  {/* Add other statuses if applicable */}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Assigned To</label>
                <select
                  name="assignedTo"
                  value={filters.assignedTo}
                  onChange={handleFilterChange}
                  className={styles.formSelect}
                  disabled={loading || submitting}
                >
                  <option value="">All</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="assigned">Any Admin</option> {/* Option to filter for any assigned lead */}
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.username} ({admin.role})
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
                  disabled={loading || submitting}
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
                  disabled={loading || submitting}
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
                  <FaCalendarAlt style={{ marginRight: "0.5rem", display: "inline" }} /> Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className={styles.formInput}
                  disabled={loading || submitting}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaCalendarAlt style={{ marginRight: "0.5rem", display: "inline" }} /> End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className={styles.formInput}
                  disabled={loading || submitting}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaSearch style={{ marginRight: "0.5rem", display: "inline" }} /> Search
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Name, Email, or Phone"
                  className={styles.formInput}
                  disabled={loading || submitting}
                />
              </div>
              <div className={styles.formActions} style={{ alignSelf: "flex-end" }}>
                <button
                  className={`${styles.button} ${styles.secondaryButton}`}
                  onClick={resetFilters}
                   disabled={loading || submitting}
                >
                  Reset
                </button>
                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={applyFilters}
                   disabled={loading || submitting}
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
                {selectedLeads.length} {selectedLeads.length === 1 ? "lead" : "leads"} selected on this page
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => openBulkActionModal("status")}
                  className={`${styles.button} ${styles.secondaryButton}`}
                  style={{ padding: "0.5rem 0.75rem" }}
                   disabled={submitting || loading}
                >
                  Change Status
                </button>
                <button
                  onClick={() => openBulkActionModal("assign")}
                  className={`${styles.button} ${styles.secondaryButton}`}
                  style={{ padding: "0.5rem 0.75rem" }}
                   disabled={submitting || loading}
                >
                  Assign
                </button>
                <button
                  onClick={() => openBulkActionModal("delete")}
                  className={`${styles.button} ${styles.dangerButton}`}
                  style={{ padding: "0.25rem 0.5rem" }}
                   disabled={submitting || loading}
                >
                  <FaTrash style={{ marginRight: "0.5rem" }} /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Leads Table */}
          {loading && !leads.length ? ( // Show full-page loader only if no leads are loaded yet
               <div className={styles.loadingContainer}>
                  <div className={styles.loader}></div>
                  <p>Loading leads...</p>
               </div>
            ) : (
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
                         <tr
                           key={lead._id}
                           style={lead.assignedTo?.color ? {
                             backgroundColor: `${lead.assignedTo.color}30`, // Add transparency (30% opacity)
                             transition: 'background-color 0.3s ease'
                           } : {}}
                         >
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
                           <td data-label="Contact">{lead.countryCode}{lead.contact}</td> {/* Combined country code and contact */}
                           <td data-label="Email">{lead.email}</td>
                           <td data-label="Course">{lead.coursename}</td>
                           <td data-label="Location">{lead.location}</td>
                           <td data-label="Status">
                             <span className={`${styles.badge} ${
                               lead.status === "New" ? styles.badgeBlue :
                               lead.status === "Contacted" ? styles.badgeYellow :
                               lead.status === "Converted" ? styles.badgeGreen :
                               styles.badgeRed // Assuming Rejected uses badgeRed
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
                                 styles.editModeBadge // Assuming EditMode uses editModeBadge
                               }`}
                                 style={lead.assignedTo.color ? { backgroundColor: lead.assignedTo.color } : {}} // Apply admin color if available
                               >
                                 {lead.assignedTo.username}
                               </span>
                             ) : (
                               <span className={styles.badgeGray}>Unassigned</span>
                             )}
                           </td>
                           <td data-label="Created">
                             {formatDate(lead.createdAt)}
                           </td>
                           <td data-label="Actions">
                             <div className={styles.actionButtonsContainer}>
                               <button
                                 onClick={() => openEditModal(lead)}
                                 className={`${styles.button} ${styles.secondaryButton}`}
                                 style={{ padding: "0.25rem 0.5rem" }}
                                 title="Edit"
                                  disabled={submitting}
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => openAssignModal(lead)}
                                  className={`${styles.button} ${styles.secondaryButton}`}
                                  style={{ padding: "0.25rem 0.5rem" }}
                                  title="Assign"
                                   disabled={submitting}
                                >
                                  <FaUserEdit />
                                </button>
                                <button
                                  onClick={() => deleteLead(lead._id)}
                                  className={`${styles.button} ${styles.dangerButton}`}
                                  style={{ padding: "0.25rem 0.5rem" }}
                                  title="Delete"
                                   disabled={submitting}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className={styles.noDataMessage}> {/* Use a specific class for no data message */}
                             {error ? `Error loading leads: ${error}` :
                             (Object.values(filters).some(value => value !== "")) ?
                              "No leads found matching the filter criteria. Try adjusting your filters." :
                              "No leads found."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
           )}


          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.paginationControls}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading || submitting}
                className={styles.paginationButton}
              >
                Previous
              </button>
              <span className={styles.pageIndicator}>
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading || submitting}
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
                {/* Display form-specific errors if any */}
                {Object.keys(formErrors).length > 0 && (
                   <div className={styles.errorMessage}>
                     <FaTimes className={styles.errorIcon} style={{ marginRight: "0.5rem" }} /> Please fix the errors in the form.
                   </div>
                )}
                 {/* Display page-level error if it happened during form submission */}
                {error && (
                   <div className={styles.errorMessage}>
                     <FaTimes className={styles.errorIcon} style={{ marginRight: "0.5rem" }} /> {error}
                   </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className={styles.modalBody}>
                    {modalType !== "assign" && (
                      <>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="name">
                            Name <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`${styles.formInput} ${formErrors.name ? styles.inputError : ''}`}
                            required
                            disabled={submitting}
                          />
                          {formErrors.name && (
                            <p className={styles.formError}>{formErrors.name}</p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="email">
                            Email <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`${styles.formInput} ${formErrors.email ? styles.inputError : ''}`}
                            required
                            disabled={submitting}
                          />
                          {formErrors.email && (
                            <p className={styles.formError}>{formErrors.email}</p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="contact">
                            Contact Number <span className={styles.required}>*</span>
                          </label>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            {/* Country Code Input - Assuming this is a text input for custom codes */}
                             {/* If you have a fixed list, it should be a select like in StickyForm */}
                            <input
                              type="text"
                              id="countryCode"
                              name="countryCode"
                              value={formData.countryCode}
                              onChange={handleInputChange}
                              className={`${styles.formInput} ${formErrors.countryCode ? styles.inputError : ''}`}
                              placeholder="+91"
                              style={{ flexBasis: "80px", flexShrink: 0 }} // Fixed width for country code
                               disabled={submitting}
                            />
                             {/* Note: Error handling for countryCode might need more specific logic if it's a text input */}
                             {formErrors.countryCode && (
                                <p className={styles.formError}>{formErrors.countryCode}</p>
                              )}
                            <input
                              type="text"
                              id="contact"
                              name="contact"
                              value={formData.contact}
                              onChange={handleInputChange}
                              className={`${styles.formInput} ${formErrors.contact ? styles.inputError : ''}`}
                              required
                              disabled={submitting}
                            />
                             {formErrors.contact && (
                                <p className={styles.formError}>{formErrors.contact}</p>
                              )}
                          </div>
                           {/* Combined error message for contact if needed, or keep separate */}
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
                            className={`${styles.formInput} ${formErrors.coursename ? styles.inputError : ''}`}
                             disabled={submitting}
                          />
                           {formErrors.coursename && (
                                <p className={styles.formError}>{formErrors.coursename}</p>
                              )}
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
                            className={`${styles.formInput} ${formErrors.location ? styles.inputError : ''}`}
                             disabled={submitting}
                          />
                           {formErrors.location && (
                                <p className={styles.formError}>{formErrors.location}</p>
                              )}
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="status">
                            Status <span className={styles.required}>*</span>
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={`${styles.formSelect} ${formErrors.status ? styles.inputError : ''}`}
                             required
                              disabled={submitting}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Converted">Converted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                           {formErrors.status && (
                                <p className={styles.formError}>{formErrors.status}</p>
                              )}
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
                            className={`${styles.formTextarea} ${formErrors.notes ? styles.inputError : ''}`}
                            rows="3"
                             disabled={submitting}
                          ></textarea>
                           {formErrors.notes && (
                                <p className={styles.formError}>{formErrors.notes}</p>
                              )}
                        </div>
                      </>
                    )}

                    {modalType === "assign" && (
                       <div className={styles.formGroup}>
                         <label className={styles.formLabel} htmlFor="assignedTo">
                           Assign To
                         </label>
                         <select
                           id="assignedTo"
                           name="assignedTo"
                           value={formData.assignedTo}
                           onChange={handleInputChange}
                           className={`${styles.formSelect} ${formErrors.assignedTo ? styles.inputError : ''}`}
                            disabled={submitting}
                         >
                           <option value="">Unassigned</option>
                           {admins.map((admin) => (
                             <option key={admin._id} value={admin._id}>
                               {admin.username} ({admin.role})
                             </option>
                           ))}
                         </select>
                          {formErrors.assignedTo && (
                                <p className={styles.formError}>{formErrors.assignedTo}</p>
                              )}
                       </div>
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
                 {Object.keys(formErrors).length > 0 && ( // Display form-specific errors if any
                   <div className={styles.errorMessage}>
                     <FaTimes className={styles.errorIcon} style={{ marginRight: "0.5rem" }} /> Please fix the errors in the form.
                   </div>
                )}
                 {/* Display page-level error if it happened during bulk action */}
                {error && (
                   <div className={styles.errorMessage}>
                     <FaTimes className={styles.errorIcon} style={{ marginRight: "0.5rem" }} /> {error}
                   </div>
                )}
                <form onSubmit={handleBulkAction}>
                  <div className={styles.modalBody}>
                    {bulkActionType === "delete" ? (
                      <p>Are you sure you want to delete {selectedLeads.length} leads? This action cannot be undone.</p>
                    ) : bulkActionType === "status" ? (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="bulk-status">
                          New Status <span className={styles.required}>*</span>
                        </label>
                        <select
                          id="bulk-status"
                          value={bulkFormData.status}
                          onChange={(e) => setBulkFormData({...bulkFormData, status: e.target.value})}
                          className={`${styles.formSelect} ${formErrors.status ? styles.inputError : ''}`}
                          required
                           disabled={submitting}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                         {formErrors.status && (
                                <p className={styles.formError}>{formErrors.status}</p>
                              )}
                      </div>
                    ) : ( // bulkActionType === "assign"
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="bulk-assignedTo">
                          Assign To
                        </label>
                        <select
                          id="bulk-assignedTo"
                          value={bulkFormData.assignedTo}
                          onChange={(e) => setBulkFormData({...bulkFormData, assignedTo: e.target.value})}
                          className={`${styles.formSelect} ${formErrors.assignedTo ? styles.inputError : ''}`}
                           disabled={submitting}
                        >
                          <option value="">Unassigned</option>
                          {admins.map((admin) => (
                            <option key={admin._id} value={admin._id}>
                              {admin.username} ({admin.role})
                            </option>
                          ))}
                        </select>
                         {formErrors.assignedTo && (
                                <p className={styles.formError}>{formErrors.assignedTo}</p>
                              )}
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
        </AccessControl>
      </main>
    </div>
  );
};

export default LeadManagementPage;