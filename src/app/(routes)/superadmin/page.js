// superadmin/layout.js
"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from "@/components/superadmin/Sidebar";
import AccessControl from "@/components/superadmin/AccessControl"; // AccessControl will wrap page content
import InactivityWarningModal from "@/components/superadmin/InactivityWarningModal"; // Import the modal
import { FaSignOutAlt } from "react-icons/fa"; // Import for logout button if added to header

// --- Configuration ---
// You might fetch these values from settings API in a real app
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_DURATION = 60 * 1000; // 60 seconds

const SuperAdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  // --- Inactivity Timer States and Refs ---
  const [showWarning, setShowWarning] = useState(false);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  // --- Activity Tracking States ---
  const [currentPageStartTime, setCurrentPageStartTime] = useState(Date.now());
  const [currentPagePath, setCurrentPagePath] = useState(pathname);
  const [userRole, setUserRole] = useState(null); // State to store user role for AccessControl

  // --- Authentication Check (Primary Gatekeeper for /superadmin) ---
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");
    setUserRole(role); // Set user role state for AccessControl

    if (!token) {
      // If not authenticated at all, redirect to login
      router.push("/AdminLogin");
      return; // Stop further execution
    }

    // If authenticated but role is NOT Admin or SuperAdmin, redirect to dashboard
    // This handles roles like ViewMode/EditMode who shouldn't access *most* of SuperAdmin section
    // AccessControl will then provide granular checks within pages they *can* access.
     if (role !== "SuperAdmin" && role !== "Admin") {
         router.push("/dashboard"); // Redirect roles that shouldn't be in superadmin section
         return; // Stop further execution
     }

    // If authenticated and has a valid admin role, proceed.
    // Initial fetch of admin data or other layout-specific setup could go here.

  }, [router]); // Depend on router for the initial check


  // --- Activity Logging Helper ---
  const logActivityEvent = async (action, page, details) => {
    const adminId = localStorage.getItem("adminId");
    const adminToken = localStorage.getItem("adminToken");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!adminId || !adminToken || !apiUrl) {
      // Cannot log activity without user info or API URL
      console.warn("Activity logging skipped: Missing user info or API URL.");
      return;
    }

    try {
      // Use standard fetch here as fetchWithAuth might cause circular dependency if used inside auth logic
      const response = await fetch(`${apiUrl}/api/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`, // Manually add auth header
        },
        body: JSON.stringify({ adminId, action, page, details }),
      });

      if (!response.ok) {
         console.error("Failed to log activity:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Error sending activity log:", error);
    }
  };


  // --- Inactivity Timer Logic ---
  const resetInactivityTimer = () => {
    // console.log("Activity detected, resetting timer.");
    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);
    setShowWarning(false); // Hide warning if it's showing

    inactivityTimerRef.current = setTimeout(() => {
      // console.log("Inactivity timer expired, showing warning.");
      setShowWarning(true); // Show warning after inactivity
      warningTimerRef.current = setTimeout(() => {
        // console.log("Warning timer expired, logging out.");
        handleLogout(); // Log out after warning expires
      }, WARNING_DURATION);
    }, INACTIVITY_TIMEOUT);
  };

  // --- Logout Function ---
  // Moved here as the layout controls session state
  const handleLogout = () => {
    // Log the logout activity BEFORE clearing storage
    logActivityEvent('LOGOUT', pathname, 'User logged out due to inactivity');

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminId");
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/AdminLogin");
  };


  // --- Effect for Initial Setup and Activity Detection ---
  // This effect runs on mount and when pathname changes
  useEffect(() => {
    // Start the initial timer on mount or route change within this layout
    resetInactivityTimer();

    // Log the login activity on the initial page load within this layout
    // Only log LOGIN once per session, not on every page navigation.
    // A simple check if adminId exists helps prevent duplicate LOGIN logs if effect runs multiple times initially.
    if (localStorage.getItem("adminId") && pathname === '/superadmin/dashboard') { // Log LOGIN specifically on the dashboard entry page
        logActivityEvent('LOGIN', pathname, 'User logged in');
    }


    // Add event listeners to detect user activity across the document
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
    activityEvents.forEach(event =>
      document.addEventListener(event, resetInactivityTimer)
    );

    // Cleanup timers and event listeners on unmount
    return () => {
      // console.log("Cleaning up timers and event listeners.");
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
      activityEvents.forEach(event =>
        document.removeEventListener(event, resetInactivityTimer)
      );

       // Log activity duration for the page being left (if any was tracked)
       // This relies on currentPagePath and currentPageStartTime correctly tracking the *previous* page
       // before the path changed and the state was updated.
       if (currentPagePath) {
           const timeSpent = Date.now() - currentPageStartTime;
           logActivityEvent('PAGE_VIEW_END', currentPagePath, `Duration: ${timeSpent}ms - Unmount`);
       }
    };
    // Empty dependency array to run only on mount and unmount, for setting up listeners once.
    // Pathname dependency for resetInactivityTimer is handled implicitly by the event listeners themselves,
    // which get added to the document and persist across route changes within this layout.
    // Re-adding [pathname] here might cause issues with the timeSpent calculation if it resets the start time prematurely.
    // Let's remove pathname from dependencies for this setup effect and handle page view logging in the separate effect.
  }, []); // <-- Empty dependency array for event listener setup


   // --- Effect to Track Page Views and Time Spent (Separate from Timer Setup) ---
   useEffect(() => {
        // This effect runs when pathname changes (and on initial mount).
        // It logs the END of the PREVIOUS page view and the START of the NEW page view.
        // We only log if the path has actually changed since the last time we tracked it.
        if (pathname && currentPagePath && pathname !== currentPagePath) { // Ensure paths are defined and different
             const timeSpent = Date.now() - currentPageStartTime;
             // Log end of previous page view
             logActivityEvent('PAGE_VIEW_END', currentPagePath, `Duration: ${timeSpent}ms - Navigated`);
             // Log start of current page view
             logActivityEvent('PAGE_VIEW_START', pathname, 'Page visited');

             // Update state for the new page
             setCurrentPagePath(pathname);
             setCurrentPageStartTime(Date.now());
        } else if (pathname && !currentPagePath) {
            // This handles the very first page load within this layout
            setCurrentPagePath(pathname);
            setCurrentPageStartTime(Date.now());
             // Initial LOGIN event is already logged in the other effect,
             // or you could log PAGE_VIEW_START here for the very first page.
             // Let's stick to logging LOGIN once in the other effect for simplicity.
        }

    }, [pathname, currentPagePath, currentPageStartTime]); // Depend on path and time state to detect page changes


  // If userRole is still null, it means the auth check hasn't completed yet.
  // Show a minimal loading state or nothing while authentication is verified.
  // The initial check in the useEffect above handles the actual redirect.
   if (userRole === null) {
     // This minimal return prevents rendering the sidebar/content before auth check
     // The useEffect will handle redirection or setting userRole
     return null; // Or a simple full-screen loading div
   }


  // Determine activePage for the Sidebar based on the current route
  const activePage = pathname.split('/').pop() || 'dashboard'; // Default to 'dashboard' if no sub-path


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar is always present */}
      {/* Pass userRole and activePage to Sidebar if it needs them for rendering links */}
      <Sidebar activePage={activePage} userRole={userRole} />

      {/* Main content area - takes remaining space */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 overflow-auto">
        {/*
          AccessControl wraps the children (the actual page component).
          It uses the userRole state (set by the auth check) and the section
          derived from the route to determine if the user has access to the *content*
          of this specific sub-page (e.g., dashboard, users, analytics, etc.).
          Pass the section name dynamically based on the route.
        */}
        <AccessControl section={activePage}>
           {/* children will be the specific page.js component (e.g., superadmin/dashboard/page.js) */}
           {children}
        </AccessControl>
      </main>

      {/* Inactivity Warning Modal */}
      {showWarning && (
        <InactivityWarningModal
          onStayLoggedIn={() => resetInactivityTimer()}
          onLogout={handleLogout}
          warningDuration={WARNING_DURATION}
        />
      )}
    </div>
  );
};

export default SuperAdminLayout;