"use client";
import { useEffect, useRef } from "react";
import styles from "@/styles/superadmin/AuditLogDetailsModal.module.css";
import { FaTimes, FaArrowRight, FaCog, FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt, FaClipboardList, FaMapMarkerAlt, FaComments, FaCheck, FaTimes as FaTimesCircle } from 'react-icons/fa';

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
                    {typeof values === 'object'
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
                    {renderSimpleValue(values.oldValue)}
                  </span>
                </div>
                <div className={styles.changeArrow}>
                  <FaArrowRight />
                </div>
                <div className={styles.newValue}>
                  <span className={styles.valueLabel}>Updated:</span>
                  <span className={styles.valueContent}>
                    {renderSimpleValue(values.newValue)}
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

  // Check action types
  const isUpdateLeadAction = log.action === 'update_lead';
  const isCreateLeadAction = log.action === 'create_lead';
  const isDeleteLeadAction = log.action === 'delete_lead';
  const isUpdateSettingAction = log.action === 'update_setting';
  const isLoginAction = log.action === 'login' || log.userAgent;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2>
            {isUpdateLeadAction ? 'Lead Update Details' :
             isCreateLeadAction ? 'Lead Creation Details' :
             isDeleteLeadAction ? 'Lead Deletion Details' :
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

                {/* Raw metadata if no structured fields are found and not a specific action type */}
                {!log.metadata.userId && !log.metadata.updateFields && !isUpdateSettingAction && (
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