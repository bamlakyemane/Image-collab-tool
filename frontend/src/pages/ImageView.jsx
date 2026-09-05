// frontend/src/pages/ImageView.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getImage } from "../services/imageService";
import { initializeSocket } from "../services/socket";
import ImageViewer from "../components/ImageViewer";

const ImageView = () => {
  const { imageId } = useParams();
  const { token } = useAuth();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      initializeSocket(token);
    }
    loadImage();
  }, [imageId, token]);

  const loadImage = async () => {
    try {
      setLoading(true);
      const result = await getImage(imageId);
      if (result.success) {
        setImage(result.image);
      } else {
        setError(result.message || "Failed to load image");
      }
    } catch (err) {
      console.error("Failed to load image:", err);
      setError("Failed to load image");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading image...</div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>❌ {error || "Image not found"}</h2>
          <Link to="/library" style={styles.backLink}>
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/library" style={styles.backBtn}>
          ← Back to Library
        </Link>
        <h1 style={styles.title}>{image.fileName}</h1>
        <span style={styles.info}>{image.pins?.length || 0} comments</span>
      </header>
      <main style={styles.main}>
        <ImageViewer imageId={imageId} imageUrl={image.fileUrl} />
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  header: {
    backgroundColor: "white",
    padding: "15px 30px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  backBtn: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
  },
  title: {
    flex: 1,
    fontSize: "18px",
    margin: 0,
    color: "#333",
  },
  info: {
    fontSize: "14px",
    color: "#666",
    backgroundColor: "#f0f0f0",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  main: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  loading: {
    textAlign: "center",
    padding: "60px",
    color: "#666",
    fontSize: "18px",
  },
  errorCard: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "10px",
    textAlign: "center",
    maxWidth: "500px",
    margin: "40px auto",
  },
  backLink: {
    display: "inline-block",
    marginTop: "20px",
    color: "#007bff",
    textDecoration: "none",
  },
};

export default ImageView;
