import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminSupport() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/complaints"
      );

      setComplaints(res.data || []);
      setError("");
    } catch (err) {
      console.log("Load complaints error:", err);
      setError("❌ Failed to load customer complaints.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // REPLY TO CUSTOMER
  // ==============================

  const handleReplyChange = (id, value) => {
    setReply((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const sendReply = async (id) => {
  const replyText = reply[id];

  if (!replyText || !replyText.trim()) {
    alert("Please enter a reply.");
    return;
  }

  try {
    const res = await axios.put(
      `http://localhost:5000/api/complaints/${id}/reply`,
      {
        adminReply: replyText.trim(),
      }
    );

      setMessage("✅ Reply sent successfully!");

      setReply((prev) => ({
        ...prev,
        [id]: "",
      }));

      await loadComplaints();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.log("Reply error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to send reply."
      );
    }
  };

  // ==============================
  // CHANGE COMPLAINT STATUS
  // ==============================

  const changeStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/complaints/${id}/status`,
        {
          status: newStatus,
        }
      );

      setMessage("✅ Complaint status updated!");

      await loadComplaints();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.log("Status update error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to update status."
      );
    }
  };

  const statusColor = (status) => {
    if (status === "resolved") return "#44ff44";
    if (status === "in-progress") return "#ffaa00";
    return "#aaaaaa";
  };

  const statusBackground = (status) => {
    if (status === "resolved") return "#0a2d0a";
    if (status === "in-progress") return "#2d1a00";
    return "#2a2a2a";
  };

  return (
    <div
      style={{
        backgroundColor: "#0d0d0d",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
        }}
      >

        {/* HEADER */}

        <div className="text-center mb-4">
          <h2
            style={{
              color: "#b8860b",
              fontFamily: "Georgia, serif",
              fontSize: "2rem",
            }}
          >
            💬 Customer Support
          </h2>

          <p style={{ color: "#888" }}>
            Manage customer complaints and replies
          </p>
        </div>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div
            style={{
              backgroundColor: "#0a2d0a",
              border: "1px solid #44ff44",
              color: "#66ff66",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div
            style={{
              backgroundColor: "#2d0a0a",
              border: "1px solid #ff4444",
              color: "#ff6666",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#b8860b",
              padding: "50px",
            }}
          >
            ⏳ Loading complaints...
          </div>
        ) : complaints.length === 0 ? (

          /* NO COMPLAINTS */

          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "15px",
              padding: "60px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "50px" }}>
              📭
            </div>

            <h4 style={{ color: "#fff" }}>
              No Customer Complaints
            </h4>

            <p style={{ color: "#777" }}>
              Customer complaints will appear here.
            </p>
          </div>

        ) : (

          /* COMPLAINT LIST */

          complaints.map((complaint) => (

            <div
              key={complaint._id}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #b8860b",
                borderRadius: "15px",
                padding: "25px",
                marginBottom: "20px",
                boxShadow:
                  "0 5px 20px rgba(184,134,11,0.15)",
              }}
            >

              {/* CUSTOMER DETAILS */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >

                <div>

                  <h5
                    style={{
                      color: "#fff",
                      marginBottom: "5px",
                    }}
                  >
                    👤 {complaint.name}
                  </h5>

                  <p
                    style={{
                      color: "#888",
                      margin: 0,
                      fontSize: "14px",
                    }}
                  >
                    ✉️ {complaint.email}
                  </p>

                </div>

                {/* STATUS */}

                <select
                  value={complaint.status || "pending"}
                  onChange={(e) =>
                    changeStatus(
                      complaint._id,
                      e.target.value
                    )
                  }
                  style={{
                    backgroundColor:
                      statusBackground(
                        complaint.status
                      ),
                    color: statusColor(
                      complaint.status
                    ),
                    border: `1px solid ${statusColor(
                      complaint.status
                    )}`,
                    borderRadius: "20px",
                    padding: "7px 15px",
                    fontWeight: "bold",
                    outline: "none",
                  }}
                >

                  <option value="pending">
                    ⏳ Pending
                  </option>

                  <option value="in-progress">
                    🔄 In Progress
                  </option>

                  <option value="resolved">
                    ✅ Resolved
                  </option>

                </select>

              </div>

              {/* COMPLAINT */}

              <div
                style={{
                  backgroundColor: "#111",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >

                <p
                  style={{
                    color: "#d4af37",
                    marginBottom: "8px",
                  }}
                >
                  📁 {complaint.category}
                </p>

                <h5
                  style={{
                    color: "#fff",
                  }}
                >
                  {complaint.subject}
                </h5>

                <p
                  style={{
                    color: "#aaa",
                    lineHeight: "1.6",
                  }}
                >
                  {complaint.message}
                </p>

                <small
                  style={{
                    color: "#555",
                  }}
                >
                  🕐{" "}
                  {complaint.createdAt
                    ? new Date(
                        complaint.createdAt
                      ).toLocaleString("en-IN")
                    : "Date unavailable"}
                </small>

              </div>

              {/* EXISTING ADMIN REPLY */}

              {complaint.adminReply && (
                <div
                  style={{
                    backgroundColor: "#241f0d",
                    border: "1px solid #b8860b",
                    borderRadius: "10px",
                    padding: "15px",
                    marginBottom: "20px",
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
                      color: "#ddd",
                      margin: "8px 0 0",
                    }}
                  >
                    {complaint.adminReply}
                  </p>

                  {complaint.repliedAt && (
                    <small
                      style={{
                        color: "#777",
                        display: "block",
                        marginTop: "8px",
                      }}
                    >
                      🕐 Replied on:{" "}
                      {new Date(
                        complaint.repliedAt
                      ).toLocaleString("en-IN")}
                    </small>
                  )}

                </div>
              )}

              {/* REPLY BOX */}

              <div>

                <label
                  style={{
                    color: "#d4af37",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  ✍️ Reply to Customer
                </label>

                <textarea
                  rows="3"
                  value={
                    reply[complaint._id] || ""
                  }
                  onChange={(e) =>
                    handleReplyChange(
                      complaint._id,
                      e.target.value
                    )
                  }
                  placeholder="Write your reply..."
                  style={{
                    width: "100%",
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #555",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#fff",
                    outline: "none",
                    resize: "vertical",
                  }}
                />

                <button
                  onClick={() =>
                    sendReply(complaint._id)
                  }
                  className="btn btn-warning mt-2"
                >
                  📤 Send Reply
                </button>

              </div>

            </div>

          ))
        )}
      </div>
    </div>
  );
}

export default AdminSupport;