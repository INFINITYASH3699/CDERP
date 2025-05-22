import { useState, useEffect, useMemo } from "react";
import styles from "@/styles/dashboard/Dashboard.module.css";
import { FaSpinner, FaSave, FaTimes, FaPlusCircle, FaSearch, FaTrash, FaFilter, FaSortAlphaDown } from "react-icons/fa";

const LocationAssignmentModal = ({
  show,
  onClose,
  onSave,
  locations,
  admins,
  existingAssignments = {},
  saving
}) => {
  const [assignments, setAssignments] = useState({});
  const [selectedLocations, setSelectedLocations] = useState({});
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [availableLocations, setAvailableLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  // Mumbai area locations - fixed to remove duplicates
  const mumbaiAreaLocations = [
    "Mumbai", "Bhandup", "Thane", "Babalapur", "Mulund",
    "Karjat", "Bhiwandi", "Dombivali", "Mumbra", "Koperkhairne",
    "Kalawa", "Kalyani", "Aroli", "Kopari", "Byculla",
    "Ghatkopar", "Vasai", "Shahpur", "Ulwe", "TITWALA",
    "Yelwadi", "Dadar", "Parel", "Dombivli", "Vikroli",
    "Kurla", "Ambarnath", "Ghansoli", "NEW PANVEL", "Palghar",
    "Navi Mumbai", "Kalyan"
  ];

  // Get admin details by ID
  const getAdminById = (adminId) => {
    return admins?.find(admin => admin._id === adminId) || { username: adminId, role: "Unknown" };
  };

  // Initialize state on modal open
  useEffect(() => {
    if (show) {
      setAssignments(existingAssignments || {});
      setSelectedLocations({});
      setSelectedAdmin("");
      setNewLocation("");
      setLocationFilter("");
      setConfirmClear(false);

      // Set available locations (either from props or default Mumbai area locations)
      const initialLocations = locations?.length > 0 ? locations : mumbaiAreaLocations;

      // Sort locations alphabetically
      setAvailableLocations([...initialLocations].sort());
    }
  }, [show, existingAssignments, locations]);

  // Filtered locations based on search
  const filteredLocations = useMemo(() => {
    if (!locationFilter.trim()) return availableLocations;

    return availableLocations.filter(loc =>
      loc.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }, [availableLocations, locationFilter]);

  // Handle admin selection
  const handleAdminChange = (e) => {
    setSelectedAdmin(e.target.value);
  };

  // Handle location selection/deselection
  const toggleLocationSelection = (location) => {
    setSelectedLocations(prev => ({
      ...prev,
      [location]: !prev[location]
    }));
  };

  // Add new location to available locations
  const addNewLocation = () => {
    if (newLocation.trim() === "") return;

    // Check if location already exists (case insensitive)
    const exists = availableLocations.some(
      loc => loc.toLowerCase() === newLocation.trim().toLowerCase()
    );

    if (!exists) {
      const newLocationValue = newLocation.trim();
      setAvailableLocations(prev => [...prev, newLocationValue].sort());
      // Auto-select the new location
      setSelectedLocations(prev => ({
        ...prev,
        [newLocationValue]: true
      }));
    }

    setNewLocation("");
  };

  // Select all filtered locations
  const selectAllFilteredLocations = () => {
    const newSelections = { ...selectedLocations };

    filteredLocations.forEach(loc => {
      newSelections[loc] = true;
    });

    setSelectedLocations(newSelections);
  };

  // Deselect all filtered locations
  const deselectAllFilteredLocations = () => {
    const newSelections = { ...selectedLocations };

    filteredLocations.forEach(loc => {
      newSelections[loc] = false;
    });

    setSelectedLocations(newSelections);
  };

  // Add locations to admin
  const addLocationsToAdmin = () => {
    if (!selectedAdmin) return;

    const locationsToAdd = Object.keys(selectedLocations).filter(loc => selectedLocations[loc]);
    if (locationsToAdd.length === 0) return;

    setAssignments(prev => {
      const updatedAssignments = { ...prev };

      // Create or update the admin's locations array
      updatedAssignments[selectedAdmin] = [
        ...(updatedAssignments[selectedAdmin] || []),
        ...locationsToAdd
      ];

      // Remove duplicates and sort
      updatedAssignments[selectedAdmin] = [...new Set(updatedAssignments[selectedAdmin])].sort();

      return updatedAssignments;
    });

    // Reset selection
    setSelectedLocations({});
  };

  // Remove a location from an admin
  const removeLocation = (adminId, location) => {
    setAssignments(prev => {
      const updatedAssignments = { ...prev };

      if (updatedAssignments[adminId]) {
        updatedAssignments[adminId] = updatedAssignments[adminId].filter(loc => loc !== location);

        // Clean up empty arrays
        if (updatedAssignments[adminId].length === 0) {
          delete updatedAssignments[adminId];
        }
      }

      return updatedAssignments;
    });
  };

  // Clear all assignments for a user
  const clearUserAssignments = (adminId) => {
    setAssignments(prev => {
      const updatedAssignments = { ...prev };
      delete updatedAssignments[adminId];
      return updatedAssignments;
    });
  };

  // Clear all assignments
  const clearAllAssignments = () => {
    if (confirmClear) {
      setAssignments({});
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  // Save all assignments
  const handleSave = () => {
    onSave(assignments);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: "900px", width: "90%", maxHeight: "90vh", overflow: "auto" }}>
        <div className={styles.modalHeader}>
          <h3>Configure Location-based Lead Assignment</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Select User:</label>
            <select
              value={selectedAdmin}
              onChange={handleAdminChange}
              className={styles.formControl}
            >
              <option value="">-- Select User --</option>
              {admins && admins
                .filter(admin => admin.active !== false) // Show all active users
                .map(admin => (
                  <option key={admin._id} value={admin._id}>
                    {admin.username} ({admin.role}) {admin.email ? `- ${admin.email}` : ''}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.locationSelectionContainer}>
            <div className={styles.locationHeader}>
              <div className={styles.formGroup}>
                <label>
                  <FaSearch /> Search Locations:
                </label>
                <div className={styles.searchInputGroup}>
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={styles.searchInput}
                    placeholder="Filter locations..."
                  />
                  {locationFilter && (
                    <button
                      onClick={() => setLocationFilter("")}
                      className={styles.clearSearchButton}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.locationActions}>
                <button
                  onClick={selectAllFilteredLocations}
                  className={styles.selectAllButton}
                  disabled={filteredLocations.length === 0}
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllFilteredLocations}
                  className={styles.deselectAllButton}
                  disabled={filteredLocations.length === 0}
                >
                  Deselect All
                </button>
                <span className={styles.locationCount}>
                  {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} available
                </span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Available Locations:</label>
              <div className={styles.locationsGrid}>
                {filteredLocations.length > 0 ? (
                  filteredLocations.map(location => (
                    <div key={location} className={styles.locationItem}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedLocations[location] || false}
                          onChange={() => toggleLocationSelection(location)}
                        />
                        {location}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className={styles.noLocationsMessage}>
                    {locationFilter ? "No matching locations found" : "No locations available"}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Add New Location:</label>
              <div className={styles.addLocationInputGroup}>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className={styles.addLocationInput}
                  placeholder="Enter a new location"
                  onKeyDown={(e) => e.key === 'Enter' && addNewLocation()}
                />
                <button
                  onClick={addNewLocation}
                  disabled={!newLocation.trim()}
                  className={styles.addLocationButton}
                >
                  <FaPlusCircle /> Add
                </button>
              </div>
            </div>

            <div className={styles.buttonCenter}>
              <button
                onClick={addLocationsToAdmin}
                disabled={!selectedAdmin || Object.keys(selectedLocations).every(loc => !selectedLocations[loc])}
                className={styles.actionButton}
              >
                Add Selected Locations
              </button>
            </div>
          </div>

          <div className={styles.currentAssignments}>
            <div className={styles.assignmentsHeader}>
              <h4>Current Assignments:</h4>
              <button
                onClick={clearAllAssignments}
                className={`${styles.clearAllButton} ${confirmClear ? styles.confirmClear : ''}`}
                disabled={Object.keys(assignments).length === 0}
              >
                {confirmClear ? "Confirm Clear All" : "Clear All Assignments"}
              </button>
            </div>

            {Object.keys(assignments).length === 0 ? (
              <p>No assignments configured yet.</p>
            ) : (
              <div className={styles.assignmentsList}>
                {Object.keys(assignments).map(adminId => {
                  const admin = getAdminById(adminId);
                  const locationCount = assignments[adminId]?.length || 0;

                  return (
                    <div key={adminId} className={styles.assignmentItem}>
                      <div className={styles.assignmentHeader}>
                        <h5>{admin.username} ({admin.role})</h5>
                        <div className={styles.assignmentActions}>
                          <span className={styles.locationCount}>
                            {locationCount} location{locationCount !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => clearUserAssignments(adminId)}
                            className={styles.clearUserButton}
                            title="Remove all locations for this user"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className={styles.assignedLocations}>
                        {assignments[adminId]?.map(location => (
                          <span key={location} className={styles.locationTag}>
                            {location}
                            <button
                              onClick={() => removeLocation(adminId, location)}
                              className={styles.removeLocationBtn}
                              title="Remove this location"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            <FaTimes /> Cancel
          </button>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? <FaSpinner className={styles.spinner} /> : <FaSave />} Save Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationAssignmentModal;
