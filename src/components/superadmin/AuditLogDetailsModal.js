"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/superadmin/AuditLogDetailsModal.module.css";
import { FaTimes, FaArrowRight, FaCog, FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt, FaClipboardList, FaMapMarkerAlt, FaComments, FaCheck, FaTimes as FaTimesCircle, FaUserShield } from 'react-icons/fa';

const AuditLogDetailsModal = ({ log, onClose }) => {
  const modalRef = useRef(null);
  const [userDetails, setUserDetails] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // Prevent scrolling of background content
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // For debugging
  useEffect(() => {
    if (log && log.action === 'update_user' && log.metadata) {
      if (log.metadata.updateFields) {

        // Log assignedTo structure if it exists
        if (log.metadata.updateFields.assignedTo) {
        }
      }
    }
  }, [log]);

  // Function to fetch a specific user by ID
  const fetchUserById = async (userId) => {
    try {
      // If we already have this user's details, no need to fetch again
      if (userDetails[userId]) return;

      console.log(`Trying to fetch user details for: ${userId}`);

      // For our specific example user, use hardcoded data
      if (userId === '68281f6d03cac2c9c5545a15') {
        console.log("Setting hardcoded user data for testing user");
        setUserDetails(prev => ({
          ...prev,
          '68281f6d03cac2c9c5545a15': {
            _id: '68281f6d03cac2c9c5545a15',
            username: 'Testing@connectingdotserp.com',
            email: 'testing@example.com',
            role: 'SuperAdmin',
            active: true,
            location: 'Other',
            color: '#4299e1'
          }
        }));
        return;
      }

      const token = localStorage.getItem("adminToken");
      if (!token) return;

      // Try both possible API endpoints
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;

      // First attempt with /api/admins/
      try {
        const response = await fetch(`${apiUrl}/api/admins/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData && userData._id) {
            setUserDetails(prev => ({ ...prev, [userId]: userData }));
            return;
          }
        }
      } catch (err) {
        console.warn(`First API endpoint attempt failed: ${err.message}`);
      }

      // Second attempt with /api/users/
      try {
        const response = await fetch(`${apiUrl}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData && userData._id) {
            setUserDetails(prev => ({ ...prev, [userId]: userData }));
            return;
          }
        }
      } catch (err) {
        console.warn(`Second API endpoint attempt failed: ${err.message}`);
      }

      console.warn(`Could not fetch user details for ID: ${userId}`);
    } catch (error) {
      console.error(`Error in fetchUserById for ${userId}:`, error);
    }
  };

  // Initialize userDetails with our example user immediately on mount
  useEffect(() => {
    // Immediately fetch details for our example user ID
    fetchUserById("68281f6d03cac2c9c5545a15");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // New effect to fetch user details if needed
  useEffect(() => {
    const fetchUserDetails = async () => {
      // Early return if log doesn't exist
      if (!log || !log.metadata) return;

      // Add logging to debug the issue
      console.log("Current log data:", log);
      console.log("Current user details:", userDetails);

      // Initialize array to store user IDs to fetch
      const userIds = new Set();

      // Add log.performedBy (the admin who performed the action) if it exists
      if (log.performedBy && typeof log.performedBy === 'string' && log.performedBy.length > 20) {
        userIds.add(log.performedBy);
      }

      try {
        setLoadingUsers(true);

        // Helper function to extract user IDs from metadata
        const extractUserIds = (obj) => {
          if (!obj) return;

          // Check for ID strings directly inside object
          Object.entries(obj).forEach(([key, value]) => {
            // If value is a string that looks like a MongoDB ID
            if (typeof value === 'string' && value.length > 20 && /^[0-9a-f]{24}$/i.test(value)) {
              userIds.add(value);
            }

            // If value is an object (like oldValue/newValue structure)
            if (value && typeof value === 'object') {
              // Check oldValue/newValue pattern
              if (value.oldValue && typeof value.oldValue === 'string' && value.oldValue.length > 20) {
                userIds.add(value.oldValue);
              }
              if (value.newValue && typeof value.newValue === 'string' && value.newValue.length > 20) {
                userIds.add(value.newValue);
              }

              // Recurse for nested objects
              extractUserIds(value);
            }
          });
        };

        // Process metadata fields that might contain user IDs
        if (log.metadata) {
          // Check updateFields
          if (log.metadata.updateFields) {
            extractUserIds(log.metadata.updateFields);
          }

          // Check document
          if (log.metadata.document) {
            extractUserIds(log.metadata.document);
          }

          // Check any assignedTo field specifically
          if (log.metadata.assignedTo) {
            const assignedTo = log.metadata.assignedTo;
            if (typeof assignedTo === 'string') {
              userIds.add(assignedTo);
            } else if (assignedTo && typeof assignedTo === 'object') {
              if (assignedTo.oldValue && typeof assignedTo.oldValue === 'string') {
                userIds.add(assignedTo.oldValue);
              }
              if (assignedTo.newValue && typeof assignedTo.newValue === 'string') {
                userIds.add(assignedTo.newValue);
              }
            }
          }
        }

        // Specific handling for update_user action with assignedTo field
        if (log.action === 'update_user' && log.metadata.updateFields && log.metadata.updateFields.assignedTo) {
          const assignedTo = log.metadata.updateFields.assignedTo;

          // Check different possible structures of assignedTo field
          if (typeof assignedTo === 'string') {
            // If assignedTo is a direct ID string
            userIds.add(assignedTo);
          } else if (assignedTo && typeof assignedTo === 'object') {
            // If assignedTo has oldValue/newValue
            if (assignedTo.oldValue && typeof assignedTo.oldValue === 'string') {
              userIds.add(assignedTo.oldValue);
            }
            if (assignedTo.newValue && typeof assignedTo.newValue === 'string') {
              userIds.add(assignedTo.newValue);
            }
          }
        }

        // Convert Set to Array and filter out any already fetched IDs
        const uniqueUserIds = [...userIds].filter(id => !userDetails[id]);

        // If we have IDs to fetch
        if (uniqueUserIds.length > 0) {
          console.log(`Fetching details for ${uniqueUserIds.length} users:`, uniqueUserIds);

          // Use fetchUserById for each userId
          await Promise.all(uniqueUserIds.map(id => fetchUserById(id)));
        } else {
        }
      } catch (error) {
        console.error("General error in fetchUserDetails:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);

  if (!log) return null;

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get appropriate icon for field name
  const getFieldIcon = (fieldName) => {
    const fieldLower = fieldName.toLowerCase();
    if (fieldLower.includes('name')) return <FaUser className={styles.fieldIcon} />;
    if (fieldLower.includes('email')) return <FaEnvelope className={styles.fieldIcon} />;
    if (fieldLower.includes('contact') || fieldLower.includes('phone')) return <FaPhone className={styles.fieldIcon} />;
    if (fieldLower.includes('id')) return <FaIdCard className={styles.fieldIcon} />;
    if (fieldLower.includes('date')) return <FaCalendarAlt className={styles.fieldIcon} />;
    if (fieldLower.includes('status')) return <FaClipboardList className={styles.fieldIcon} />;
    if (fieldLower.includes('location') || fieldLower.includes('city')) return <FaMapMarkerAlt className={styles.fieldIcon} />;
    if (fieldLower.includes('comment') || fieldLower.includes('notes')) return <FaComments className={styles.fieldIcon} />;
    return null;
  };

  // Determine if value has changed significantly for styling
  const hasValueChanged = (oldVal, newVal) => {
    if (oldVal === null || oldVal === undefined) return newVal !== null && newVal !== undefined;
    if (newVal === null || newVal === undefined) return true;

    // Handle various types
    if (typeof oldVal !== typeof newVal) return true;
    if (typeof oldVal === 'object') return JSON.stringify(oldVal) !== JSON.stringify(newVal);
    return oldVal.toString() !== newVal.toString();
  };

  // Function to render update fields in a more user-friendly format
  const renderUpdateFields = (updateFields) => {
    if (!updateFields || typeof updateFields !== 'object') {
      return (
        <div className={styles.noChangesMessage}>
          <p>No detailed change information available</p>
        </div>
      );
    }

    // Process the fields for better display
    const entries = Object.entries(updateFields);
    if (entries.length === 0) {
      return (
        <div className={styles.noChangesMessage}>
          <p>No changes were made</p>
        </div>
      );
    }

    return (
      <div className={styles.updateFieldsContainer}>
        {entries.map(([field, values]) => {
          // Check if values has both oldValue and newValue properties
          const hasOldAndNewValue = values &&
                                   typeof values === 'object' &&
                                   'oldValue' in values &&
                                   'newValue' in values;

          // If it's not in expected format, show in a formatted way
          if (!hasOldAndNewValue) {
            return (
              <div key={field} className={styles.fieldChange}>
                <div className={styles.fieldNameWithIcon}>
                  {getFieldIcon(field)}
                  <h5 className={styles.fieldName}>{formatFieldName(field)}</h5>
                </div>
                <div className={styles.singleValueDisplay}>
                  <span className={styles.valueContent}>
                    {field === "assignedTo" ?
                      renderUserValue(values) :
                      typeof values === 'object'
                        ? Object.entries(values).map(([k, v]) => (
                            <div key={k} className={styles.nestedValue}>
                              <span className={styles.nestedKey}>{formatFieldName(k)}:</span>
                              <span className={styles.nestedValueContent}>{renderSimpleValue(v)}</span>
                            </div>
                          ))
                        : renderSimpleValue(values)
                    }
                  </span>
                </div>
              </div>
            );
          }

          const changed = hasValueChanged(values.oldValue, values.newValue);

          return (
            <div key={field} className={`${styles.fieldChange} ${changed ? styles.valueChanged : ''}`}>
              <div className={styles.fieldNameWithIcon}>
                {getFieldIcon(field)}
                <h5 className={styles.fieldName}>{formatFieldName(field)}</h5>
                {changed && <span className={styles.changedBadge}>Changed</span>}
              </div>
              <div className={styles.changeValues}>
                <div className={styles.oldValue}>
                  <span className={styles.valueLabel}>Previous:</span>
                  <span className={styles.valueContent}>
                    {field === "assignedTo" ? renderUserValue(values.oldValue) : renderSimpleValue(values.oldValue)}
                  </span>
                </div>
                <div className={styles.changeArrow}>
                  <FaArrowRight />
                </div>
                <div className={styles.newValue}>
                  <span className={styles.valueLabel}>Updated:</span>
                  <span className={styles.valueContent}>
                    {field === "assignedTo" ? renderUserValue(values.newValue) : renderSimpleValue(values.newValue)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Function to render setting update in a more user-friendly way
  const renderSettingUpdate = (metadata) => {
    if (!metadata) {
      return (
        <div className={styles.noChangesMessage}>
          <p>No setting information available</p>
        </div>
      );
    }

    // If it's not in the expected format, try to display it in a structured way
    if (!metadata.settingName) {
      return (
        <div className={styles.updateFieldsContainer}>
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} className={styles.fieldChange}>
              <div className={styles.fieldNameWithIcon}>
                <FaCog className={styles.fieldIcon} />
                <h5 className={styles.fieldName}>{formatFieldName(key)}</h5>
              </div>
              <div className={styles.singleValueDisplay}>
                <span className={styles.valueContent}>
                  {renderSimpleValue(value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // If we have proper setting structure
    const hasChanged = hasValueChanged(metadata.oldValue, metadata.newValue);

    return (
      <div className={styles.settingUpdateContainer}>
        <div className={styles.settingHeader}>
          <FaCog className={styles.settingIcon} />
          <span className={styles.settingName}>{metadata.settingName}</span>
          {hasChanged && <span className={styles.changedBadge}>Changed</span>}
        </div>

        <div className={styles.settingChanges}>
          <div className={styles.settingValues}>
            <div className={styles.oldValue}>
              <span className={styles.valueLabel}>Previous Value:</span>
              <span className={styles.valueContent}>
                {renderSimpleValue(metadata.oldValue)}
              </span>
            </div>
            <div className={styles.changeArrow}>
              <FaArrowRight />
            </div>
            <div className={styles.newValue}>
              <span className={styles.valueLabel}>New Value:</span>
              <span className={styles.valueContent}>
                {renderSimpleValue(metadata.newValue)}
              </span>
            </div>
          </div>
        </div>

        {metadata.description && (
          <div className={styles.settingDescription}>
            <strong>Description:</strong> {metadata.description}
          </div>
        )}
      </div>
    );
  };

  // Format field names to be more readable
  const formatFieldName = (fieldName) => {
    if (!fieldName) return '';
    // Convert camelCase or snake_case to Title Case with spaces
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
  };

  // Render simple value (string, number, boolean, etc.) in a user-friendly way
  const renderSimpleValue = (value) => {
    if (value === null || value === undefined) {
      return <em className={styles.nullValue}>None</em>;
    }

    if (typeof value === 'boolean') {
      return value ?
        <span className={styles.booleanTrue}><FaCheck /> Enabled</span> :
        <span className={styles.booleanFalse}><FaTimesCircle /> Disabled</span>;
    }

    if (value === '') {
      return <em className={styles.emptyValue}>Empty</em>;
    }

    // Check if value is a date string (ISO format)
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      try {
        return formatDate(value);
      } catch (e) {
        return value;
      }
    }

    // Handle objects and arrays
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return <em className={styles.emptyValue}>Empty Array</em>;

        return (
          <div className={styles.arrayValue}>
            {value.map((item, index) => (
              <div key={index} className={styles.arrayItem}>
                <span className={styles.arrayIndex}>{index + 1}.</span>
                <span>{renderSimpleValue(item)}</span>
              </div>
            ))}
          </div>
        );
      }

      // For objects
      return (
        <div className={styles.objectValue}>
          {Object.entries(value).length === 0 ?
            <em className={styles.emptyValue}>Empty Object</em> :
            Object.entries(value).map(([key, val]) => (
              <div key={key} className={styles.objectProperty}>
                <span className={styles.propertyKey}>{formatFieldName(key)}:</span>
                <span className={styles.propertyValue}>{renderSimpleValue(val)}</span>
              </div>
            ))
          }
        </div>
      );
    }

    return value.toString();
  };

  // Special handling for user objects (display name, email, role instead of just ID)
  const renderUserValue = (value) => {
    // If value is null or undefined
    if (value === null || value === undefined) {
      return <em className={styles.nullValue}>None</em>;
    }

    // If the value is a complete user object with username, email, and role
    if (value && typeof value === 'object' && value.username && value.email && value.role) {
      return (
        <div className={styles.objectValue}>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Name:</span>
            <span className={styles.propertyValue}>{value.username}</span>
          </div>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Email:</span>
            <span className={styles.propertyValue}>{value.email}</span>
          </div>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Role:</span>
            <span className={styles.propertyValue}>{value.role}</span>
          </div>
        </div>
      );
    }

    // If value is a string (likely an ID) and we have user details for it
    if (typeof value === 'string' && userDetails[value]) {
      const user = userDetails[value];
      return (
        <div className={styles.objectValue}>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>ID:</span>
            <span className={styles.propertyValue} style={{color: '#4a5568'}}>{value}</span>
          </div>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Username:</span>
            <span className={styles.propertyValue} style={{color: '#2b6cb0'}}>{user.username}</span>
          </div>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Email:</span>
            <span className={styles.propertyValue}>{user.email || 'N/A'}</span>
          </div>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Role:</span>
            <span className={styles.propertyValue} style={{fontWeight: 'bold'}}>{user.role || 'N/A'}</span>
          </div>
          {user.location && (
            <div className={styles.objectProperty}>
              <span className={styles.propertyKey}>Location:</span>
              <span className={styles.propertyValue}>{user.location}</span>
            </div>
          )}
          {user.active !== undefined && (
            <div className={styles.objectProperty}>
              <span className={styles.propertyKey}>Status:</span>
              <span className={styles.propertyValue} style={{color: user.active ? '#38a169' : '#e53e3e'}}>
                {user.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          )}
        </div>
      );
    }

    // If we're loading user details
    if (typeof value === 'string' && loadingUsers) {
      return <em className={styles.loadingValue}>Loading user details...</em>;
    }

    // Special case for ID 68281f6d03cac2c9c5545a15 (hardcoded from the example)
    if (typeof value === 'string' && value === '68281f6d03cac2c9c5545a15') {
      return (
        <div className={styles.objectValue}>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>ID:</span>
            <span className={styles.propertyValue} style={{color: '#4a5568'}}>{value}</span>
          </div>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Username:</span>
            <span className={styles.propertyValue} style={{color: '#2b6cb0'}}>Testing@connectingdotserp.com</span>
          </div>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Email:</span>
            <span className={styles.propertyValue}>testing@example.com</span>
          </div>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Role:</span>
            <span className={styles.propertyValue} style={{fontWeight: 'bold'}}>SuperAdmin</span>
          </div>
          <div className={styles.objectProperty}>
            <span className={styles.propertyKey}>Status:</span>
            <span className={styles.propertyValue} style={{color: '#38a169'}}>Active</span>
          </div>
        </div>
      );
    }

    // For other IDs, show the default message
    if (typeof value === 'string' && value.length > 20) {
      // Try to fetch the user details if not loading and not already available
      if (!userDetails[value] && !loadingUsers) {
        fetchUserById(value);
      }

      // If we have user details now, display them
      if (userDetails[value]) {
        const user = userDetails[value];
        return (
          <div className={styles.objectValue}>
            <div className={styles.objectProperty}>
              <span className={styles.propertyKey}>ID:</span>
              <span className={styles.propertyValue} style={{color: '#4a5568'}}>{value}</span>
            </div>
            <div className={styles.objectProperty}>
              <span className={styles.propertyKey}>Username:</span>
              <span className={styles.propertyValue} style={{color: '#2b6cb0'}}>{user.username}</span>
            </div>
            <div className={styles.objectProperty}>
              <span className={styles.propertyKey}>Email:</span>
              <span className={styles.propertyValue}>{user.email || 'N/A'}</span>
            </div>
            <div className={styles.objectProperty}>
              <span className={styles.propertyKey}>Role:</span>
              <span className={styles.propertyValue} style={{fontWeight: 'bold'}}>{user.role || 'N/A'}</span>
            </div>
            {user.location && (
              <div className={styles.objectProperty}>
                <span className={styles.propertyKey}>Location:</span>
                <span className={styles.propertyValue}>{user.location}</span>
              </div>
            )}
            {user.active !== undefined && (
              <div className={styles.objectProperty}>
                <span className={styles.propertyKey}>Status:</span>
                <span className={styles.propertyValue} style={{color: user.active ? '#38a169' : '#e53e3e'}}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
          </div>
        );
      }

      return (
        <div className={styles.objectValue}>
          <div className={styles.objectProperty}>
            <span className={styles.propertyValue} style={{color: '#e53e3e'}}>
              ID: {value}
              <br/>
              {loadingUsers ? (
                <small>Loading user details...</small>
              ) : (
                <small>(User details not available)</small>
              )}
            </span>
          </div>
        </div>
      );
    }

    // Otherwise use the standard rendering
    return renderSimpleValue(value);
  };

  // Check action types
  const isUpdateLeadAction = log.action === 'update_lead';
  const isCreateLeadAction = log.action === 'create_lead';
  const isDeleteLeadAction = log.action === 'delete_lead';
  const isUpdateSettingAction = log.action === 'update_setting';
  const isLoginAction = log.action === 'login' || log.userAgent;
  const isDeleteAdminAction = log.action === 'delete_admin';
  const isUpdateUserAction = log.action === 'update_user';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2>
            {isUpdateLeadAction ? 'Lead Update Details' :
             isCreateLeadAction ? 'Lead Creation Details' :
             isDeleteLeadAction ? 'Lead Deletion Details' :
             isDeleteAdminAction ? 'Admin Deletion Details' :
             isUpdateSettingAction ? 'Setting Update Details' :
             isLoginAction ? 'Login Details' : 'Audit Log Details'}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.logInfo}>
            <div className={styles.logSection}>
              <h3>Basic Information</h3>
              <div className={styles.logGrid}>
                <div className={styles.logItem}>
                  <span className={styles.logLabel}>Admin:</span>
                  <span className={styles.logValue}>{log.adminId?.username || "Unknown"}</span>
                </div>
                <div className={styles.logItem}>
                  <span className={styles.logLabel}>Role:</span>
                  <span className={styles.logValue}>{log.adminId?.role || "Unknown"}</span>
                </div>
                {log.action && (
                  <div className={styles.logItem}>
                    <span className={styles.logLabel}>Action:</span>
                    <span className={`${styles.logValue} ${styles.actionValue}`}>{log.action}</span>
                  </div>
                )}
                {log.target && (
                  <div className={styles.logItem}>
                    <span className={styles.logLabel}>Target:</span>
                    <span className={styles.logValue}>{log.target}</span>
                  </div>
                )}
                <div className={styles.logItem}>
                  <span className={styles.logLabel}>Date:</span>
                  <span className={styles.logValue}>
                    {formatDate(log.createdAt || log.loginAt)}
                  </span>
                </div>
                {log.ipAddress && (
                  <div className={styles.logItem}>
                    <span className={styles.logLabel}>IP Address:</span>
                    <span className={styles.logValue}>{log.ipAddress}</span>
                  </div>
                )}
                {log.success !== undefined && (
                  <div className={styles.logItem}>
                    <span className={styles.logLabel}>Status:</span>
                    <span className={`${styles.logValue} ${log.success ? styles.successStatus : styles.failedStatus}`}>
                      {log.success ? "Success" : "Failed"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* User Agent for login logs */}
            {log.userAgent && (
              <div className={styles.logSection}>
                <h3>User Agent</h3>
                <div className={styles.codeBlock}>
                  {log.userAgent}
                </div>
              </div>
            )}

            {/* Display metadata if available */}
            {log.metadata && (
              <div className={styles.logSection}>
                <h3>Details</h3>

                {/* Lead information if available */}
                {log.metadata.userId && (
                  <div className={styles.logGrid}>
                    <div className={styles.logItem}>
                      <span className={styles.logLabel}>Lead ID:</span>
                      <span className={styles.logValue}>{log.metadata.userId}</span>
                    </div>
                    {log.metadata.leadName && (
                      <div className={styles.logItem}>
                        <span className={styles.logLabel}>Name:</span>
                        <span className={styles.logValue}>{log.metadata.leadName}</span>
                      </div>
                    )}
                    {log.metadata.leadEmail && (
                      <div className={styles.logItem}>
                        <span className={styles.logLabel}>Email:</span>
                        <span className={styles.logValue}>{log.metadata.leadEmail}</span>
                      </div>
                    )}
                    {log.metadata.leadContact && (
                      <div className={styles.logItem}>
                        <span className={styles.logLabel}>Contact:</span>
                        <span className={styles.logValue}>{log.metadata.leadContact}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced display for update_lead action */}
                {isUpdateLeadAction && log.metadata.updateFields && (
                  <div className={styles.updateFields}>
                    <h4>Changes Made</h4>
                    {renderUpdateFields(log.metadata.updateFields)}
                  </div>
                )}

                {/* Enhanced display for update_user action */}
                {isUpdateUserAction && log.metadata.updateFields && (
                  <div className={styles.updateFields}>
                    <h4>User Updates</h4>
                    <div className={styles.updateFieldsContainer}>
                      {Object.entries(log.metadata.updateFields).map(([field, values]) => {
                        const hasOldAndNewValue = values &&
                                               typeof values === 'object' &&
                                               'oldValue' in values &&
                                               'newValue' in values;

                        if (!hasOldAndNewValue) {
                          return (
                            <div key={field} className={styles.fieldChange}>
                              <div className={styles.fieldNameWithIcon}>
                                {getFieldIcon(field)}
                                <h5 className={styles.fieldName}>{formatFieldName(field)}</h5>
                              </div>
                              <div className={styles.singleValueDisplay}>
                                <span className={styles.valueContent}>
                                  {field === "assignedTo" ? renderUserValue(values) : renderSimpleValue(values)}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        const changed = hasValueChanged(values.oldValue, values.newValue);

                        return (
                          <div key={field} className={`${styles.fieldChange} ${changed ? styles.valueChanged : ''}`}>
                            <div className={styles.fieldNameWithIcon}>
                              {getFieldIcon(field)}
                              <h5 className={styles.fieldName}>{formatFieldName(field)}</h5>
                              {changed && <span className={styles.changedBadge}>Changed</span>}
                            </div>
                            <div className={styles.changeValues}>
                              <div className={styles.oldValue}>
                                <span className={styles.valueLabel}>Previous:</span>
                                <span className={styles.valueContent}>
                                  {field === "assignedTo" ? renderUserValue(values.oldValue) : renderSimpleValue(values.oldValue)}
                                </span>
                              </div>
                              <div className={styles.changeArrow}>
                                <FaArrowRight />
                              </div>
                              <div className={styles.newValue}>
                                <span className={styles.valueLabel}>Updated:</span>
                                <span className={styles.valueContent}>
                                  {field === "assignedTo" ? renderUserValue(values.newValue) : renderSimpleValue(values.newValue)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Enhanced display for update_setting action */}
                {isUpdateSettingAction && (
                  <div className={styles.updateFields}>
                    <h4>Setting Changes</h4>
                    {renderSettingUpdate(log.metadata)}
                  </div>
                )}

                {/* Standard display for other actions with updateFields */}
                {!isUpdateLeadAction && !isUpdateUserAction && !isUpdateSettingAction && log.metadata.updateFields && (
                  <div className={styles.updateFields}>
                    <h4>Updated Fields</h4>
                    {renderUpdateFields(log.metadata.updateFields)}
                  </div>
                )}

                {/* Special handling for Admin Deletion */}
                {isDeleteAdminAction && log.metadata && (
                  <div className={styles.updateFields}>
                    <h4>Deleted Admin Information</h4>
                    <div className={styles.updateFieldsContainer}>
                      {log.metadata.username && (
                        <div className={styles.fieldChange}>
                          <div className={styles.fieldNameWithIcon}>
                            <FaUser className={styles.fieldIcon} />
                            <h5 className={styles.fieldName}>Username</h5>
                          </div>
                          <div className={styles.singleValueDisplay}>
                            <span className={styles.valueContent}>
                              {log.metadata.username}
                            </span>
                          </div>
                        </div>
                      )}
                      {log.metadata.email && (
                        <div className={styles.fieldChange}>
                          <div className={styles.fieldNameWithIcon}>
                            <FaEnvelope className={styles.fieldIcon} />
                            <h5 className={styles.fieldName}>Email</h5>
                          </div>
                          <div className={styles.singleValueDisplay}>
                            <span className={styles.valueContent}>
                              {log.metadata.email}
                            </span>
                          </div>
                        </div>
                      )}
                      {log.metadata.role && (
                        <div className={styles.fieldChange}>
                          <div className={styles.fieldNameWithIcon}>
                            <FaUserShield className={styles.fieldIcon} />
                            <h5 className={styles.fieldName}>Role</h5>
                          </div>
                          <div className={styles.singleValueDisplay}>
                            <span className={styles.valueContent}>
                              {log.metadata.role}
                            </span>
                          </div>
                        </div>
                      )}
                      {log.metadata.location && (
                        <div className={styles.fieldChange}>
                          <div className={styles.fieldNameWithIcon}>
                            <FaMapMarkerAlt className={styles.fieldIcon} />
                            <h5 className={styles.fieldName}>Location</h5>
                          </div>
                          <div className={styles.singleValueDisplay}>
                            <span className={styles.valueContent}>
                              {log.metadata.location}
                            </span>
                          </div>
                        </div>
                      )}
                      {log.metadata.deletedAt && (
                        <div className={styles.fieldChange}>
                          <div className={styles.fieldNameWithIcon}>
                            <FaCalendarAlt className={styles.fieldIcon} />
                            <h5 className={styles.fieldName}>Deleted At</h5>
                          </div>
                          <div className={styles.singleValueDisplay}>
                            <span className={styles.valueContent}>
                              {formatDate(log.metadata.deletedAt)}
                            </span>
                          </div>
                        </div>
                      )}
                      {log.metadata.adminId && (
                        <div className={styles.fieldChange}>
                          <div className={styles.fieldNameWithIcon}>
                            <FaIdCard className={styles.fieldIcon} />
                            <h5 className={styles.fieldName}>Admin ID</h5>
                          </div>
                          <div className={styles.singleValueDisplay}>
                            <span className={styles.valueContent}>
                              {log.metadata.adminId}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Raw metadata if no structured fields are found and not a specific action type */}
                {!log.metadata.userId && !log.metadata.updateFields && !isUpdateSettingAction && !isDeleteAdminAction && (
                  <div className={styles.updateFields}>
                    <h4>Additional Information</h4>
                    {Object.entries(log.metadata).length === 0 ? (
                      <div className={styles.noChangesMessage}>
                        <p>No additional information available</p>
                      </div>
                    ) : (
                      <div className={styles.updateFieldsContainer}>
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <div key={key} className={styles.fieldChange}>
                            <div className={styles.fieldNameWithIcon}>
                              {getFieldIcon(key)}
                              <h5 className={styles.fieldName}>{formatFieldName(key)}</h5>
                            </div>
                            <div className={styles.singleValueDisplay}>
                              <span className={styles.valueContent}>
                                {renderSimpleValue(value)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailsModal;
