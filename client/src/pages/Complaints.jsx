import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Complaints() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    subject: "",
    category: "",
    message: "",
  });

  const [complaints, setComplaints] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("submit");

  // ==========================================
  // LOAD LOGGED-IN USER
  // ==========================================

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser || storedUser === "undefined") {
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        if (parsedUser) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.log("User data error:", error);
      }
    };

    loadUser();
  }, []);

  // ==========================================
  // FETCH COMPLAINTS
  // ==========================================

  useEffect(() => {
    if (activeTab === "history" && user) {
      fetchComplaints();
    }
  }, [activeTab, user]);

  const fetchComplaints = async () => {
    if (!user) return;

    const userId = user._id || user.id;

    if (!userId) {
      setError("User ID not found. Please login again.");
      return;
    }

    try {
      setHistoryLoading(true);
      setError("");

      const res = await axios.get(
        `http://localhost:5000/api/complaints/${userId}`
      );

      console.log("Complaints:", res.data);

      setComplaints(res.data || []);
    } catch (err) {
      console.log("Complaint loading error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load complaints."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // SUBMIT COMPLAINT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please login to submit a complaint.");
      return;
    }

    const userId = user._id || user.id;

    if (!userId) {
      setError("User ID not found.");
      return;
    }

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/complaints",
        {
          userId: userId,
          name: user.name,
          email: user.email,
          subject: form.subject,
          category: form.category,
          message: form.message,
        }
      );

      setSuccess(
        "Your complaint has been submitted successfully!"
      );

      setForm({
        subject: "",
        category: "",
        message: "",
      });

    } catch (err) {
      console.log("Submit complaint error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to submit complaint."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STATUS
  // ==========================================

  const getStatusColor = (status) => {
    if (status === "resolved") return "#44ff44";
    if (status === "in-progress") return "#ffaa00";
    return "#aaaaaa";
  };

  const getStatusBg = (status) => {
    if (status === "resolved") return "#0a2d0a";
    if (status === "in-progress") return "#2d1a00";
    return "#2a2a2a";
  };

  // ==========================================
  // IF USER IS NOT AVAILABLE
  // ==========================================

  if (!user) {
    return (
      <div
        style={{
          backgroundColor: "#0d0d0d",
          minHeight: "100vh",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            margin: "auto",
            backgroundColor: "#1a1a1a",
            border: "1px solid #b8860b",
            borderRadius: "15px",
            padding: "40px",
          }}
        >
          <h3 style={{ color: "#b8860b" }}>
            🔐 Login Required
          </h3>

          <p style={{ color: "#888" }}>
            Please login to access Customer Support.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="btn btn-warning"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#0d0d0d",
        minHeight: "100vh",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
        }}
      >

        {/* HEADER */}

        <div className="text-center mb-5">
          <h2
            style={{
              color: "#b8860b",
              fontFamily: "Georgia, serif",
            }}
          >
            🎫 Customer Support
          </h2>

          <p style={{ color: "#888" }}>
            We're here to help you, {user.name}!
          </p>
        </div>

        {/* TABS */}

        <div
          style={{
            display: "flex",
            marginBottom: "30px",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid #b8860b",
          }}
        >
          <button
            onClick={() => {
              setActiveTab("submit");
              setSuccess("");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "13px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              backgroundColor:
                activeTab === "submit"
                  ? "#b8860b"
                  : "#1a1a1a",
              color:
                activeTab === "submit"
                  ? "#fff"
                  : "#888",
            }}
          >
            📝 Submit Complaint
          </button>

          <button
            onClick={() => {
              setActiveTab("history");
              setSuccess("");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "13px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              backgroundColor:
                activeTab === "history"
                  ? "#b8860b"
                  : "#1a1a1a",
              color:
                activeTab === "history"
                  ? "#fff"
                  : "#888",
            }}
          >
            📋 My Complaints
          </button>
        </div>

        {/* SUCCESS */}

        {success && (
          <div
            style={{
              backgroundColor: "#0a2d0a",
              border: "1px solid #44ff44",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              color: "#66ff66",
            }}
          >
            ✅ {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            style={{
              backgroundColor: "#2d0a0a",
              border: "1px solid #ff4444",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              color: "#ff6666",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ================================= */}
        {/* SUBMIT */}
        {/* ================================= */}

        {activeTab === "submit" && (
          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #b8860b",
              borderRadius: "16px",
              padding: "35px",
            }}
          >
            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label
                  style={{
                    color: "#d4af37",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #b8860b",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#fff",
                  }}
                >
                  <option value="">
                    Select a category
                  </option>

                  <option value="Order Issue">
                    📦 Order Issue
                  </option>

                  <option value="Payment Problem">
                    💳 Payment Problem
                  </option>

                  <option value="Delivery Delay">
                    🚚 Delivery Delay
                  </option>

                  <option value="Wrong Item">
                    ❌ Wrong Item Received
                  </option>

                  <option value="Return & Refund">
                    🔄 Return & Refund
                  </option>

                  <option value="Product Quality">
                    ⭐ Product Quality
                  </option>

                  <option value="Account Issue">
                    👤 Account Issue
                  </option>

                  <option value="Other">
                    💬 Other
                  </option>
                </select>
              </div>

              <div className="mb-3">
                <label
                  style={{
                    color: "#d4af37",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief subject"
                  style={{
                    width: "100%",
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #b8860b",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#fff",
                  }}
                />
              </div>

              <div className="mb-4">
                <label
                  style={{
                    color: "#d4af37",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Message
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Describe your issue..."
                  style={{
                    width: "100%",
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #b8860b",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#fff",
                    resize: "vertical",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-warning w-100 fw-bold"
              >
                {loading
                  ? "⏳ Submitting..."
                  : "🎫 Submit Complaint"}
              </button>

            </form>
          </div>
        )}

        {/* ================================= */}
        {/* HISTORY */}
        {/* ================================= */}

        {activeTab === "history" && (
          <div>

            {historyLoading ? (
              <div
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: "15px",
                  padding: "50px",
                  textAlign: "center",
                  color: "#b8860b",
                }}
              >
                ⏳ Loading complaints...
              </div>
            ) : complaints.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: "15px",
                  padding: "50px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "50px" }}>
                  📭
                </div>

                <p style={{ color: "#888" }}>
                  No complaints submitted yet.
                </p>
              </div>
            ) : (
              complaints.map((c) => (
                <div
                  key={c._id}
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #b8860b",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}
                >

                  {/* SUBJECT */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <h5
                      style={{
                        color: "#fff",
                        margin: 0,
                      }}
                    >
                      {c.subject}
                    </h5>

                    <span
                      style={{
                        backgroundColor:
                          getStatusBg(c.status),
                        color:
                          getStatusColor(c.status),
                        padding: "5px 12px",
                        borderRadius: "20px",
                        border: `1px solid ${getStatusColor(
                          c.status
                        )}`,
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      {c.status === "resolved"
                        ? "✅ Resolved"
                        : c.status === "in-progress"
                        ? "🔄 In Progress"
                        : "⏳ Pending"}
                    </span>
                  </div>

                  {/* CATEGORY */}

                  <p
                    style={{
                      color: "#d4af37",
                      marginTop: "10px",
                    }}
                  >
                    📁 {c.category}
                  </p>

                  {/* CUSTOMER MESSAGE */}

                  <div
                    style={{
                      backgroundColor: "#111",
                      borderRadius: "8px",
                      padding: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <p
                      style={{
                        color: "#aaa",
                        margin: 0,
                        lineHeight: "1.6",
                      }}
                    >
                      {c.message}
                    </p>
                  </div>

                  {/* ================================= */}
                  {/* ADMIN REPLY */}
                  {/* ================================= */}

                  {c.adminReply &&
                  c.adminReply.trim() !== "" ? (
                    <div
                      style={{
                        backgroundColor: "#241f0d",
                        border: "1px solid #b8860b",
                        borderRadius: "10px",
                        padding: "18px",
                      }}
                    >
                      <strong
                        style={{
                          color: "#d4af37",
                        }}
                      >
                        👨‍💼 Admin Reply
                      </strong>

                      <p
                        style={{
                          color: "#fff",
                          marginTop: "10px",
                          marginBottom: 0,
                          lineHeight: "1.6",
                        }}
                      >
                        {c.adminReply}
                      </p>

                      {c.repliedAt && (
                        <small
                          style={{
                            display: "block",
                            color: "#777",
                            marginTop: "10px",
                          }}
                        >
                          🕐 Replied:{" "}
                          {new Date(
                            c.repliedAt
                          ).toLocaleString("en-IN")}
                        </small>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: "#171717",
                        border: "1px dashed #444",
                        borderRadius: "8px",
                        padding: "12px",
                        color: "#777",
                      }}
                    >
                      ⏳ Waiting for admin response...
                    </div>
                  )}

                  {/* DATE */}

                  <small
                    style={{
                      display: "block",
                      color: "#555",
                      marginTop: "15px",
                    }}
                  >
                    🕐 Submitted:{" "}
                    {c.createdAt
                      ? new Date(
                          c.createdAt
                        ).toLocaleString("en-IN")
                      : "Date unavailable"}
                  </small>

                </div>
              ))
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Complaints;