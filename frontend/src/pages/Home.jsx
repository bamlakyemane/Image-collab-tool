// frontend/src/pages/Home.jsx

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={styles.container}>
      {/* ===== NAVBAR ===== */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <Link to="/" style={styles.logo}>
            📸 ImageCollab
          </Link>
          <div style={styles.navLinks}>
            {isAuthenticated ? (
              <Link to="/library" style={styles.primaryBtn}>
                Go to Library
              </Link>
            ) : (
              <>
                <Link to="/login" style={styles.secondaryBtn}>
                  Log In
                </Link>
                <Link to="/signup" style={styles.primaryBtn}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroText}>
            <span style={styles.heroBadge}>
              ✨ Real-time collaboration made simple
            </span>
            <h1 style={styles.heroTitle}>
              Collaborate on Images,{" "}
              <span style={styles.gradientText}>Together in Real-Time</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Share images, pin comments on exact spots, and collaborate with
              your team instantly. No more back-and-forth emails or messy group
              chats.
            </p>
            <div style={styles.heroButtons}>
              <Link to="/signup" style={styles.heroCta}>
                Get Started Free →
              </Link>
              <Link to="/login" style={styles.heroSecondary}>
                Sign In
              </Link>
            </div>
            <div style={styles.heroStats}>
              <div style={styles.stat}>
                <span style={styles.statNumber}>Real-time</span>
                <span style={styles.statLabel}>Live updates</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>Pin-based</span>
                <span style={styles.statLabel}>Exact spot comments</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>Secure</span>
                <span style={styles.statLabel}>Shareable links</span>
              </div>
            </div>
          </div>

          {/* Hero Image Mockup */}
          <div style={styles.heroImage}>
            <div style={styles.mockup}>
              <div style={styles.mockupHeader}>
                <span style={styles.dot}></span>
                <span style={styles.dot}></span>
                <span style={styles.dot}></span>
              </div>
              <div style={styles.mockupBody}>
                <div style={styles.mockupImage}>
                  <div style={styles.pin} title="Comment pin">
                    1
                  </div>
                  <div style={styles.pin2} title="Comment pin">
                    2
                  </div>
                </div>
                <div style={styles.mockupSidebar}>
                  <div style={styles.mockupComment}>
                    <strong>Jane:</strong> Love this design!
                  </div>
                  <div style={styles.mockupComment}>
                    <strong>John:</strong> Can we change the color?
                  </div>
                  <div style={styles.mockupComment}>
                    <strong>Jane:</strong> Sure, on it! ✨
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section style={styles.features}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Everything You Need</h2>
          <p style={styles.sectionSubtitle}>
            Powerful features for seamless image collaboration
          </p>
        </div>

        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📌</div>
            <h3 style={styles.featureTitle}>Pin-Based Comments</h3>
            <p style={styles.featureDesc}>
              Click anywhere on an image to leave a comment exactly where it
              matters.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Real-Time Updates</h3>
            <p style={styles.featureDesc}>
              See comments and replies appear instantly without refreshing the
              page.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔗</div>
            <h3 style={styles.featureTitle}>Shareable Links</h3>
            <p style={styles.featureDesc}>
              Generate secure links with expiration dates to share with anyone.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📧</div>
            <h3 style={styles.featureTitle}>Email Notifications</h3>
            <p style={styles.featureDesc}>
              Get notified when someone comments or replies to your threads.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔍</div>
            <h3 style={styles.featureTitle}>Search & Filters</h3>
            <p style={styles.featureDesc}>
              Find comments quickly with powerful search and filter options.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>👑</div>
            <h3 style={styles.featureTitle}>Admin Controls</h3>
            <p style={styles.featureDesc}>
              Manage users, moderate content, and keep your platform safe.
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={styles.howItWorks}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>Get started in 3 simple steps</p>
        </div>

        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Upload an Image</h3>
            <p style={styles.stepDesc}>
              Drag and drop your image into your library.
            </p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Pin Comments</h3>
            <p style={styles.stepDesc}>
              Click anywhere on the image to leave feedback.
            </p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Share & Collaborate</h3>
            <p style={styles.stepDesc}>
              Send the link to your team and collaborate live.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Start Collaborating?</h2>
          <p style={styles.ctaSubtitle}>
            Join thousands of teams already using ImageCollab.
          </p>
          <Link to="/signup" style={styles.ctaButton}>
            Get Started — It's Free →
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLogo}>📸 ImageCollab</div>
          <p style={styles.footerText}>
            Real-time image collaboration for modern teams.
          </p>
          <div style={styles.footerLinks}>
            <Link to="/login" style={styles.footerLink}>
              Login
            </Link>
            <Link to="/signup" style={styles.footerLink}>
              Sign Up
            </Link>
          </div>
          <p style={styles.footerCopyright}>
            © {new Date().getFullYear()} ImageCollab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
  },

  // ===== NAVBAR =====
  navbar: {
    position: "sticky",
    top: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #f0f0f0",
    zIndex: 100,
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a2e",
    textDecoration: "none",
  },
  navLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  secondaryBtn: {
    padding: "8px 18px",
    color: "#1a1a2e",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    borderRadius: "8px",
  },
  primaryBtn: {
    padding: "10px 22px",
    backgroundColor: "#4F46E5",
    color: "white",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
  },

  // ===== HERO =====
  hero: {
    padding: "80px 24px 60px",
    background: "linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)",
  },
  heroContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "60px",
    alignItems: "center",
  },
  heroText: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  heroBadge: {
    display: "inline-block",
    padding: "6px 14px",
    backgroundColor: "#EEF2FF",
    color: "#4F46E5",
    borderRadius: "100px",
    fontSize: "13px",
    fontWeight: "600",
    width: "fit-content",
  },
  heroTitle: {
    fontSize: "52px",
    fontWeight: "800",
    lineHeight: "1.1",
    color: "#1a1a2e",
    margin: 0,
  },
  gradientText: {
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "18px",
    color: "#666",
    lineHeight: "1.6",
    margin: 0,
  },
  heroButtons: {
    display: "flex",
    gap: "14px",
    marginTop: "10px",
  },
  heroCta: {
    padding: "14px 28px",
    backgroundColor: "#4F46E5",
    color: "white",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 6px 20px rgba(79, 70, 229, 0.35)",
  },
  heroSecondary: {
    padding: "14px 28px",
    backgroundColor: "white",
    color: "#1a1a2e",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    border: "2px solid #e5e7eb",
  },
  heroStats: {
    display: "flex",
    gap: "30px",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statNumber: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#4F46E5",
  },
  statLabel: {
    fontSize: "13px",
    color: "#888",
  },

  // ===== HERO IMAGE MOCKUP =====
  heroImage: {
    display: "flex",
    justifyContent: "center",
  },
  mockup: {
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  mockupHeader: {
    display: "flex",
    gap: "6px",
    padding: "12px 16px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
  },
  mockupBody: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    height: "300px",
  },
  mockupImage: {
    backgroundColor: "#dbeafe",
    position: "relative",
    backgroundImage: "linear-gradient(135deg, #93c5fd, #bfdbfe)",
  },
  pin: {
    position: "absolute",
    top: "30%",
    left: "25%",
    width: "28px",
    height: "28px",
    backgroundColor: "#ef4444",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    border: "2px solid white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  pin2: {
    position: "absolute",
    top: "60%",
    left: "65%",
    width: "28px",
    height: "28px",
    backgroundColor: "#10b981",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    border: "2px solid white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  mockupSidebar: {
    backgroundColor: "#f9fafb",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderLeft: "1px solid #e5e7eb",
  },
  mockupComment: {
    fontSize: "11px",
    padding: "6px 8px",
    backgroundColor: "white",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    color: "#555",
  },

  // ===== FEATURES =====
  features: {
    padding: "80px 24px",
    backgroundColor: "#ffffff",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "50px",
  },
  sectionTitle: {
    fontSize: "40px",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: "0 0 12px 0",
  },
  sectionSubtitle: {
    fontSize: "18px",
    color: "#666",
    margin: 0,
  },
  featuresGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  featureCard: {
    padding: "32px",
    backgroundColor: "#f9fafb",
    borderRadius: "16px",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s",
  },
  featureIcon: {
    fontSize: "36px",
    marginBottom: "16px",
  },
  featureTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 10px 0",
  },
  featureDesc: {
    fontSize: "15px",
    color: "#666",
    lineHeight: "1.6",
    margin: 0,
  },

  // ===== HOW IT WORKS =====
  howItWorks: {
    padding: "80px 24px",
    backgroundColor: "#f9fafb",
  },
  stepsGrid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  stepCard: {
    padding: "32px",
    backgroundColor: "white",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  stepNumber: {
    width: "48px",
    height: "48px",
    margin: "0 auto 16px",
    backgroundColor: "#4F46E5",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "700",
  },
  stepTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 10px 0",
  },
  stepDesc: {
    fontSize: "15px",
    color: "#666",
    lineHeight: "1.6",
    margin: 0,
  },

  // ===== CTA =====
  ctaSection: {
    padding: "80px 24px",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
  },
  ctaContent: {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
    color: "white",
  },
  ctaTitle: {
    fontSize: "42px",
    fontWeight: "800",
    margin: "0 0 16px 0",
  },
  ctaSubtitle: {
    fontSize: "18px",
    opacity: 0.9,
    margin: "0 0 32px 0",
  },
  ctaButton: {
    display: "inline-block",
    padding: "16px 36px",
    backgroundColor: "white",
    color: "#4F46E5",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "17px",
    fontWeight: "700",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },

  // ===== FOOTER =====
  footer: {
    backgroundColor: "#1a1a2e",
    color: "white",
    padding: "40px 24px",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
  },
  footerLogo: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "12px",
  },
  footerText: {
    color: "#a0a0b0",
    fontSize: "15px",
    marginBottom: "20px",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    marginBottom: "20px",
  },
  footerLink: {
    color: "#a0a0b0",
    textDecoration: "none",
    fontSize: "15px",
  },
  footerCopyright: {
    color: "#666",
    fontSize: "13px",
    margin: 0,
  },
};

export default Home;
