// frontend/src/pages/Library.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // ← Link is needed for admin button
import { useAuth } from "../context/AuthContext";
import ImageUpload from "../components/ImageUpload";
import ShareModal from "../components/ShareModal"; // ← ADD THIS
import {
  getUserImages,
  generateShareLink,
  deleteImage,
} from "../services/imageService";

const Library = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // ← ADD THIS
  const [showShareModal, setShowShareModal] = useState(false); // ← ADD THIS

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const result = await getUserImages();
      if (result.success) {
        setImages(result.images);
      }
    } catch (err) {
      console.error("Failed to load images:", err);
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newImages) => {
    const imagesArray = Array.isArray(newImages) ? newImages : [newImages];
    setImages([...imagesArray, ...images]);
    setShowUpload(false);
  };

  const handleView = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  // ✅ NEW: Share click that opens the modal
  const handleShareClick = (image) => {
    setSelectedImage(image);
    setShowShareModal(true);
  };

  // ✅ OLD: Keeping this for compatibility (if needed elsewhere)
  const handleShare = async (imageId) => {
    try {
      const result = await generateShareLink(imageId);
      if (result.success) {
        await navigator.clipboard.writeText(result.shareUrl);
        alert("Share link copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to generate share link:", err);
      alert("Failed to generate share link");
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const result = await deleteImage(imageId);
      if (result.success) {
        setImages(images.filter((img) => img.id !== imageId));
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Failed to delete image");
    }
  };

  // Helper function to get activity text
  const getActivityText = (activity) => {
    if (!activity) return "No activity yet";

    const actionMap = {
      upload: "📤 Uploaded",
      share: "🔗 Shared",
      comment: "💬 Commented",
      resolve: "✅ Resolved",
      reopen: "🔄 Reopened",
      revoke: "🚫 Revoked",
    };

    const actionText = actionMap[activity.action] || activity.action;
    const userName = activity.user?.name || "Someone";
    return `${userName} ${actionText}`;
  };

  // Helper function to format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };
  console.log("Library - User role:", user?.role);
  console.log(
    "Library - Is admin?",
    user?.role === "admin" || user?.role === "super_admin",
  );
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📸 Image Library</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {user?.name}!</span>

          {/* ✅ Admin button (only visible to admin/super_admin) */}
          {user?.role && user.role.includes("admin") && (
            <Link to="/admin" style={styles.adminLink}>
              ⚙️ Admin
            </Link>
          )}

          <button
            onClick={() => setShowUpload(!showUpload)}
            style={styles.uploadBtn}
          >
            {showUpload ? "Cancel" : "+ Upload"}
          </button>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {showUpload && (
          <div style={styles.uploadSection}>
            <ImageUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.loading}>Loading your images...</div>
        ) : images.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🖼️</div>
            <h2>No images yet</h2>
            <p>Upload your first image to get started!</p>
            <button onClick={() => setShowUpload(true)} style={styles.emptyBtn}>
              Upload Image
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {images.map((image) => (
              <div key={image.id} style={styles.card}>
                <div style={styles.imageContainer}>
                  <img
                    src={`http://localhost:5000${image.fileUrl}`}
                    alt={image.fileName}
                    style={styles.image}
                  />
                  <div style={styles.imageOverlay}>
                    <span style={styles.commentCount}>
                      💬 {image._count?.pins || 0}
                    </span>
                  </div>
                </div>
                <div style={styles.cardInfo}>
                  <div style={styles.cardHeader}>
                    <span style={styles.fileName} title={image.fileName}>
                      {image.fileName}
                    </span>
                  </div>

                  <div style={styles.cardDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>📅 Uploaded:</span>
                      <span style={styles.detailValue}>
                        {new Date(image.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>💬 Comments:</span>
                      <span style={styles.detailValue}>
                        {image._count?.pins || 0}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>🔄 Last Activity:</span>
                      <span style={styles.detailValue}>
                        {image.lastActivityDetails ? (
                          <>
                            {getActivityText(image.lastActivityDetails)}
                            <span style={styles.timeAgo}>
                              {" "}
                              ({timeAgo(image.lastActivity)})
                            </span>
                          </>
                        ) : (
                          "No activity yet"
                        )}
                      </span>
                    </div>
                    {image.shareLinks && image.shareLinks.length > 0 && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>🔗 Share Links:</span>
                        <span style={styles.detailValue}>
                          {image.shareLinks.filter((l) => l.isActive).length}{" "}
                          Active
                          {image.shareLinks.filter((l) => !l.isActive).length >
                            0 &&
                            ` (${image.shareLinks.filter((l) => !l.isActive).length} Revoked)`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleView(image.id)}
                      style={styles.viewBtn}
                    >
                      👁️ View
                    </button>
                    {/* ✅ Share button opens the modal */}
                    <button
                      onClick={() => handleShareClick(image)}
                      style={styles.shareBtn}
                    >
                      🔗 Share
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      style={styles.deleteBtn}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ✅ Share Modal */}
      {showShareModal && selectedImage && (
        <ShareModal
          image={selectedImage}
          onClose={() => setShowShareModal(false)}
          onUpdate={loadImages}
        />
      )}
    </div>
  );
};

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
    flexWrap: "wrap",
    gap: "10px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  adminLink: {
    padding: "6px 14px",
    backgroundColor: "#6f42c1",
    color: "white",
    borderRadius: "4px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
  uploadBtn: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  main: {
    padding: "40px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  uploadSection: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "25px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  imageContainer: {
    width: "100%",
    height: "200px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  imageOverlay: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  commentCount: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  cardInfo: {
    padding: "15px",
  },
  cardHeader: {
    marginBottom: "10px",
  },
  fileName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardDetails: {
    marginBottom: "12px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    fontSize: "13px",
    borderBottom: "1px solid #f5f5f5",
  },
  detailLabel: {
    color: "#888",
  },
  detailValue: {
    color: "#333",
    fontWeight: "500",
  },
  timeAgo: {
    color: "#888",
    fontWeight: "400",
    fontSize: "12px",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #eee",
  },
  viewBtn: {
    flex: 1,
    padding: "6px 12px",
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  shareBtn: {
    flex: 1,
    padding: "6px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  deleteBtn: {
    flex: 1,
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyBtn: {
    marginTop: "20px",
    padding: "10px 30px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
  loading: {
    textAlign: "center",
    padding: "60px",
    color: "#666",
    fontSize: "18px",
  },
  error: {
    color: "#dc3545",
    textAlign: "center",
    padding: "20px",
  },
};

export default Library;
