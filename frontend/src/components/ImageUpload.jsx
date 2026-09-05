// frontend/src/components/ImageUpload.jsx

import React, { useState, useRef } from "react";
import { uploadMultipleImages } from "../services/imageService";

const ImageUpload = ({ onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter only image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setError("Please select only image files");
      return;
    }

    if (imageFiles.length !== files.length) {
      setError("Some files were skipped because they are not images");
    }

    setSelectedFiles(imageFiles);

    // Create previews
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setError("");
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Filter only image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setError("Please drop only image files");
      return;
    }

    if (imageFiles.length !== files.length) {
      setError("Some files were skipped because they are not images");
    }

    setSelectedFiles(imageFiles);

    // Create previews
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setError("");
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const result = await uploadMultipleImages(selectedFiles);

      if (result.success) {
        setSelectedFiles([]);
        setPreviews([]);
        setUploadProgress(100);

        if (onUploadSuccess) {
          onUploadSuccess(result.images);
        }

        alert(`Successfully uploaded ${result.count} images!`);
      } else {
        setError(result.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);

    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.uploadArea,
          borderColor: isDragging ? "#007bff" : "#ddd",
          backgroundColor: isDragging ? "#e8f0fe" : "#fafafa",
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {previews.length === 0 ? (
          <div style={styles.dropZone} onClick={openFileDialog}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={styles.fileInput}
              id="fileInput"
              multiple
            />
            <label htmlFor="fileInput" style={styles.label}>
              <div style={styles.icon}>📸</div>
              <div style={styles.text}>Click to upload or drag & drop</div>
              <div style={styles.subtext}>
                PNG, JPG, GIF, WEBP and other image formats
              </div>
              <div style={styles.subtext}>No file size or count limits</div>
            </label>
          </div>
        ) : (
          <div style={styles.previewGrid}>
            {previews.map((preview, index) => (
              <div key={index} style={styles.previewItem}>
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  style={styles.previewImage}
                />
                <button
                  onClick={() => removeFile(index)}
                  style={styles.removeBtn}
                  disabled={uploading}
                >
                  ✕
                </button>
                <div style={styles.fileName}>{selectedFiles[index]?.name}</div>
              </div>
            ))}
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {previews.length > 0 && (
          <div style={styles.actions}>
            <button
              onClick={() => {
                previews.forEach((preview) => URL.revokeObjectURL(preview));
                setPreviews([]);
                setSelectedFiles([]);
              }}
              style={styles.clearBtn}
              disabled={uploading}
            >
              Clear All
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              style={styles.uploadBtn}
            >
              {uploading
                ? `Uploading ${Math.round(uploadProgress)}%...`
                : `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? "s" : ""}`}
            </button>
          </div>
        )}

        {uploading && (
          <div style={styles.progressBar}>
            <div
              style={{ ...styles.progressFill, width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },
  uploadArea: {
    border: "2px dashed #ddd",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#fafafa",
    transition: "all 0.2s",
  },
  dropZone: {
    position: "relative",
    cursor: "pointer",
  },
  fileInput: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    display: "none", // Hidden, we use the click handler
  },
  label: {
    display: "block",
    padding: "40px 20px",
    cursor: "pointer",
  },
  icon: {
    fontSize: "48px",
    marginBottom: "10px",
  },
  text: {
    fontSize: "18px",
    color: "#333",
    marginBottom: "5px",
  },
  subtext: {
    fontSize: "14px",
    color: "#999",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "15px",
    padding: "10px",
  },
  previewItem: {
    position: "relative",
    aspectRatio: "1",
    overflow: "hidden",
    borderRadius: "8px",
    border: "1px solid #eee",
    backgroundColor: "#f0f0f0",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    backgroundColor: "rgba(220, 53, 69, 0.9)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  fileName: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    fontSize: "10px",
    padding: "4px 6px",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  actions: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginTop: "15px",
  },
  uploadBtn: {
    padding: "10px 30px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  clearBtn: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  error: {
    marginTop: "10px",
    color: "#dc3545",
    fontSize: "14px",
  },
  progressBar: {
    width: "100%",
    height: "6px",
    backgroundColor: "#e9ecef",
    borderRadius: "3px",
    marginTop: "10px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#28a745",
    transition: "width 0.3s ease",
  },
};

export default ImageUpload;
