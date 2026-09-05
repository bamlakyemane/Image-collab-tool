// frontend/src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [images, setImages] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [error, setError] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);

  // ✅ Role check – redirect only if not admin
  useEffect(() => {
    if (!user) return;
    console.log("AdminDashboard - User role:", user.role);
    if (!user.role.includes("admin")) {
      console.log("AdminDashboard - Not admin, redirecting");
      navigate("/library");
      return;
    }
    console.log("AdminDashboard - Access granted ✅");
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, usersRes, imagesRes, reportsRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users?limit=50"),
        API.get("/admin/images"),
        API.get("/admin/reports?limit=50"),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (imagesRes.data.success) setImages(imagesRes.data.images);
      if (reportsRes.data.success) setReports(reportsRes.data.reports);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  // Image selection toggle
  const toggleImageSelection = (imageId) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId],
    );
  };

  // Bulk delete images
  const handleBulkDeleteImages = async () => {
    if (selectedImages.length === 0) {
      alert("Please select at least one image");
      return;
    }
    if (!confirm(`Delete ${selectedImages.length} selected images?`)) return;

    try {
      const response = await API.delete("/admin/images/bulk", {
        data: { imageIds: selectedImages },
      });
      if (response.data.success) {
        fetchData();
        setSelectedImages([]);
        alert(response.data.message);
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Failed to delete images");
    }
  };

  // Single delete image
  const handleDeleteImage = async (imageId) => {
    if (!confirm("Delete this image?")) return;
    try {
      const response = await API.delete(`/admin/images/${imageId}`);
      if (response.data.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete image error:", err);
      alert("Failed to delete image");
    }
  };

  // Ban/Unban user
  const handleBanUser = async (userId, isBanned) => {
    if (
      !confirm(
        `Are you sure you want to ${isBanned ? "unban" : "ban"} this user?`,
      )
    )
      return;
    try {
      const response = await API.put(`/admin/users/${userId}/ban`, {
        reason: isBanned ? "" : "Violation of community guidelines",
      });
      if (response.data.success) {
        fetchData();
      }
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  // Change user role
  const handleRoleChange = async (userId, role) => {
    try {
      const response = await API.put(`/admin/users/${userId}/role`, { role });
      if (response.data.success) {
        fetchData();
      }
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  // Resolve report
  const handleResolveReport = async (reportId, action) => {
    try {
      const response = await API.put(`/admin/reports/${reportId}/resolve`, {
        action,
        adminNote: `Resolved by admin`,
      });
      if (response.data.success) {
        fetchData();
      }
    } catch (err) {
      alert("Failed to resolve report");
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading admin dashboard...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>⚙️ Admin Dashboard</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {user?.name}!</span>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            ...styles.tab,
            ...(activeTab === "dashboard" ? styles.tabActive : {}),
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            ...styles.tab,
            ...(activeTab === "users" ? styles.tabActive : {}),
          }}
        >
          👥 Users
        </button>
        <button
          onClick={() => setActiveTab("images")}
          style={{
            ...styles.tab,
            ...(activeTab === "images" ? styles.tabActive : {}),
          }}
        >
          🖼️ Images ({images.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          style={{
            ...styles.tab,
            ...(activeTab === "reports" ? styles.tabActive : {}),
          }}
        >
          ⚠️ Reports ({reports.filter((r) => r.status === "pending").length})
        </button>
      </div>

      <main style={styles.main}>
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{stats.totalUsers}</h3>
              <p style={styles.statLabel}>👥 Total Users</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{stats.totalImages}</h3>
              <p style={styles.statLabel}>🖼️ Images</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{stats.totalComments}</h3>
              <p style={styles.statLabel}>💬 Comments</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{stats.pendingReports}</h3>
              <p style={styles.statLabel}>⚠️ Pending Reports</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{stats.bannedUsers}</h3>
              <p style={styles.statLabel}>🚫 Banned Users</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{stats.activeUsers}</h3>
              <p style={styles.statLabel}>✅ Active Users</p>
            </div>
          </div>
        )}

        {/* Users Tab – Aligned */}
        {activeTab === "users" && (
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}>
              <h2>👥 User Management</h2>
              <div>
                <span style={styles.userCount}>
                  Total: {users.length} users
                </span>
              </div>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.userNameColumn,
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.userEmailColumn,
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.userRoleColumn,
                        textAlign: "center",
                      }}
                    >
                      Role
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.userStatusColumn,
                        textAlign: "center",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.userImagesColumn,
                        textAlign: "center",
                      }}
                    >
                      Images
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.userCommentsColumn,
                        textAlign: "center",
                      }}
                    >
                      Comments
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.userActionsColumn,
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.userNameColumn,
                        }}
                      >
                        <span style={styles.userName}>{user.name}</span>
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.userEmailColumn,
                        }}
                      >
                        <span style={styles.userEmail} title={user.email}>
                          {user.email}
                        </span>
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.userRoleColumn,
                          textAlign: "center",
                        }}
                      >
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          style={{
                            ...styles.select,
                            fontWeight: user.role === "admin" ? "600" : "400",
                            color:
                              user.role === "admin"
                                ? "#007bff"
                                : user.role === "moderator"
                                  ? "#6f42c1"
                                  : "#333",
                          }}
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.userStatusColumn,
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: user.isBanned
                              ? "#f8d7da"
                              : "#d4edda",
                            color: user.isBanned ? "#dc3545" : "#28a745",
                          }}
                        >
                          {user.isBanned ? "🚫 Banned" : "✅ Active"}
                        </span>
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.userImagesColumn,
                          textAlign: "center",
                        }}
                      >
                        {user._count?.images || 0}
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.userCommentsColumn,
                          textAlign: "center",
                        }}
                      >
                        {user._count?.comments || 0}
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.userActionsColumn,
                          textAlign: "center",
                        }}
                      >
                        <button
                          onClick={() => handleBanUser(user.id, user.isBanned)}
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: user.isBanned
                              ? "#28a745"
                              : "#dc3545",
                            padding: "4px 14px",
                            fontSize: "12px",
                            borderRadius: "4px",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                          }}
                        >
                          {user.isBanned ? "Unban" : "Ban"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Images Tab – Aligned */}
        {activeTab === "images" && (
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}>
              <h2>🖼️ All Images</h2>
              {selectedImages.length > 0 && (
                <button
                  onClick={handleBulkDeleteImages}
                  style={styles.bulkDeleteBtn}
                >
                  🗑️ Delete Selected ({selectedImages.length})
                </button>
              )}
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.checkboxColumn,
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedImages(images.map((img) => img.id));
                          } else {
                            setSelectedImages([]);
                          }
                        }}
                        checked={
                          selectedImages.length === images.length &&
                          images.length > 0
                        }
                        style={styles.checkbox}
                      />
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.imageColumn,
                      }}
                    >
                      Image
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.fileNameColumn,
                      }}
                    >
                      File Name
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.ownerColumn,
                      }}
                    >
                      Owner
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.dateColumn,
                      }}
                    >
                      Uploaded
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.commentsColumn,
                        textAlign: "center",
                      }}
                    >
                      Comments
                    </th>
                    <th
                      style={{
                        ...styles.tableHeaderCell,
                        ...styles.actionsColumn,
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((image) => (
                    <tr key={image.id}>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.checkboxColumn,
                          textAlign: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedImages.includes(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          style={styles.checkbox}
                        />
                      </td>
                      <td
                        style={{ ...styles.tableCell, ...styles.imageColumn }}
                      >
                        {image.fileUrl ? (
                          <img
                            src={`http://localhost:5000${image.fileUrl}`}
                            alt={image.fileName}
                            style={styles.thumbnail}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span style={{ color: "#999", fontSize: "12px" }}>
                            No image
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.fileNameColumn,
                        }}
                      >
                        <span style={styles.fileName} title={image.fileName}>
                          {image.fileName}
                        </span>
                      </td>
                      <td
                        style={{ ...styles.tableCell, ...styles.ownerColumn }}
                      >
                        {image.owner?.name || "Unknown"}
                      </td>
                      <td style={{ ...styles.tableCell, ...styles.dateColumn }}>
                        {new Date(image.uploadDate).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.commentsColumn,
                          textAlign: "center",
                        }}
                      >
                        {image.commentCount || 0}
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          ...styles.actionsColumn,
                          textAlign: "center",
                        }}
                      >
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div style={styles.tableContainer}>
            <h2>⚠️ Reports Queue</h2>
            {reports.length === 0 ? (
              <p style={styles.empty}>No reports found</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeaderCell}>Type</th>
                      <th style={styles.tableHeaderCell}>Reason</th>
                      <th style={styles.tableHeaderCell}>Reported By</th>
                      <th style={styles.tableHeaderCell}>Status</th>
                      <th style={styles.tableHeaderCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td style={styles.tableCell}>{report.targetType}</td>
                        <td style={styles.tableCell}>{report.reason}</td>
                        <td style={styles.tableCell}>
                          {report.reporter?.name || "Unknown"}
                        </td>
                        <td
                          style={{
                            ...styles.tableCell,
                            color:
                              report.status === "pending"
                                ? "#ffc107"
                                : "#28a745",
                          }}
                        >
                          {report.status}
                        </td>
                        <td style={styles.tableCell}>
                          {report.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleResolveReport(
                                    report.id,
                                    "delete_content",
                                  )
                                }
                                style={{
                                  ...styles.actionBtn,
                                  backgroundColor: "#dc3545",
                                }}
                              >
                                Delete
                              </button>
                              <button
                                onClick={() =>
                                  handleResolveReport(report.id, "dismiss")
                                }
                                style={{
                                  ...styles.actionBtn,
                                  backgroundColor: "#6c757d",
                                }}
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                          {report.status !== "pending" && (
                            <span style={styles.resolvedBadge}>
                              ✅ Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// ✅ Full styles object
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    color: "#333",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  tabs: {
    display: "flex",
    gap: "0",
    backgroundColor: "white",
    borderBottom: "1px solid #ddd",
    padding: "0 40px",
  },
  tab: {
    padding: "12px 24px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    color: "#666",
    borderBottom: "3px solid transparent",
    transition: "all 0.2s",
  },
  tabActive: {
    color: "#007bff",
    borderBottom: "3px solid #007bff",
  },
  main: {
    padding: "30px 40px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "32px",
    margin: "0 0 5px 0",
    color: "#333",
  },
  statLabel: {
    margin: 0,
    color: "#666",
    fontSize: "14px",
  },
  tableContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    tableLayout: "fixed",
  },
  tableHeaderCell: {
    padding: "12px 10px",
    textAlign: "left",
    borderBottom: "2px solid #e9ecef",
    fontWeight: "600",
    color: "#495057",
    backgroundColor: "#f8f9fa",
    whiteSpace: "nowrap",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableCell: {
    padding: "10px 10px",
    borderBottom: "1px solid #f1f3f5",
    verticalAlign: "middle",
    color: "#333",
    fontSize: "13px",
    wordBreak: "break-word",
  },

  // Image column widths
  checkboxColumn: { width: "40px", textAlign: "center" },
  imageColumn: { width: "80px" },
  fileNameColumn: { width: "20%", minWidth: "120px" },
  ownerColumn: { width: "18%", minWidth: "100px" },
  dateColumn: { width: "15%", minWidth: "90px" },
  commentsColumn: { width: "10%", minWidth: "70px", textAlign: "center" },
  actionsColumn: { width: "15%", minWidth: "80px", textAlign: "center" },

  // User column widths
  userNameColumn: { width: "18%", minWidth: "100px" },
  userEmailColumn: { width: "25%", minWidth: "150px" },
  userRoleColumn: { width: "15%", minWidth: "100px" },
  userStatusColumn: { width: "12%", minWidth: "90px" },
  userImagesColumn: { width: "8%", minWidth: "60px" },
  userCommentsColumn: { width: "10%", minWidth: "70px" },
  userActionsColumn: { width: "12%", minWidth: "80px" },

  thumbnail: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "4px",
    border: "1px solid #eee",
    display: "block",
  },
  fileName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  userName: {
    fontWeight: "500",
    color: "#333",
  },
  userEmail: {
    color: "#555",
    fontSize: "13px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
    maxWidth: "100%",
  },
  userCount: {
    fontSize: "14px",
    color: "#666",
    backgroundColor: "#f8f9fa",
    padding: "4px 12px",
    borderRadius: "4px",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    margin: "0 auto",
    display: "block",
  },
  select: {
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "13px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  actionBtn: {
    padding: "4px 12px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "4px",
  },
  deleteBtn: {
    padding: "4px 12px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  bulkDeleteBtn: {
    padding: "6px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  resolvedBadge: {
    color: "#28a745",
    fontSize: "14px",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "18px",
    color: "#666",
  },
  error: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "18px",
    color: "#dc3545",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    padding: "40px",
  },
};

export default AdminDashboard;
