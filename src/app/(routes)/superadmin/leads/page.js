"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaFilter,
  FaDownload,
  FaSearch,
  FaCalendarAlt,
  FaUserEdit,
  FaSync,
  FaTimes,
  FaCheckSquare, // For checkbox (checked)
  FaSquare, // For checkbox (unchecked)
  FaShieldAlt, // For error state icon
} from "react-icons/fa";

import Sidebar from "@/components/superadmin/Sidebar"; // Import reusable Sidebar
import AccessControl from "@/components/superadmin/AccessControl"; // Import reusable AccessControl
import { fetchWithAuth } from "@/utils/auth"; // Import reusable fetch utility

// Array of 20 distinct colors for admin users with names (Used for assignedTo color background)
// Keep this array as it's likely needed for dynamic background colors
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

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    countryCode: "", // Assuming this field exists in your leads
    coursename: "",
    location: "",
    status: "New",
    notes: "", // Assuming notes field exists
    assignedTo: "", // Will be admin _id
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // Form validation errors
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
  const leadsPerPage = 20; // Client-side pagination limit for display
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState("status"); // "status", "assign", "delete"
  const [bulkFormData, setBulkFormData] = useState({
    status: "New", // Default status for bulk update
    assignedTo: "", // Default assignedTo for bulk assign
  });
  const [userRole, setUserRole] = useState(null); // State to store user role

  // Authentication and initial data check
  useEffect(() => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("adminToken")
        : null;
    const role =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("adminRole")
        : null;
    setUserRole(role); // Set user role state

    if (!token) {
      router.push("/AdminLogin");
      return; // Stop further execution if not authenticated
    }

    // If role is neither SuperAdmin nor Admin, redirect
    // The AccessControl component will handle showing the restricted message
    // but a client-side redirect is also good for initial load
    if (
      role !== "SuperAdmin" &&
      role !== "Admin" &&
      role !== "ViewMode" &&
      role !== "EditMode"
    ) {
      router.push("/dashboard"); // Or some other appropriate page
      return;
    }

    // Fetch necessary data (admins, initial leads, options)
    fetchData();
  }, [router]); // Depend on router for initial check

  // Fetch leads when filters or pagination changes
  useEffect(() => {
    // Only fetch if the user role is authorized
    if (
      userRole === "SuperAdmin" ||
      userRole === "Admin" ||
      userRole === "ViewMode" ||
      userRole === "EditMode"
    ) {
      fetchLeads();
    }
    // Added userRole as a dependency so filters apply after role check
  }, [currentPage, filters, userRole]);

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
        // Filter out SuperAdmins from the assign dropdown if needed,
        // although the backend should enforce who can be assigned leads.
        // For now, include all admins that the API returns.
        setAdmins(adminsData);
      } else {
        console.error("Failed to fetch admins:", await adminsResponse.text());
        // Optionally set an error specifically for admin fetch failure if leads can still load
      }

      // Fetch leads is triggered by the filters state change in the useEffect after admins are set.
      // We don't need to call fetchLeads directly here again.
    } catch (err) {
      console.error("Error fetching initial data (admins):", err);
      setError(err.message); // Use this for critical errors preventing data fetch
      setLoading(false); // Ensure loading is false even if initial fetch fails
    }
    // setLoading is handled by the fetchLeads effect
  };

  const fetchLeads = async () => {
    setLoading(true); // Set loading true before fetching leads
    setError(null); // Clear previous errors
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      if (filters.status) queryParams.append("status", filters.status);

      // Handle 'unassigned' and 'assigned' filters
      if (filters.assignedTo === "unassigned") {
        queryParams.append("assignedTo", "null"); // Assuming 'null' string signifies unassigned in API
      } else if (filters.assignedTo === "assigned") {
        queryParams.append("assignedTo", "notnull"); // Assuming 'notnull' signifies any assigned lead in API
      } else if (filters.assignedTo) {
        queryParams.append("assignedTo", filters.assignedTo); // Specific admin ID
      }

      if (filters.coursename)
        queryParams.append("coursename", filters.coursename);
      if (filters.location) queryParams.append("location", filters.location);

      // Format dates to ISO strings if they exist
      if (filters.startDate)
        queryParams.append(
          "startDate",
          new Date(filters.startDate).toISOString()
        );
      if (filters.endDate) {
        // For end date, add one day to include the entire end day
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        queryParams.append("endDate", endDate.toISOString());
      }

      if (filters.search) queryParams.append("search", filters.search);

      // Add pagination (if server supports it, otherwise client-side slicing)
      // queryParams.append('page', currentPage); // Assuming server handles 1-based page number
      // queryParams.append('limit', leadsPerPage);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Use empty string as fallback
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
        console.error(
          "Failed to fetch leads response:",
          response.status,
          errorText
        );
        throw new Error(
          `Failed to fetch leads: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Assuming the API returns an array of leads directly or an object with a 'leads' array and 'totalItems'/'totalPages'
      // Adjust based on your actual API response structure
      const leadsData = Array.isArray(data) ? data : data.leads || [];
      const totalItemsData = Array.isArray(data)
        ? data.length
        : data.totalItems || leadsData.length; // Estimate total if API doesn't provide it

      setLeads(leadsData);
      setTotalLeads(totalItemsData);
      // Client-side pagination: totalPages is based on the total number of items fetched
      setTotalPages(Math.ceil(totalItemsData / leadsPerPage));

      // Extract unique course names and locations for filters from *all* fetched data (before pagination slice)
      const courses = [
        ...new Set(leadsData.map((lead) => lead.coursename).filter(Boolean)),
      ].sort();
      const locations = [
        ...new Set(leadsData.map((lead) => lead.location).filter(Boolean)),
      ].sort();

      setCourseOptions(courses);
      setLocationOptions(locations);

      // Reset selected leads and selectAll when fetching new data
      setSelectedLeads([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.message);
      setLeads([]); // Clear leads on error
      setTotalLeads(0); // Reset total leads on error
      setTotalPages(1); // Reset total pages on error
      setCourseOptions([]); // Clear options on error
      setLocationOptions([]); // Clear options on error
    } finally {
      setLoading(false); // Set loading false after fetch attempt
    }
  };

  // Basic form validation for modal
  const validateModalForm = (formData, modalType) => {
    const errors = {};
    // Basic validation rules apply to create and edit forms
    if (modalType !== "assign") {
      if (!formData.name.trim()) errors.name = "Name is required";
      if (!formData.email.trim()) errors.email = "Email is required"; // Assume email is required based on previous code
      if (!formData.contact.trim())
        errors.contact = "Contact number is required";
      if (!formData.status) errors.status = "Status is required";

      // Email format validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email.trim() && !emailPattern.test(formData.email.trim())) {
        errors.email = "Invalid email address";
      }

      // Simple contact number validation (basic check for digits and minimum length)
      const contactPattern = /^\d+$/; // Basic digit check
      if (
        formData.contact.trim() &&
        !contactPattern.test(formData.contact.trim())
      ) {
        errors.contact = "Contact number must contain only digits";
      } else if (
        formData.contact.trim() &&
        formData.contact.trim().length < 5
      ) {
        // Minimum length check (adjust as needed)
        errors.contact = "Contact number is too short";
      }

      // Country Code validation (if applicable) - add logic here if countryCode is required or needs format validation
      // Example: If countryCode is required when contact is provided
      if (formData.contact.trim() && !formData.countryCode.trim()) {
        errors.countryCode = "Country code is required for contact number";
      } else if (
        formData.countryCode.trim() &&
        !/^\+?\d+$/.test(formData.countryCode.trim())
      ) {
        errors.countryCode = "Invalid country code format (e.g., +91)";
      }
    }
    // No specific validation needed for assign modal beyond assignedTo existence (handled by backend/UI dropdown)

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
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined, // Or null, depending on how you check for errors
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
    // fetchLeads is triggered by the filters state change in the useEffect
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
    // fetchLeads is triggered by the filters state change in the useEffect
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      contact: "",
      countryCode: "", // Add default if needed
      coursename: "",
      location: "",
      status: "New",
      notes: "",
      assignedTo: "",
    });
    setFormErrors({}); // Clear form errors
    setSelectedLead(null); // Ensure selectedLead is null for create
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
    if (modalType !== "assign") {
      const errors = validateModalForm(formData, modalType);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        console.warn("Modal form validation failed:", errors);
        // Optionally, focus on the first field with an error
        const firstErrorField = Object.keys(errors)[0];
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.focus();
        }
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
      // If successful, closeModal is called inside create/update/assignLead
    } catch (err) {
      console.error("Error in form submission:", err);
      // Set page-level error to display above the table/modal
      setError(
        err.message || "An unexpected error occurred during form submission."
      );
      // The modal remains open on error so the user can correct issues
    } finally {
      setSubmitting(false);
      // Error is handled by the page-level error state, modal might still show.
      // If you want the modal to close on success but stay open on error,
      // the closeModal call needs to be conditional or moved inside create/update/assignLead on success.
    }
  };

  const createLead = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Use empty string as fallback
      if (!apiUrl) throw new Error("API URL is not configured.");

      const response = await fetchWithAuth(`${apiUrl}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // Ensure assignedTo is null if empty string
          assignedTo: formData.assignedTo || null,
        }),
      });

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Use empty string as fallback
      if (!apiUrl) throw new Error("API URL is not configured.");

      const leadData = { ...formData };

      // Convert empty strings to null for certain fields expected by backend
      // Ensure assignedTo is null if empty string
      leadData.assignedTo = leadData.assignedTo || null;

      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/${selectedLead._id}`,
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
        console.error(
          "Error response during lead update:",
          response.status,
          errorData
        );
        // If backend returns validation errors, set formErrors
        if (response.status === 400 && errorData.errors) {
          setFormErrors(errorData.errors);
          throw new Error("Validation failed"); // Throw a generic error to be caught by handleSubmit
        }
        throw new Error(
          errorData.message || `Failed to update lead: ${response.statusText}`
        );
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
      if (!selectedLead?._id)
        throw new Error("No lead selected for assignment.");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Use empty string as fallback
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Use empty string as fallback
      if (!apiUrl) throw new Error("API URL is not configured.");

      const response = await fetchWithAuth(`${apiUrl}/api/leads/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete lead");
      }

      // Success
      await fetchLeads(); // Refresh the list (will also turn off loading)
      // No need to turn off loading here as fetchLeads will do it in its finally block
    } catch (err) {
      console.error("Error deleting lead:", err);
      setError(err.message || "Error deleting lead. Please try again.");
      setLoading(false); // Turn off loading on error if fetchLeads was not called
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

  // Handle select all leads on the currently *displayed* page
  const handleSelectAll = () => {
    if (selectedLeads.length === displayedLeads.length && selectAll) {
      // If all currently displayed are selected and selectAll is true, deselect all
      setSelectedLeads([]);
      setSelectAll(false);
    } else {
      // Otherwise, select all currently displayed leads
      setSelectedLeads(displayedLeads.map((lead) => lead._id));
      setSelectAll(true);
    }
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
      setBulkFormData({ status: "", assignedTo: "" }); // Not needed for delete, but reset anyway
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
      } else {
        // status or assign
        await bulkUpdateLeads();
      }
      // If successful, bulkActionModalOpen is set to false inside bulkDeleteLeads/bulkUpdateLeads
    } catch (err) {
      console.error("Error in bulk action:", err);
      setError(
        err.message || "An unexpected error occurred during bulk action."
      );
      // Modal stays open on error
    } finally {
      setSubmitting(false);
      // Modal is closed on success or manually closed on error by user
      // setBulkActionModalOpen(false); // Moved inside success block
    }
  };

  // Bulk update leads
  const bulkUpdateLeads = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Use empty string as fallback
      if (!apiUrl) throw new Error("API URL is not configured.");

      const updateData = {};

      if (bulkActionType === "status") {
        if (!bulkFormData.status) {
          // Basic validation for status
          setFormErrors({ status: "Please select a status." });
          throw new Error("Status is required for bulk update.");
        }
        updateData.status = bulkFormData.status;
      } else if (bulkActionType === "assign") {
        // assignedTo can be null/empty for unassign, so no validation needed here
        updateData.assignedTo = bulkFormData.assignedTo || null; // Use null if empty string
      } else {
        throw new Error("Invalid bulk update action type.");
      }

      if (selectedLeads.length === 0) {
        console.warn("No leads selected for bulk update. Skipping.");
        setBulkActionModalOpen(false); // Close modal if nothing was selected
        return; // Do nothing if no leads are selected
      }

      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/bulk-update`, // Assuming this is your bulk update endpoint
        {
          method: "PUT", // Or POST, depending on your API design
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
      setBulkActionModalOpen(false); // Close modal on success
    } catch (err) {
      console.error("Error in bulk update:", err);
      setError(err.message);
      throw err; // Re-throw to be caught by handleBulkAction
    }
  };

  // Bulk delete leads
  const bulkDeleteLeads = async () => {
    if (selectedLeads.length === 0) {
      console.warn("No leads selected for bulk delete. Skipping.");
      setBulkActionModalOpen(false); // Close modal if nothing was selected
      return; // Do nothing if no leads are selected
    }

    // Confirmation is done before opening the modal now

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Use empty string as fallback
      if (!apiUrl) throw new Error("API URL is not configured.");

      const response = await fetchWithAuth(
        `${apiUrl}/api/leads/bulk-delete`, // Assuming this is your bulk delete endpoint
        {
          method: "POST", // Use POST for body with DELETE semantics, or DELETE if API supports body with DELETE
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
      setBulkActionModalOpen(false); // Close modal on success
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
      "Contact", // Keep as "Contact" if country code is separate
      "Country Code", // Add country code as a separate column if it's a distinct field
      "Course Name",
      "Email ID",
      "Location",
      "Status",
      "Contacted Score", // Assuming these fields exist in your lead objects
      "Comments", // Assuming these fields exist in your lead objects
      "Assigned To",
      "Creation Date & Time",
      "Last Updated",
    ];

    // Map leads data including all fields
    const csvRows = leads.map((lead, index) => {
      // Format dates nicely for better readability in UTC
      const formatCsvDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
          timeZone: "UTC", // Specify UTC
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      // Quote strings to handle commas and quotes in fields properly
      const quoteValue = (value) => {
        if (value === null || value === undefined) return '""';
        // Convert boolean to string, handle objects
        const strValue =
          typeof value === "object" ? JSON.stringify(value) : String(value);
        // Replace double quotes with two double quotes, wrap in double quotes
        return `"${strValue.replace(/"/g, '""')}"`;
      };

      // Prepare row with all fields, using quoteValue for each potentially problematic field
      return [
        index + 1, // Sr. No.
        quoteValue(lead.name),
        quoteValue(lead.contact), // Use separate contact field
        quoteValue(lead.countryCode), // Use separate countryCode field
        quoteValue(lead.coursename),
        quoteValue(lead.email),
        quoteValue(lead.location),
        quoteValue(lead.status || "New"),
        quoteValue(lead.contactedScore || ""), // Use actual field names from your lead object
        quoteValue(lead.contactedComment || ""), // Use actual field names from your lead object
        quoteValue(lead.assignedTo?.username || "Unassigned"), // Safely access username
        quoteValue(formatCsvDate(lead.createdAt)), // Formatted date
        quoteValue(formatCsvDate(lead.updatedAt)), // Formatted date
      ];
    });

    // Create CSV content with headers and rows
    const csvContent = [
      headers.map((header) => `"${header}"`).join(","), // Quote headers too
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    // Generate filename with date
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD format

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
  // With client-side pagination, totalPages should be based on the *total fetched leads*, not just the current page's length.
  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      // Deselect all leads when changing pages
      setSelectedLeads([]);
      setSelectAll(false);
    }
  };

  // Calculate pagination values for client-side rendering
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage; // Calculate end index
  const displayedLeads = leads.slice(startIndex, endIndex);

  // Get the color code for a given admin ID
  const getAdminColor = (adminId) => {
    const admin = admins.find((a) => a._id === adminId);
    return admin?.color || null;
  };

  // Get the admin object for a given admin ID
  const getAdminById = (adminId) => {
    return admins.find((admin) => admin._id === adminId) || null;
  };

  // If still loading initial data and user role is not yet determined/checked
  if (loading && userRole === null) {
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
          Loading authentication...
        </p>
      </div>
    );
  }

  // Use the imported Sidebar and AccessControl components
  return (
    // Main container flex layout
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar is always present */}
      <Sidebar activePage="leads" /> {/* Pass activePage prop */}
      {/* Main content area - takes remaining space */}
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 overflow-auto">
        {/* AccessControl handles the overall access to this page's content */}
        {/* Content only visible to users with 'leads' access */}
        <AccessControl section="leads">
          {" "}
          {/* Wrap content with AccessControl */}
          {/* Page content container with padding and max-width */}
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Lead Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage, filter, and assign leads to admin users.
              </p>
            </div>
          </div>
          {/* Page-level Error Message Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md relative mb-4 flex items-center">
              <FaTimes className="mr-2 text-xl" />
              {error}
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6 ms-4">
            <button
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={openCreateModal}
              disabled={loading || submitting}
            >
              <FaUsers className="mr-2" /> Add New Lead
            </button>
            <button
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={fetchLeads} // This will refetch based on current filters and reset to page 1
              disabled={loading || submitting}
            >
              {loading && !submitting ? ( // Show spinner only for initial/filter fetch, not during modal submit
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSync className="mr-2" />
              )}
              Refresh Data
            </button>
            <button
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={downloadCSV}
              disabled={leads.length === 0}
            >
              <FaDownload className="mr-2" /> Export CSV ({leads.length} leads)
            </button>
          </div>
          {/* Filters Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FaFilter className="mr-3 text-blue-600" /> Filter Leads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="form-group">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="status-filter"
                >
                  Status
                </label>
                <select
                  id="status-filter"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || submitting}
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Enrolled">Enrolled</option>
                </select>
              </div>

              {/* Assigned To Filter */}
              <div className="form-group">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="assignedTo-filter"
                >
                  Assigned To
                </label>
                <select
                  id="assignedTo-filter"
                  name="assignedTo"
                  value={filters.assignedTo}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || submitting}
                >
                  <option value="">All</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="assigned">Any Admin</option>{" "}
                  {/* Option to filter for any assigned lead */}
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.username} ({admin.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Filter */}
              <div className="form-group">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="coursename-filter"
                >
                  Course
                </label>
                <select
                  id="coursename-filter"
                  name="coursename"
                  value={filters.coursename}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Location Filter */}
              <div className="form-group">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="location-filter"
                >
                  Location
                </label>
                <select
                  id="location-filter"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Start Date Filter */}
              <div className="form-group">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="startDate-filter"
                >
                  <FaCalendarAlt className="inline mr-1 text-gray-500" /> Start
                  Date
                </label>
                <input
                  id="startDate-filter"
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || submitting}
                />
              </div>

              {/* End Date Filter */}
              <div className="form-group">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="endDate-filter"
                >
                  <FaCalendarAlt className="inline mr-1 text-gray-500" /> End
                  Date
                </label>
                <input
                  id="endDate-filter"
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || submitting}
                />
              </div>

              {/* Search Filter */}
              <div className="form-group col-span-full sm:col-span-2 lg:col-span-1 xl:col-span-2">
                {" "}
                {/* Span across columns responsively */}
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="search-filter"
                >
                  <FaSearch className="inline mr-1 text-gray-500" /> Search
                </label>
                <input
                  id="search-filter"
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Name, Email, or Phone"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || submitting}
                />
              </div>

              {/* Filter Actions */}
              <div className="form-group col-span-full sm:col-span-2 lg:col-span-3 xl:col-span-2 flex justify-end gap-3 items-end">
                {" "}
                {/* Align actions to the right, spanning columns */}
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={resetFilters}
                  disabled={loading || submitting}
                >
                  Reset
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={applyFilters}
                  disabled={loading || submitting}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
          {/* Bulk Actions Bar */}
          {selectedLeads.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md mb-4 gap-3">
              <span className="text-sm font-medium">
                {selectedLeads.length}{" "}
                {selectedLeads.length === 1 ? "lead" : "leads"} selected on this
                page
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {" "}
                {/* Allow buttons to wrap */}
                <button
                  onClick={() => openBulkActionModal("status")}
                  className="px-4 py-2 text-blue-800 border border-blue-300 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || loading}
                >
                  Change Status
                </button>
                <button
                  onClick={() => openBulkActionModal("assign")}
                  className="px-4 py-2 text-blue-800 border border-blue-300 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || loading}
                >
                  Assign
                </button>
                <button
                  onClick={() => openBulkActionModal("delete")}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || loading}
                >
                  <FaTrash className="mr-2" /> Delete
                </button>
              </div>
            </div>
          )}
          {/* Leads Table Card */}
          {loading && !leads.length ? ( // Show full-page loader only if no leads are loaded yet and table is empty
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
              </div>
              <p className="mt-4 text-gray-600">Loading leads...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Mobile View (Cards) */}
              <div className="lg:hidden divide-y divide-gray-200">
                {displayedLeads.length > 0 ? (
                  displayedLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className={`p-6 space-y-3 transition-colors duration-150 ${selectedLeads.includes(lead._id) ? "bg-blue-50" : "bg-white"}`}
                      style={
                        lead.assignedTo?.color
                          ? {
                              // Apply background color with transparency
                              backgroundColor: selectedLeads.includes(lead._id)
                                ? `${lead.assignedTo.color}60` // Darker if selected
                                : `${lead.assignedTo.color}30`, // Lighter normally
                            }
                          : {}
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900 text-lg truncate mr-4">
                          {lead.name}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            lead.status === "New"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : lead.status === "Contacted"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : lead.status === "Converted"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : lead.status === "Rejected"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : lead.status === "Not Interested"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : lead.status === "In Progress"
                                        ? "bg-orange-100 text-orange-800 border-orange-200"
                                        : lead.status === "Enrolled"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-700">
                        <span className="font-medium text-gray-500">
                          Contact:
                        </span>{" "}
                        {lead.countryCode}
                        {lead.contact}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium text-gray-500">
                          Email:
                        </span>{" "}
                        {lead.email}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium text-gray-500">
                          Course:
                        </span>{" "}
                        {lead.coursename || "—"}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium text-gray-500">
                          Location:
                        </span>{" "}
                        {lead.location || "—"}
                      </div>
                      <div className="text-sm text-gray-700 flex items-center">
                        <span className="font-medium text-gray-500 mr-2">
                          Assigned To:
                        </span>
                        {lead.assignedTo ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              lead.assignedTo.role === "SuperAdmin"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : lead.assignedTo.role === "Admin"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : lead.assignedTo.role === "ViewMode"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200" // EditMode
                            }`}
                            style={
                              lead.assignedTo.color
                                ? {
                                    backgroundColor: lead.assignedTo.color,
                                    color: "white",
                                  }
                                : {}
                            } // Apply admin color if available
                          >
                            {lead.assignedTo.username}
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 border border-gray-200 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium text-gray-500">
                          Created:
                        </span>{" "}
                        {formatDate(lead.createdAt)}
                      </div>
                      {/* Add Last Updated if needed */}
                      {/* <div className="text-sm text-gray-700">
                                <span className="font-medium text-gray-500">Last Updated:</span> {formatDate(lead.updatedAt)}
                            </div> */}

                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        {/* Checkbox */}
                        <div
                          className="flex items-center justify-center cursor-pointer text-xl text-blue-600"
                          onClick={() => handleSelectLead(lead._id)}
                          aria-label={`Select lead ${lead.name}`}
                        >
                          {selectedLeads.includes(lead._id) ? (
                            <FaCheckSquare />
                          ) : (
                            <FaSquare />
                          )}
                        </div>
                        {/* Actions */}
                        <button
                          onClick={() => openEditModal(lead)}
                          className="p-2 rounded-md text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit Lead"
                          aria-label={`Edit lead ${lead.name}`}
                          disabled={submitting}
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => openAssignModal(lead)}
                          className="p-2 rounded-md text-purple-600 hover:bg-purple-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Assign Lead"
                          aria-label={`Assign lead ${lead.name}`}
                          disabled={submitting}
                        >
                          <FaUserEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => deleteLead(lead._id)}
                          className="p-2 rounded-md text-red-600 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Lead"
                          aria-label={`Delete lead ${lead.name}`}
                          disabled={submitting}
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-600">
                    {error
                      ? `Error loading leads: ${error}`
                      : Object.values(filters).some((value) => value !== "")
                        ? "No leads found matching the filter criteria. Try adjusting your filters."
                        : "No leads found."}
                  </div>
                )}
              </div>

              {/* Desktop View (Table) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                        {" "}
                        {/* Fixed width */}
                        <div
                          className="flex items-center justify-center cursor-pointer"
                          onClick={handleSelectAll}
                          aria-label="Select all leads on page"
                        >
                          {selectedLeads.length === displayedLeads.length &&
                          selectAll ? (
                            <FaCheckSquare className="text-blue-600 text-xl" />
                          ) : (
                            <FaSquare className="text-blue-600 text-xl" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      {/* Add Last Updated header if needed */}
                      {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th> */}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                        Actions
                      </th>{" "}
                      {/* Fixed width */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedLeads.length > 0 ? (
                      displayedLeads.map((lead) => {
                        const assignedAdmin = getAdminById(
                          lead.assignedTo?._id
                        );
                        const rowBackgroundColor = selectedLeads.includes(
                          lead._id
                        )
                          ? "bg-blue-50" // Background for selected row
                          : assignedAdmin?.color
                            ? `${assignedAdmin.color}10`
                            : ""; // Light tint of admin color if assigned, otherwise empty

                        // Add transition for background color change
                        const rowStyle = {
                          backgroundColor: rowBackgroundColor,
                          transition: "background-color 0.3s ease",
                        };

                        return (
                          <tr
                            key={lead._id}
                            className="hover:bg-gray-100"
                            style={rowStyle}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-center w-12">
                              {" "}
                              {/* Fixed width */}
                              <div
                                className="flex items-center justify-center cursor-pointer text-xl text-blue-600"
                                onClick={() => handleSelectLead(lead._id)}
                                aria-label={`Select lead ${lead.name}`}
                              >
                                {selectedLeads.includes(lead._id) ? (
                                  <FaCheckSquare />
                                ) : (
                                  <FaSquare />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {lead.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {lead.countryCode}
                              {lead.contact}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {lead.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {lead.coursename || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {lead.location || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                  lead.status === "New"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : lead.status === "Contacted"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : lead.status === "Converted"
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : lead.status === "Rejected"
                                          ? "bg-red-100 text-red-800 border-red-200"
                                          : lead.status === "Not Interested"
                                            ? "bg-red-100 text-red-800 border-red-200"
                                            : lead.status === "In Progress"
                                              ? "bg-orange-100 text-orange-800 border-orange-200"
                                              : lead.status === "Enrolled"
                                                ? "bg-green-100 text-green-800 border-green-200"
                                                : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {assignedAdmin ? (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border text-white ${
                                    assignedAdmin.role === "SuperAdmin"
                                      ? "bg-purple-600 border-purple-700"
                                      : assignedAdmin.role === "Admin"
                                        ? "bg-blue-600 border-blue-700"
                                        : assignedAdmin.role === "ViewMode"
                                          ? "bg-green-600 border-green-700"
                                          : "bg-yellow-600 border-yellow-700" // EditMode
                                  }`}
                                  style={
                                    assignedAdmin.color
                                      ? { backgroundColor: assignedAdmin.color }
                                      : {}
                                  } // Apply admin color if available
                                >
                                  {assignedAdmin.username}
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-700 border border-gray-200 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {formatDate(lead.createdAt)}
                            </td>
                            {/* Add Last Updated data if needed */}
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(lead.updatedAt)}</td> */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-32">
                              {" "}
                              {/* Fixed width */}
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => openEditModal(lead)}
                                  className="p-2 rounded-md text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit"
                                  disabled={submitting}
                                  aria-label={`Edit lead ${lead.name}`}
                                >
                                  <FaEdit className="text-lg" />
                                </button>
                                <button
                                  onClick={() => openAssignModal(lead)}
                                  className="p-2 rounded-md text-purple-600 hover:bg-purple-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Assign"
                                  disabled={submitting}
                                  aria-label={`Assign lead ${lead.name}`}
                                >
                                  <FaUserEdit className="text-lg" />
                                </button>
                                <button
                                  onClick={() => deleteLead(lead._id)}
                                  className="p-2 rounded-md text-red-600 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete"
                                  disabled={submitting}
                                  aria-label={`Delete lead ${lead.name}`}
                                >
                                  <FaTrash className="text-lg" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          className="px-6 py-4 text-center text-gray-600"
                        >
                          {error
                            ? `Error loading leads: ${error}`
                            : Object.values(filters).some(
                                  (value) => value !== "" && value !== null
                                ) // Check if any filter is actually set
                              ? "No leads found matching the filter criteria. Try adjusting your filters."
                              : "No leads found."}
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
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading || submitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading || submitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
          {/* Create/Edit/Assign Lead Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {modalType === "create"
                      ? "Add New Lead"
                      : modalType === "edit"
                        ? "Edit Lead"
                        : "Assign Lead"}
                  </h3>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={closeModal}
                    disabled={submitting}
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit}>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {" "}
                    {/* Responsive grid for form fields */}
                    {/* Display form-specific errors if any */}
                    {Object.keys(formErrors).length > 0 &&
                      Object.values(formErrors).some((e) => e) && ( // Check if there are errors and at least one is not undefined/null
                        <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md relative flex items-center text-sm">
                          <FaTimes className="mr-2 text-lg" /> Please fix the
                          errors below.
                        </div>
                      )}
                    {/* Display page-level error if it happened during form submission (less common in modal) */}
                    {error && (
                      <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md relative flex items-center text-sm">
                        <FaTimes className="mr-2 text-lg" /> {error}
                      </div>
                    )}
                    {modalType !== "assign" && (
                      <>
                        {/* Name field */}
                        <div className="md:col-span-2">
                          {" "}
                          {/* Span full width */}
                          <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="name"
                          >
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                            required
                            disabled={submitting}
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.name}
                            </p>
                          )}
                        </div>

                        {/* Email field */}
                        <div className="md:col-span-2">
                          {" "}
                          {/* Span full width */}
                          <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="email"
                          >
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                            required
                            disabled={submitting}
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Contact Number field */}
                        <div className="md:col-span-2">
                          {" "}
                          {/* Span full width */}
                          <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="contact"
                          >
                            Contact Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            {/* Country Code Input */}
                            <input
                              type="text"
                              id="countryCode"
                              name="countryCode"
                              value={formData.countryCode}
                              onChange={handleInputChange}
                              className={`block w-20 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.countryCode ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                              placeholder="+91"
                              disabled={submitting}
                            />
                            <input
                              type="text"
                              id="contact"
                              name="contact"
                              value={formData.contact}
                              onChange={handleInputChange}
                              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.contact ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                              required
                              disabled={submitting}
                            />
                          </div>
                          {formErrors.countryCode && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.countryCode}
                            </p>
                          )}
                          {formErrors.contact && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.contact}
                            </p>
                          )}
                        </div>

                        {/* Course field */}
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="coursename"
                          >
                            Course
                          </label>
                          <input
                            type="text"
                            id="coursename"
                            name="coursename"
                            value={formData.coursename}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.coursename ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                            disabled={submitting}
                          />
                          {formErrors.coursename && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.coursename}
                            </p>
                          )}
                        </div>

                        {/* Location field */}
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="location"
                          >
                            Location
                          </label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.location ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                            disabled={submitting}
                          />
                          {formErrors.location && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.location}
                            </p>
                          )}
                        </div>

                        {/* Status field */}
                        <div className="md:col-span-2">
                          {" "}
                          {/* Span full width */}
                          <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="status"
                          >
                            Status <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.status ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                            required
                            disabled={submitting}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Converted">Converted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Not Interested">
                              Not Interested
                            </option>
                            <option value="In Progress">In Progress</option>
                            <option value="Enrolled">Enrolled</option>
                          </select>
                          {formErrors.status && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.status}
                            </p>
                          )}
                        </div>

                        {/* Notes field */}
                        <div className="md:col-span-2">
                          {" "}
                          {/* Span full width */}
                          <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="notes"
                          >
                            Notes
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.notes ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                            rows="3"
                            disabled={submitting}
                          ></textarea>
                          {formErrors.notes && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.notes}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    {modalType === "assign" && (
                      <div className="md:col-span-2">
                        {" "}
                        {/* Span full width */}
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="assignedTo"
                        >
                          Assign To
                        </label>
                        <select
                          id="assignedTo"
                          name="assignedTo"
                          value={formData.assignedTo}
                          onChange={handleInputChange}
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.assignedTo ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                          disabled={submitting}
                        >
                          <option value="">Unassigned</option>
                          {admins.map(
                            (admin) =>
                              // Only show Admins, EditMode, ViewMode roles for assignment, not SuperAdmins
                              // Adjust this filter based on your assignment policy
                              admin.role !== "SuperAdmin" && (
                                <option key={admin._id} value={admin._id}>
                                  {admin.username} ({admin.role})
                                </option>
                              )
                          )}
                        </select>
                        {formErrors.assignedTo && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.assignedTo}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`inline-flex items-center px-4 py-2 font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm
                          ${
                            modalType === "delete" // Delete button handled by separate modal
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }
                        `}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          {modalType === "create"
                            ? "Creating..."
                            : modalType === "edit"
                              ? "Updating..."
                              : "Assigning..."}
                        </>
                      ) : (
                        <>
                          {modalType === "create"
                            ? "Create Lead"
                            : modalType === "edit"
                              ? "Update Lead"
                              : "Assign Lead"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Bulk Action Confirmation/Form Modal */}
          {bulkActionModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {bulkActionType === "status"
                      ? "Bulk Update Status"
                      : bulkActionType === "assign"
                        ? "Bulk Assign Leads"
                        : "Bulk Delete Leads"}
                  </h3>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setBulkActionModalOpen(false)}
                    disabled={submitting}
                    aria-label="Close bulk action modal"
                  >
                    ×
                  </button>
                </div>
                {/* Modal Content */}
                <form onSubmit={handleBulkAction}>
                  <div className="p-6">
                    {Object.keys(formErrors).length > 0 &&
                      Object.values(formErrors).some((e) => e) && ( // Display form-specific errors if any
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md relative flex items-center text-sm mb-4">
                          <FaTimes className="mr-2 text-lg" /> Please fix the
                          errors below.
                        </div>
                      )}
                    {/* Display page-level error if it happened during bulk action */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md relative flex items-center text-sm mb-4">
                        <FaTimes className="mr-2 text-lg" /> {error}
                      </div>
                    )}

                    {bulkActionType === "delete" ? (
                      <p className="text-gray-700 text-center py-4">
                        Are you sure you want to delete {selectedLeads.length}{" "}
                        leads? This action cannot be undone.
                      </p>
                    ) : bulkActionType === "status" ? (
                      <div className="form-group">
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="bulk-status"
                        >
                          New Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="bulk-status"
                          value={bulkFormData.status}
                          onChange={(e) =>
                            setBulkFormData({
                              ...bulkFormData,
                              status: e.target.value,
                            })
                          }
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.status ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                          required
                          disabled={submitting}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Not Interested">Not Interested</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Enrolled">Enrolled</option>
                        </select>
                        {formErrors.status && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.status}
                          </p>
                        )}
                      </div>
                    ) : (
                      // bulkActionType === "assign"
                      <div className="form-group">
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="bulk-assignedTo"
                        >
                          Assign To
                        </label>
                        <select
                          id="bulk-assignedTo"
                          value={bulkFormData.assignedTo}
                          onChange={(e) =>
                            setBulkFormData({
                              ...bulkFormData,
                              assignedTo: e.target.value,
                            })
                          }
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.assignedTo ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                          disabled={submitting}
                        >
                          <option value="">Unassigned</option>
                          {admins.map(
                            (admin) =>
                              // Only show Admins, EditMode, ViewMode roles for assignment, not SuperAdmins
                              admin.role !== "SuperAdmin" && (
                                <option key={admin._id} value={admin._id}>
                                  {admin.username} ({admin.role})
                                </option>
                              )
                          )}
                        </select>
                        {formErrors.assignedTo && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.assignedTo}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setBulkActionModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`inline-flex items-center px-4 py-2 font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm
                          ${bulkActionType === "delete" ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}
                        `}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {bulkActionType === "status"
                            ? "Update Status"
                            : bulkActionType === "assign"
                              ? "Assign Leads"
                              : "Delete Leads"}
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
