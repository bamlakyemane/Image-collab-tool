// frontend/src/components/ProgressBar.jsx

import React from "react";

const ProgressBar = ({ progress, status, fileName, error }) => {
  const getStatusColor = () => {
    if (error) return "#dc3545";
    if (progress === 100) return "#28a745";
    return "#007bff";
  };

  const getStatusText = () => {
    if (error) return "❌ Failed";
    if (progress === 100) return "✅ Complete";
    if (progress > 0) return `⏳ Uploading ${progress}%`;
    return "⏳ Preparing...";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.fileName}>{fileName || "Uploading..."}</span>
        <span style={{ ...styles.status, color: getStatusColor() }}>
          {getStatusText()}
        </span>
      </div>
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${error ? 100 : progress}%`,
            backgroundColor: getStatusColor(),
          }}
        />
      </div>
      {error && <div style={styles.errorMessage}>{error}</div>}
    </div>
  );
};

const styles = {
  container: {
    margin: "8px 0",
    padding: "10px 15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
    fontSize: "14px",
  },
  fileName: {
    color: "#333",
    fontWeight: "500",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "60%",
  },
  status: {
    fontWeight: "500",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
    borderRadius: "4px",
  },
  errorMessage: {
    marginTop: "6px",
    color: "#dc3545",
    fontSize: "13px",
  },
};

export default ProgressBar;
