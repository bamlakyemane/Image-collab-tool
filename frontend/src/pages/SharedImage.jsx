// frontend/src/pages/SharedImage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSharedImage } from "../services/imageService";
import { useAuth } from "../context/AuthContext";
import SharedImageViewer from "../components/SharedImageViewer";

console.log("=== SHARED IMAGE MODULE LOADED ===");

const SharedImage = () => {
  console.log("=== SharedImage Component RENDERED ===");

  const { token } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [image, setImage] = useState(null);
  const [shareLink, setShareLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  console.log("SharedImage - Token:", token);
  console.log("SharedImage - isAuthenticated:", isAuthenticated);
  console.log("SharedImage - authLoading:", authLoading);

  // Wait for auth to finish loading
  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true);
      console.log("Auth check complete, isAuthenticated:", isAuthenticated);
    }
  }, [authLoading, isAuthenticated]);

  // Handle redirect after login and load image
  useEffect(() => {
    // Check if we have a redirect from login
    const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");
    console.log("SharedImage - redirectAfterLogin:", redirectAfterLogin);

    // If user is authenticated and there's a redirect, use it
    if (isAuthenticated && redirectAfterLogin) {
      console.log("Authenticated with redirect, going to:", redirectAfterLogin);
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectAfterLogin;
      return;
    }

    // Don't do anything until auth is checked
    if (!authChecked) {
      console.log("Waiting for auth check...");
      return;
    }

    console.log("Auth checked, loading image...");
    loadSharedImage();
  }, [token, isAuthenticated, authChecked]);

  const loadSharedImage = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading shared image for token:", token);
      console.log("User authenticated:", isAuthenticated);

      const result = await getSharedImage(token);

      console.log("API Result:", result);

      if (result.success === true) {
        setImage(result.image);
        setShareLink(result.shareLink);
        setRequiresLogin(false);
        console.log("Image loaded successfully!");
      } else {
        if (result.requiresLogin === true) {
          console.log("Login required - showing login screen");
          setRequiresLogin(true);
          setError("Login required to view this image");
        } else {
          setError(result.message || "Failed to load shared image");
        }
      }
    } catch (err) {
      console.error("Error loading shared image:", err);
      if (!isAuthenticated) {
        console.log("Not authenticated - showing login screen");
        setRequiresLogin(true);
        setError("Login required to view this image");
      } else {
        setError("This share link may be expired or invalid.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    console.log("=== Login button clicked ===");
    const redirectUrl = `/shared/${token}`;
    sessionStorage.setItem("redirectAfterLogin", redirectUrl);
    window.location.href = "/login";
  };

  const handleSignupClick = () => {
    console.log("=== Signup button clicked ===");
    const redirectUrl = `/shared/${token}`;
    sessionStorage.setItem("redirectAfterLogin", redirectUrl);
    window.location.href = "/signup";
  };

  // Show login required screen
  if (requiresLogin && !isAuthenticated) {
    console.log("Rendering login required screen");
    return (
      <div style={styles.container}>
        <div style={styles.loginRequiredCard}>
          <div style={styles.lockIcon}>🔒</div>
          <h2 style={styles.loginTitle}>Login Required</h2>
          <p style={styles.loginMessage}>
            This shared image requires you to be logged in to view it.
          </p>
          <div style={styles.loginActions}>
            <button onClick={handleLoginClick} style={styles.loginBtn}>
              Log In
            </button>
            <button onClick={handleSignupClick} style={styles.signupBtn}>
              Sign Up
            </button>
          </div>
          <Link to="/" style={styles.homeLink}>
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading || authLoading || !authChecked) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading shared image...</div>
      </div>
    );
  }

  if (error || !image) {
    console.log("Rendering error state:", error);
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>🔗</div>
          <h2 style={styles.errorTitle}>Share Link Not Found</h2>
          <p style={styles.errorMessage}>
            {error || "The image could not be found"}
          </p>
          <Link to="/" style={styles.homeLink}>
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show the image with interactive pins and comments
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📸 Shared Image</h1>
        <div style={styles.headerInfo}>
          <span>Shared by: {image?.owner?.name || "Unknown"}</span>
          {shareLink?.requiresLogin && (
            <span style={styles.badge}>🔒 Login Required</span>
          )}
          {shareLink?.expirationDate ? (
            <span style={styles.badge}>
              Expires: {new Date(shareLink.expirationDate).toLocaleDateString()}
            </span>
          ) : (
            <span style={styles.badge}>No expiration</span>
          )}
          <span style={styles.badge}>📌 {image?.pins?.length || 0} pins</span>
        </div>
      </div>

      {/* Interactive Image Viewer with Pins and Comments */}
      <div style={styles.viewerContainer}>
        <SharedImageViewer
          imageId={image.id}
          imageUrl={image.fileUrl}
          initialPins={image?.pins || []}
        />
      </div>

      <div style={styles.cta}>
        <Link to="/" style={styles.ctaButton}>
          🚀 Try Image Collaboration Tool
        </Link>
      </div>
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
    padding: "20px 30px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  headerInfo: {
    marginTop: "10px",
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    fontSize: "14px",
    color: "#666",
  },
  badge: {
    backgroundColor: "#e9ecef",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  viewerContainer: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  loginRequiredCard: {
    backgroundColor: "white",
    padding: "60px 40px",
    borderRadius: "10px",
    textAlign: "center",
    maxWidth: "500px",
    margin: "40px auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  lockIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  loginTitle: {
    marginBottom: "10px",
    color: "#333",
  },
  loginMessage: {
    color: "#666",
    margin: "20px 0",
  },
  loginActions: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    margin: "20px 0",
  },
  loginBtn: {
    padding: "10px 30px",
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: "6px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  signupBtn: {
    padding: "10px 30px",
    backgroundColor: "#28a745",
    color: "white",
    borderRadius: "6px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  homeLink: {
    display: "inline-block",
    padding: "10px 30px",
    backgroundColor: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    marginTop: "10px",
  },
  errorCard: {
    backgroundColor: "white",
    padding: "60px 40px",
    borderRadius: "10px",
    textAlign: "center",
    maxWidth: "500px",
    margin: "40px auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  errorIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  errorTitle: {
    marginBottom: "10px",
    color: "#333",
  },
  errorMessage: {
    color: "#666",
    margin: "20px 0",
  },
  loading: {
    textAlign: "center",
    padding: "60px",
    color: "#666",
    fontSize: "18px",
  },
  cta: {
    textAlign: "center",
    padding: "20px",
  },
  ctaButton: {
    display: "inline-block",
    padding: "12px 30px",
    backgroundColor: "#28a745",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "500",
  },
};

export default SharedImage;
