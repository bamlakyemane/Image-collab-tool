// frontend/src/components/ShareModal.jsx

import React, { useState, useEffect } from "react";
import {
  generateShareLink,
  toggleShareLink,
  revokeShareLink,
  getShareLinks,
} from "../services/imageService";

const ShareModal = ({ image, onClose, onUpdate }) => {
  const [expirationDate, setExpirationDate] = useState("");
  const [requiresLogin, setRequiresLogin] = useState(true);
  const [shareLinks, setShareLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [fetchingLinks, setFetchingLinks] = useState(true);
  const [generatedLink, setGeneratedLink] = useState("");
  const [showGenerated, setShowGenerated] = useState(false);

  useEffect(() => {
    loadShareLinks();
  }, [image.id]);

  const loadShareLinks = async () => {
    try {
      setFetchingLinks(true);
      const result = await getShareLinks(image.id);
      if (result.success) {
        setShareLinks(result.shareLinks);
      }
    } catch (err) {
      console.error("Failed to load share links:", err);
    } finally {
      setFetchingLinks(false);
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    setError("");
    setShowGenerated(false);

    try {
      const result = await generateShareLink(image.id, expirationDate || null);

      if (result.success) {
        setShareLinks([result.shareLink, ...shareLinks]);
        setGeneratedLink(result.shareUrl);
        setShowGenerated(true);

        if (onUpdate) onUpdate();
      } else {
        setError(result.message || "Failed to generate share link");
      }
    } catch (err) {
      console.error("Generate link error:", err);
      setError("Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Failed to copy link. Please copy manually.");
    }
  };

  const handleToggleLink = async (linkId) => {
    try {
      const result = await toggleShareLink(linkId);
      if (result.success) {
        setShareLinks(
          shareLinks.map((link) =>
            link.id === linkId ? result.shareLink : link,
          ),
        );
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error("Toggle link error:", err);
      alert("Failed to update link status");
    }
  };

  const handleRevokeLink = async (linkId) => {
    if (
      !confirm(
        "⚠️ Are you sure you want to delete this share link?\n\nThis action cannot be undone.",
      )
    )
      return;

    try {
      const result = await revokeShareLink(linkId);
      if (result.success) {
        // Remove the link from the list
        setShareLinks(shareLinks.filter((link) => link.id !== linkId));
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error("Revoke link error:", err);
      alert("Failed to delete share link");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLinkStatus = (link) => {
    if (!link.isActive) return { text: "Revoked", color: "#dc3545" };
    if (link.expirationDate && new Date(link.expirationDate) < new Date()) {
      return { text: "Expired", color: "#ffc107" };
    }
    return { text: "Active", color: "#28a745" };
  };

  const isLinkExpired = (link) => {
    return link.expirationDate && new Date(link.expirationDate) < new Date();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>🔗 Share Image</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.imageInfo}>
            <img
              src={`http://localhost:5000${image.fileUrl}`}
              alt={image.fileName}
              style={styles.thumbnail}
            />
            <span style={styles.fileName}>{image.fileName}</span>
          </div>

          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Generate New Share Link</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Expiration Date (optional)</label>
              <input
                type="datetime-local"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                style={styles.input}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={requiresLogin}
                  style={styles.checkbox}
                  disabled
                />
                🔒 Requires login to view{" "}
                <span style={styles.requiredBadge}>(Required - v1)</span>
              </label>
              <span style={styles.hint}>
                All shared images require login for security (v1 requirement)
              </span>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              onClick={handleGenerateLink}
              disabled={loading}
              style={styles.generateBtn}
            >
              {loading ? "Generating..." : "🔗 Generate Share Link"}
            </button>

            {showGenerated && generatedLink && (
              <div style={styles.generatedLinkContainer}>
                <div style={styles.generatedLinkHeader}>
                  <span style={styles.generatedLabel}>
                    ✅ Share Link Generated!
                  </span>
                </div>
                <div style={styles.generatedLinkBox}>
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    style={styles.generatedLinkInput}
                  />
                  <button onClick={handleCopyLink} style={styles.copyBtn}>
                    {copied ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>
                {copied && (
                  <div style={styles.copiedMessage}>
                    ✅ Link copied to clipboard! Share it with others.
                  </div>
                )}
              </div>
            )}
          </div>

          {fetchingLinks ? (
            <div style={styles.loadingLinks}>Loading existing links...</div>
          ) : shareLinks.length > 0 ? (
            <div style={styles.linksSection}>
              <h3 style={styles.sectionTitle}>
                Existing Share Links ({shareLinks.length})
              </h3>
              <div style={styles.linksList}>
                {shareLinks.map((link) => {
                  const status = getLinkStatus(link);
                  const expired = isLinkExpired(link);

                  return (
                    <div key={link.id} style={styles.linkItem}>
                      <div style={styles.linkInfo}>
                        <div style={styles.linkUrl}>
                          {`${window.location.origin}/shared/${link.token}`}
                        </div>
                        <div style={styles.linkDetails}>
                          <span
                            style={{ ...styles.status, color: status.color }}
                          >
                            ● {status.text}
                          </span>
                          {link.requiresLogin && (
                            <span style={styles.badge}>🔒 Login Required</span>
                          )}
                          {link.expirationDate && (
                            <span style={styles.expiration}>
                              {expired ? "⏰ Expired" : "Expires"}:{" "}
                              {formatDate(link.expirationDate)}
                            </span>
                          )}
                          <span style={styles.createdAt}>
                            Created: {formatDate(link.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div style={styles.linkActions}>
                        {/* Active and not expired */}
                        {link.isActive && !expired && (
                          <>
                            <button
                              onClick={() => handleToggleLink(link.id)}
                              style={styles.deactivateBtn}
                            >
                              ⏸️ Deactivate
                            </button>
                            <button
                              onClick={() => handleRevokeLink(link.id)}
                              style={styles.revokeBtn}
                            >
                              🗑️ Revoke
                            </button>
                          </>
                        )}

                        {/* Inactive (deactivated) and not expired */}
                        {!link.isActive && !expired && (
                          <>
                            <button
                              onClick={() => handleToggleLink(link.id)}
                              style={styles.activateBtn}
                            >
                              ▶️ Activate
                            </button>
                            <button
                              onClick={() => handleRevokeLink(link.id)}
                              style={styles.revokeBtn}
                            >
                              🗑️ Revoke
                            </button>
                          </>
                        )}

                        {/* Expired - only show Delete */}
                        {expired && (
                          <button
                            onClick={() => handleRevokeLink(link.id)}
                            style={styles.deleteBtn}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={styles.noLinks}>No share links created yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "700px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 25px",
    borderBottom: "1px solid #eee",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    color: "#333",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
    padding: "0 5px",
  },
  body: {
    padding: "25px",
  },
  imageInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  fileName: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  },
  formSection: {
    marginBottom: "25px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "15px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  hint: {
    display: "block",
    fontSize: "12px",
    color: "#999",
    marginTop: "4px",
    marginLeft: "26px",
  },
  requiredBadge: {
    fontSize: "11px",
    color: "#dc3545",
    fontWeight: "600",
    marginLeft: "4px",
  },
  generateBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  error: {
    padding: "10px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "6px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  generatedLinkContainer: {
    marginTop: "15px",
    padding: "15px",
    backgroundColor: "#d4edda",
    borderRadius: "8px",
    border: "1px solid #c3e6cb",
  },
  generatedLinkHeader: {
    marginBottom: "8px",
  },
  generatedLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#155724",
  },
  generatedLinkBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  generatedLinkInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #b8daff",
    borderRadius: "4px",
    fontSize: "13px",
    backgroundColor: "white",
    color: "#333",
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  copyBtn: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  copiedMessage: {
    marginTop: "8px",
    padding: "8px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "4px",
    textAlign: "center",
    fontSize: "14px",
  },
  linksSection: {
    borderTop: "1px solid #eee",
    paddingTop: "20px",
  },
  linksList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "300px",
    overflowY: "auto",
  },
  linkItem: {
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },
  linkInfo: {
    marginBottom: "10px",
  },
  linkUrl: {
    fontSize: "13px",
    color: "#007bff",
    wordBreak: "break-all",
    marginBottom: "6px",
    fontFamily: "monospace",
  },
  linkDetails: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    fontSize: "12px",
    color: "#666",
  },
  status: {
    fontWeight: "600",
    fontSize: "13px",
  },
  badge: {
    backgroundColor: "#e9ecef",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
  },
  expiration: {
    color: "#888",
  },
  createdAt: {
    color: "#888",
  },
  linkActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "8px",
  },
  deactivateBtn: {
    padding: "4px 12px",
    backgroundColor: "#ffc107",
    color: "#333",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  activateBtn: {
    padding: "4px 12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  revokeBtn: {
    padding: "4px 12px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  deleteBtn: {
    padding: "4px 12px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  loadingLinks: {
    textAlign: "center",
    padding: "20px",
    color: "#999",
    fontSize: "14px",
  },
  noLinks: {
    textAlign: "center",
    padding: "20px",
    color: "#999",
    fontSize: "14px",
  },
};

export default ShareModal;
