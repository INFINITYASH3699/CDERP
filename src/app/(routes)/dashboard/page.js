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
} from "react-icons/fa";

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
    }
  }, [router]);

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

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads`
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
        setLeads(data); // <-- CORRECT: Pass the fetched data array
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
        setSelectAll(false);
      } else {
        // Fall back to individual deletion if bulk delete fails
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
          } catch (error) {
            console.error(`Error deleting lead ${id}:`, error.message);
            errorCount++;
          }
        }

        if (successCount > 0) {
          setLeads((prevLeads) =>
            prevLeads.filter((lead) => !selectedLeads.includes(lead._id))
          );
          setSelectedLeads([]);
          setSelectAll(false);
        }
      }

      alert(
        `Successfully deleted ${successCount} leads${errorCount > 0 ? `. Failed to delete ${errorCount} leads.` : ""}`
      );
    } catch (error) {
      console.error("Error in bulk delete:", error.message);
      alert(`Failed to delete leads. Please try again.`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle selection of a single lead
  const handleSelectLead = (id) => {
    setSelectedLeads((prev) => {
      if (prev.includes(id)) {
        return prev.filter((leadId) => leadId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all leads on current page
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads((prev) =>
        prev.filter((id) => !currentLeads.some((lead) => lead._id === id))
      );
    } else {
      const currentPageIds = currentLeads.map((lead) => lead._id);
      setSelectedLeads((prev) => {
        // Add only ids that aren't already in the array
        const newIds = currentPageIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
    setSelectAll(!selectAll);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Updated format for CSV export to include time
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
      "Date & Time",
    ];
    const csvRows = leads.map((lead) => [
      lead.name,
      lead.contact,
      lead.coursename,
      lead.email,
      lead.location,
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

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminId");
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/AdminLogin");
  };

  const goToSuperAdmin = () => {
    const role = localStorage.getItem("adminRole");
    if (role === "SuperAdmin" || role === "Admin") {
      router.push("/superadmin");
    } else {
      alert("You don't have permission to access the Admin Panel");
    }
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
          {/* Only SuperAdmin and Admin users can access the SuperAdmin panel */}
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
          {/* Only show bulk delete button for SuperAdmin, Admin, and EditMode users */}
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
                    <th>Sr. No.</th>
                    <th>Name</th>
                    <th>Mobile Number</th>
                    <th>Course Name</th>
                    <th>Email ID</th>
                    <th>Date & Time</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeads.length > 0 ? (
                    currentLeads.map((lead, index) => (
                      <tr key={lead._id || index}>
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
                              timeZone: "UTC",
                            }
                          )}
                        </td>
                        <td data-label="Location">{lead.location}</td>
                        <td data-label="Actions">
                          {/* Only show delete button for SuperAdmin, Admin, and EditMode users */}
                          {(userRole === "SuperAdmin" || userRole === "Admin" || userRole === "EditMode") && (
                            <button
                              onClick={() => deleteLead(lead._id)}
                              className={styles.deleteButton}
                              disabled={deleteLoading}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className={styles.errorMessage}>
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
    </div>
  );
};

export default Dashboard;
