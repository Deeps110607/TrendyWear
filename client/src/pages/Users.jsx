import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD CUSTOMERS
  // ==========================================
  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/api/users`
      );

      setUsers(response.data || []);

    } catch (error) {
      console.error(
        "Customers loading error:",
        error
      );

      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ==========================================
  // DATE FORMAT
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "30px",
        marginLeft: "260px",
      }}
    >

      <div className="container-fluid">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h2
              className="fw-bold"
              style={{
                color: "#b8860b",
              }}
            >
              👥 Customers
            </h2>

            <p className="text-muted mb-0">
              View customers registered on TrendyWear.
            </p>

          </div>

          <button
            className="btn btn-dark"
            onClick={loadUsers}
          >
            🔄 Refresh
          </button>

        </div>

        {/* CUSTOMER COUNT */}
        <div className="card shadow border-0 mb-4">

          <div className="card-body">

            <div className="row align-items-center">

              <div className="col-md-8">

                <h5 className="fw-bold mb-1">
                  Registered Customers
                </h5>

                <p className="text-muted mb-0">
                  All users who have registered on the website.
                </p>

              </div>

              <div className="col-md-4 text-md-end">

                <span
                  className="badge"
                  style={{
                    background: "#b8860b",
                    fontSize: "18px",
                    padding: "12px 20px",
                  }}
                >
                  {users.length} Customers
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center p-5">

            <div className="spinner-border text-warning"></div>

            <p className="mt-3">
              Loading customers...
            </p>

          </div>
        )}

        {/* NO USERS */}
        {!loading && users.length === 0 && (
          <div className="card shadow border-0">

            <div className="card-body text-center p-5">

              <h4>
                👤 No Customers Found
              </h4>

              <p className="text-muted">
                Registered customers will appear here.
              </p>

            </div>

          </div>
        )}

        {/* CUSTOMER TABLE */}
        {!loading && users.length > 0 && (

          <div className="card shadow border-0">

            <div
              className="card-header text-white fw-bold"
              style={{
                background: "#1a1a1a",
              }}
            >
              👥 Customer List
            </div>

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-hover table-bordered align-middle">

                  <thead
                    style={{
                      background: "#f1f1f1",
                    }}
                  >

                    <tr>

                      <th>#</th>

                      <th>Customer Name</th>

                      <th>Mobile Number</th>

                      <th>Email</th>

                      <th>Customer ID</th>

                      <th>Registered On</th>

                    </tr>

                  </thead>

                  <tbody>

                    {users.map(
                      (user, index) => (

                        <tr
                          key={user._id}
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <div className="fw-bold">
                              👤{" "}
                              {user.name ||
                                "Not Available"}
                            </div>
                          </td>

                          <td>
                            📱{" "}
                            {user.phone ||
                              "Not Available"}
                          </td>

                          <td>
                            ✉️{" "}
                            {user.email ||
                              "Not Available"}
                          </td>

                          <td>
                            <small
                              className="text-muted"
                              style={{
                                wordBreak:
                                  "break-all",
                              }}
                            >
                              {user._id}
                            </small>
                          </td>

                          <td>
                            {formatDate(
                              user.createdAt
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default Users;