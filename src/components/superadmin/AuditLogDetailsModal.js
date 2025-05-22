"use client";
import { useEffect, useRef } from "react";
import styles from "@/styles/superadmin/AuditLogDetailsModal.module.css";
import { FaTimes, FaArrowRight, FaCog, FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt, FaClipboardList, FaMapMarkerAlt, FaComments, FaCheck, FaTimes as FaTimesCircle, FaUserShield } from 'react-icons/fa';

const AuditLogDetailsModal = ({ log, onClose }) => {
  const modalRef = useRef(null);

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
                    {typeof values === 'object' && values !== null
                      ? Object.entries(values).map(([k, v]) => (
                          <div key={k} className={styles.nestedValue}>
                            <span className={styles.nestedKey}>{formatFieldName(k)}:</span>
                            <span className={styles.nestedValueContent}>{renderSimpleValue(v, k)}</span>
                          </div>
                        ))
                      : renderSimpleValue(values, field)
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
                    {renderSimpleValue(values.oldValue, field)}
                  </span>
                </div>
                <div className={styles.changeArrow}>
                  <FaArrowRight />
                </div>
                <div className={styles.newValue}>
                  <span className={styles.valueLabel}>Updated:</span>
                  <span className={styles.valueContent}>
                    {renderSimpleValue(values.newValue, field)}
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
                  {renderSimpleValue(value, key)}
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
                {renderSimpleValue(metadata.oldValue, 'settingName')}
              </span>
            </div>
            <div className={styles.changeArrow}>
              <FaArrowRight />
            </div>
            <div className={styles.newValue}>
              <span className={styles.valueLabel}>New Value:</span>
              <span className={styles.valueContent}>
                {renderSimpleValue(metadata.newValue, 'settingName')}
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
  const renderSimpleValue = (value, field = '') => {
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

    // Check if this is a user reference (common field names for user assignments)
    const isAssignmentField =
      (field && ['assignedTo', 'assignedUser', 'userId', 'adminId', 'createdBy', 'updatedBy', 'owner', 'user', 'admin']
        .some(term => field.toLowerCase().includes(term.toLowerCase())));

    // Special handling for user references - CASE 1: Object with properties
    if (isAssignmentField && typeof value === 'object' && value !== null) {
      // For objects with _id field, assume it's a user reference
      if (value._id) {
        return (
          <div className={styles.userReferenceValue}>
            <div>
              {value.username && (
                <div className={styles.userProperty}>
                  <span className={styles.propertyKey}>Username:</span>
                  <span className={styles.propertyValue}>{value.username}</span>
                </div>
              )}
              {value.name && (
                <div className={styles.userProperty}>
                  <span className={styles.propertyKey}>Name:</span>
                  <span className={styles.propertyValue}>{value.name}</span>
                </div>
              )}
              {value.email && (
                <div className={styles.userProperty}>
                  <span className={styles.propertyKey}>Email:</span>
                  <span className={styles.propertyValue}>{value.email}</span>
                </div>
              )}
              {value.role && (
                <div className={styles.userProperty}>
                  <span className={styles.propertyKey}>Role:</span>
                  <span className={styles.propertyValue}>{value.role}</span>
                </div>
              )}
              <div className={styles.userProperty}>
                <span className={styles.propertyKey}>ID:</span>
                <span className={styles.propertyValue}>{value._id}</span>
              </div>
            </div>
          </div>
        );
      }
    }

    // CASE 2: Handle string IDs for fields that likely reference users
    // This handles the scenario where assignedTo just shows an ID string
    if ((typeof value === 'string') &&
        (value.length === 24 || value.length === 12) &&
        /^[0-9a-fA-F]+$/.test(value)) {

      // Special handling for "assignedTo" field in any action, especially update_user
      if ((field && field.toLowerCase() === 'assignedto') ||
          (log.action && log.action.toLowerCase().includes('update_user'))) {

        // Try to fetch the user details from the backend
        // Since we can't do that now, we'll display an enhanced user reference

        return (
          <div className={styles.userReferenceValue}>
            <div className={styles.userPropertyExpanded}>
              <h4 className={styles.userHeading}>User Reference</h4>
              <div className={styles.userProperty}>
                <span className={styles.propertyKey}>Full ID:</span>
                <span className={styles.propertyValue}>{value}</span>
              </div>
              <div className={styles.adminNote}>
                <strong>Note:</strong> This represents a user in the system. Their
                details would need to be loaded from the database.
              </div>
            </div>
          </div>
        );
      }

      // Generic handling for other ObjectId-like strings
      if (isAssignmentField) {
        return (
          <div className={styles.userReferenceValue}>
            <div className={styles.userProperty}>
              <span className={styles.propertyKey}>ID:</span>
              <span className={styles.propertyValue}>{value}</span>
            </div>
            <div className={styles.adminNote}>
              <em>This appears to be a reference to a database object.</em>
            </div>
          </div>
        );
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
                <span>{renderSimpleValue(item, `item-${index}`)}</span>
              </div>
            ))}
          </div>
        );
      }

      // For objects
      return (
        <div className={styles.objectValue}>
          {value && Object.entries(value).length === 0 ?
            <em className={styles.emptyValue}>Empty Object</em> :
            value && Object.entries(value).map(([key, val]) => (
              <div key={key} className={styles.objectProperty}>
                <span className={styles.propertyKey}>{formatFieldName(key)}:</span>
                <span className={styles.propertyValue}>{renderSimpleValue(val, key)}</span>
              </div>
            ))
          }
        </div>
      );
    }

    return value.toString();
  };

  // Check action types
  const isUpdateLeadAction = log.action === 'update_lead';
  const isCreateLeadAction = log.action === 'create_lead';
  const isDeleteLeadAction = log.action === 'delete_lead';
  const isUpdateSettingAction = log.action === 'update_setting';
  const isLoginAction = log.action === 'login' || log.userAgent;
  const isDeleteAdminAction = log.action === 'delete_admin';

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

                {/* Enhanced display for update_setting action */}
                {isUpdateSettingAction && (
                  <div className={styles.updateFields}>
                    <h4>Setting Changes</h4>
                    {renderSettingUpdate(log.metadata)}
                  </div>
                )}

                {/* Standard display for other actions with updateFields */}
                {!isUpdateLeadAction && !isUpdateSettingAction && log.metadata.updateFields && (
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
                    {!log.metadata || Object.entries(log.metadata).length === 0 ? (
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
                                {renderSimpleValue(value, key)}
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
