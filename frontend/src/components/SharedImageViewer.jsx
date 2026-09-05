// frontend/src/components/SharedImageViewer.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useAuth } from "../context/AuthContext";
import {
  getSocket,
  joinImageRoom,
  leaveImageRoom,
  registerListener,
  removeListener,
} from "../services/socket";
import {
  createPin,
  addComment,
  togglePinStatus,
  getPins,
} from "../services/commentService";
import CommentSearch from "./CommentSearch";

const SharedImageViewer = ({ imageId, imageUrl, initialPins = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [addingPin, setAddingPin] = useState(false);
  const [newPinPosition, setNewPinPosition] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [socketConnected, setSocketConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    resolved: false,
    unresolved: false,
    myComments: false,
  });
  const imageRef = useRef(null);
  const transformRef = useRef(null);
  const forceUpdate = useRef(0);

  // Load pins
  useEffect(() => {
    if (initialPins && initialPins.length > 0) {
      console.log("📊 Using initialPins:", initialPins.length);
      setPins(initialPins);
    } else {
      loadPins();
    }
  }, [imageId]);

  const loadPins = async () => {
    try {
      setLoading(true);
      const result = await getPins(imageId);
      if (result.success) {
        console.log("📊 Loaded pins:", result.pins.length);
        setPins(result.pins);
      }
    } catch (error) {
      console.error("Failed to load pins:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter pins
  const getFilteredPins = useCallback(() => {
    let filteredPins = pins;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredPins = filteredPins.filter((pin) => {
        const commentMatch = pin.comments.some((comment) =>
          comment.content.toLowerCase().includes(term),
        );
        const creatorMatch = pin.creator?.name?.toLowerCase().includes(term);
        return commentMatch || creatorMatch;
      });
    }

    if (filters.resolved) {
      filteredPins = filteredPins.filter((pin) => pin.isResolved === true);
    }
    if (filters.unresolved) {
      filteredPins = filteredPins.filter((pin) => pin.isResolved === false);
    }
    if (filters.myComments && user) {
      filteredPins = filteredPins.filter((pin) =>
        pin.comments.some((comment) => comment.authorId === user.id),
      );
    }

    return filteredPins;
  }, [pins, searchTerm, filters, user]);

  const filteredPins = getFilteredPins();

  // Socket event handlers
  const handlePinAdded = useCallback(
    (data) => {
      if (Number(data.imageId) === Number(imageId)) {
        setPins((prevPins) => {
          const exists = prevPins.some((p) => p.id === data.pin.id);
          if (exists) return prevPins;
          forceUpdate.current += 1;
          return [data.pin, ...prevPins];
        });
      }
    },
    [imageId],
  );

  const handleCommentAdded = useCallback(
    (data) => {
      if (Number(data.imageId) === Number(imageId)) {
        setPins((prevPins) => {
          const updatedPins = prevPins.map((pin) => {
            if (pin.id === data.pinId) {
              return {
                ...pin,
                comments: [...pin.comments, data.comment],
              };
            }
            return pin;
          });
          forceUpdate.current += 1;
          return updatedPins;
        });
      }
    },
    [imageId],
  );

  const handlePinStatusChanged = useCallback(
    (data) => {
      if (Number(data.imageId) === Number(imageId)) {
        setPins((prevPins) => {
          const updatedPins = prevPins.map((pin) => {
            if (pin.id === data.pinId) {
              return { ...pin, isResolved: data.isResolved };
            }
            return pin;
          });
          forceUpdate.current += 1;
          return updatedPins;
        });
      }
    },
    [imageId],
  );

  // Setup socket
  useEffect(() => {
    if (!isAuthenticated) return;

    const socketInstance = getSocket();
    if (!socketInstance) return;

    setSocket(socketInstance);
    setSocketConnected(socketInstance.connected);
    joinImageRoom(imageId);

    registerListener("comment-added", handleCommentAdded);
    registerListener("pin-added", handlePinAdded);
    registerListener("pin-status-changed", handlePinStatusChanged);

    const handleConnect = () => {
      setSocketConnected(true);
      joinImageRoom(imageId);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    return () => {
      removeListener("comment-added", handleCommentAdded);
      removeListener("pin-added", handlePinAdded);
      removeListener("pin-status-changed", handlePinStatusChanged);
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      leaveImageRoom(imageId);
    };
  }, [
    imageId,
    isAuthenticated,
    handleCommentAdded,
    handlePinAdded,
    handlePinStatusChanged,
  ]);

  const handleImageClick = (e) => {
    if (!addingPin || !isAuthenticated) return;

    const imageElement = imageRef.current;
    if (!imageElement) return;

    const rect = imageElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    setNewPinPosition({ x: clampedX, y: clampedY });
    setAddingPin(false);
    setTimeout(() => {
      document.getElementById("pin-comment-input")?.focus();
    }, 100);
  };

  const handleAddPin = async () => {
    if (!commentText.trim() || !newPinPosition || !isAuthenticated) return;

    try {
      const result = await createPin(
        imageId,
        newPinPosition.x,
        newPinPosition.y,
        commentText,
      );

      if (result.success) {
        const newPin = result.pin;
        setPins((prev) => [newPin, ...prev]);
        setNewPinPosition(null);
        setCommentText("");

        if (socket && socketConnected) {
          socket.emit("new-pin", {
            imageId: imageId,
            pin: newPin,
            user: user,
          });
        }
      }
    } catch (error) {
      console.error("Failed to add pin:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleAddReply = async (pinId) => {
    if (!replyText.trim() || !isAuthenticated) return;

    try {
      const result = await addComment(pinId, replyText);

      if (result.success) {
        const newComment = result.comment;
        setPins((prev) => {
          return prev.map((pin) => {
            if (pin.id === pinId) {
              return {
                ...pin,
                comments: [...pin.comments, newComment],
              };
            }
            return pin;
          });
        });
        setReplyText("");
        setReplyingTo(null);

        if (socket && socketConnected) {
          socket.emit("new-comment", {
            imageId: imageId,
            pinId: pinId,
            comment: newComment,
            user: user,
          });
        }
      }
    } catch (error) {
      console.error("Failed to add reply:", error);
      alert("Failed to add reply. Please try again.");
    }
  };

  const handleToggleResolved = async (pinId) => {
    if (!isAuthenticated) return;

    try {
      const result = await togglePinStatus(pinId);
      if (result.success) {
        const updatedPin = result.pin;
        setPins((prev) => {
          return prev.map((pin) => {
            if (pin.id === pinId) {
              return updatedPin;
            }
            return pin;
          });
        });

        if (socket && socketConnected) {
          socket.emit("pin-resolved", {
            imageId: imageId,
            pinId: pinId,
            isResolved: updatedPin.isResolved,
          });
        }
      }
    } catch (error) {
      console.error("Failed to toggle pin status:", error);
      alert("Failed to update pin status. Please try again.");
    }
  };

  const getPinColor = (pin) => {
    if (pin.isResolved) return "#28a745";
    return "#ff4444";
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const handleZoomIn = () => {
    if (transformRef.current) {
      transformRef.current.zoomIn();
      setTimeout(() => {
        if (transformRef.current) {
          const state = transformRef.current.state;
          setZoomLevel(state.scale);
        }
      }, 50);
    }
  };

  const handleZoomOut = () => {
    if (transformRef.current) {
      transformRef.current.zoomOut();
      setTimeout(() => {
        if (transformRef.current) {
          const state = transformRef.current.state;
          setZoomLevel(state.scale);
        }
      }, 50);
    }
  };

  const handleReset = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
      setZoomLevel(1);
    }
  };

  const handleWheel = () => {
    setTimeout(() => {
      if (transformRef.current) {
        const state = transformRef.current.state;
        setZoomLevel(state.scale);
      }
    }, 50);
  };

  const totalComments = pins.reduce((acc, p) => acc + p.comments.length, 0);
  const filteredComments = filteredPins.reduce(
    (acc, p) => acc + p.comments.length,
    0,
  );

  return (
    <div style={styles.container}>
      <div style={styles.viewer}>
        <div style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            {isAuthenticated ? (
              <button
                onClick={() => setAddingPin(!addingPin)}
                style={{
                  ...styles.toolbarBtn,
                  backgroundColor: addingPin ? "#dc3545" : "#007bff",
                }}
              >
                {addingPin ? "Cancel" : "📌 Add Comment"}
              </button>
            ) : (
              <span style={styles.loginHint}>
                🔒{" "}
                <a href="/login" style={styles.loginLink}>
                  Login
                </a>{" "}
                to add comments
              </span>
            )}
            <span style={styles.hint}>
              {addingPin
                ? "Click anywhere on the image to place a pin"
                : 'Click "Add Comment" to start'}
            </span>
            {socketConnected && <span style={styles.liveBadge}>🔴 Live</span>}
          </div>
          <div style={styles.zoomControls}>
            <button
              onClick={handleZoomOut}
              style={styles.zoomBtn}
              title="Zoom Out"
            >
              🔍−
            </button>
            <span style={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={handleZoomIn}
              style={styles.zoomBtn}
              title="Zoom In"
            >
              🔍+
            </button>
            <button
              onClick={handleReset}
              style={styles.zoomBtn}
              title="Reset View"
            >
              ⟲
            </button>
          </div>
        </div>

        <div style={styles.imageWrapper}>
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            centerOnInit
            wheel={{ step: 0.1 }}
          >
            {() => (
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <div
                  style={styles.imageContainer}
                  onClick={handleImageClick}
                  onWheel={handleWheel}
                >
                  <img
                    ref={imageRef}
                    src={`http://localhost:5000${imageUrl}`}
                    alt="Shared Image"
                    style={styles.image}
                    draggable={false}
                  />

                  {pins.map((pin) => (
                    <div
                      key={pin.id}
                      style={{
                        ...styles.pin,
                        left: `${Math.max(0, Math.min(100, pin.xCoordinate * 100))}%`,
                        top: `${Math.max(0, Math.min(100, pin.yCoordinate * 100))}%`,
                        backgroundColor: getPinColor(pin),
                      }}
                      onClick={() =>
                        setSelectedPin(selectedPin === pin.id ? null : pin.id)
                      }
                      title={pin.comments[0]?.content || "Comment"}
                    >
                      <span style={styles.pinCount}>{pin.comments.length}</span>
                    </div>
                  ))}
                </div>
              </TransformComponent>
            )}
          </TransformWrapper>
        </div>

        {newPinPosition && (
          <div style={styles.newPinInput}>
            <textarea
              id="pin-comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your comment..."
              style={styles.textarea}
              rows={3}
            />
            <div style={styles.newPinActions}>
              <button
                onClick={() => setNewPinPosition(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={handleAddPin} style={styles.submitBtn}>
                Post Comment
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>
            💬 Comments ({filteredComments}/{totalComments})
          </h3>
          <CommentSearch onSearch={handleSearch} onFilter={handleFilter} />
        </div>

        {loading ? (
          <div style={styles.loading}>Loading comments...</div>
        ) : filteredPins.length === 0 ? (
          <div style={styles.empty}>
            {pins.length === 0
              ? isAuthenticated
                ? 'No comments yet. Click "Add Comment" to start!'
                : "No comments yet. Login to add one!"
              : "No comments match your search or filters."}
          </div>
        ) : (
          <div style={styles.pinsList}>
            {filteredPins.map((pin) => (
              <div
                key={pin.id}
                style={{
                  ...styles.pinCard,
                  borderLeft: `4px solid ${
                    pin.isResolved ? "#28a745" : "#ffc107"
                  }`,
                }}
              >
                <div style={styles.pinHeader}>
                  <span style={styles.pinAuthor}>
                    {pin.creator?.name || "Unknown"}
                  </span>
                  <span style={styles.pinTime}>
                    {new Date(pin.createdAt).toLocaleDateString()}
                  </span>
                  <span style={styles.pinStatus}>
                    {pin.isResolved ? "✅" : "🟡"}
                  </span>
                </div>
                <div style={styles.pinPosition}>
                  📍 Position: ({Math.round(pin.xCoordinate * 100)}%,{" "}
                  {Math.round(pin.yCoordinate * 100)}%)
                </div>
                <div style={styles.pinContent}>
                  {pin.comments[0]?.content || "No comment"}
                </div>
                {pin.comments.length > 1 && (
                  <div style={styles.replies}>
                    {pin.comments.slice(1).map((comment) => (
                      <div key={comment.id} style={styles.reply}>
                        <strong>{comment.author?.name || "Unknown"}:</strong>
                        <span>{comment.content}</span>
                      </div>
                    ))}
                  </div>
                )}
                {isAuthenticated && (
                  <div style={styles.pinActions}>
                    <button
                      onClick={() =>
                        setReplyingTo(replyingTo === pin.id ? null : pin.id)
                      }
                      style={styles.replyBtn}
                    >
                      💬 Reply
                    </button>
                    <button
                      onClick={() => handleToggleResolved(pin.id)}
                      style={{
                        ...styles.resolveBtn,
                        backgroundColor: pin.isResolved ? "#ffc107" : "#28a745",
                      }}
                    >
                      {pin.isResolved ? "🔄 Reopen" : "✅ Resolve"}
                    </button>
                  </div>
                )}
                {replyingTo === pin.id && (
                  <div style={styles.replyInput}>
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      style={styles.replyInputField}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddReply(pin.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddReply(pin.id)}
                      style={styles.replySubmitBtn}
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    gap: "20px",
    height: "80vh",
    minHeight: "500px",
  },
  viewer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#f0f0f0",
    borderRadius: "10px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  toolbar: {
    position: "absolute",
    top: "10px",
    left: "10px",
    right: "10px",
    zIndex: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: "10px 20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    flexWrap: "wrap",
    gap: "10px",
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  liveBadge: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#28a745",
    backgroundColor: "#d4edda",
    padding: "2px 10px",
    borderRadius: "12px",
  },
  toolbarBtn: {
    padding: "8px 20px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  hint: {
    fontSize: "14px",
    color: "#666",
  },
  loginHint: {
    fontSize: "14px",
    color: "#666",
  },
  loginLink: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500",
  },
  zoomControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  zoomBtn: {
    padding: "6px 12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#e9ecef",
    },
  },
  zoomLevel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    minWidth: "50px",
    textAlign: "center",
  },
  imageWrapper: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    cursor: "default",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    userSelect: "none",
  },
  pin: {
    position: "absolute",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "2px solid white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "translate(-50%, -50%)",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s",
    zIndex: 5,
  },
  pinCount: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "white",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
  },
  newPinInput: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 15px rgba(0,0,0,0.2)",
    width: "80%",
    maxWidth: "400px",
    zIndex: 20,
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  newPinActions: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  sidebar: {
    width: "350px",
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    overflowY: "auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  sidebarHeader: {
    marginBottom: "15px",
  },
  sidebarTitle: {
    margin: "0 0 15px 0",
    fontSize: "18px",
    color: "#333",
  },
  loading: {
    textAlign: "center",
    color: "#999",
    padding: "20px",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    padding: "40px 20px",
  },
  pinsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  pinCard: {
    padding: "12px",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
  },
  pinHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  pinAuthor: {
    fontWeight: "500",
    color: "#333",
    fontSize: "14px",
  },
  pinTime: {
    fontSize: "12px",
    color: "#999",
  },
  pinStatus: {
    fontSize: "14px",
  },
  pinPosition: {
    fontSize: "12px",
    color: "#999",
    marginBottom: "6px",
  },
  pinContent: {
    fontSize: "14px",
    color: "#333",
    marginBottom: "8px",
  },
  replies: {
    marginTop: "8px",
    paddingLeft: "12px",
    borderLeft: "2px solid #e9ecef",
  },
  reply: {
    fontSize: "13px",
    padding: "4px 0",
    color: "#555",
  },
  pinActions: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  replyBtn: {
    padding: "4px 12px",
    backgroundColor: "#e9ecef",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  resolveBtn: {
    padding: "4px 12px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  replyInput: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  replyInputField: {
    flex: 1,
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
  },
  replySubmitBtn: {
    padding: "6px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default SharedImageViewer;
