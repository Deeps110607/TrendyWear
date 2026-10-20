import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://trendywear-3uam.onrender.com";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.log("Invalid user data");
    user = null;
  }

  useEffect(() => {
    if (!user?._id && !user?.id) {
      setLoading(false);
      return;
    }

    const userId = user._id || user.id;

    const fetchOrders = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API}/api/orders/${userId}`
        );

        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else if (Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        } else {
          setOrders([]);
        }

        setError("");
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h3>Please login to view your orders.</h3>

        <a
          href="/login"
          className="btn btn-dark mt-3"
        >
          Login
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning"></div>
        <p className="mt-3">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div
      className="container py-5"
      style={{ minHeight: "80vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            📦 My Orders
          </h2>

          <p className="text-muted mb-0">
            View your previous orders and payment details.
          </p>
        </div>

        <a
          href="/"
          className="btn btn-outline-dark"
        >
          Continue Shopping
        </a>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: "70px" }}>🛍️</div>

          <h4 className="mt-3">
            No orders yet
          </h4>

          <p className="text-muted">
            Your placed orders will appear here.
          </p>

          <a
            href="/"
            className="btn btn-warning fw-bold"
          >
            Start Shopping
          </a>
        </div>
      )}

      {orders.map((order) => (
        <div
          key={order._id}
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: "15px",
            overflow: "hidden",
          }}
        >
          {/* ORDER HEADER */}
          <div className="card-header bg-dark text-white p-3">
            <div className="row align-items-center">
              <div className="col-md-4">
                <small className="text-secondary">
                  ORDER ID
                </small>

                <div className="fw-bold">
                  #{order._id?.slice(-8)}
                </div>
              </div>

              <div className="col-md-3">
                <small className="text-secondary">
                  DATE
                </small>

                <div>
                  {order.createdAt
                    ? new Date(
                        order.createdAt
                      ).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              <div className="col-md-2">
                <small className="text-secondary">
                  PAYMENT
                </small>

                <div>
                  {order.paymentMethod || "N/A"}
                </div>
              </div>

              <div className="col-md-3 text-md-end">
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor:
                      order.orderStatus === "delivered"
                        ? "#198754"
                        : order.orderStatus === "cancelled"
                        ? "#dc3545"
                        : "#ffc107",
                    color:
                      order.orderStatus === "delivered" ||
                      order.orderStatus === "cancelled"
                        ? "white"
                        : "black",
                    padding: "9px 14px",
                  }}
                >
                  {(
                    order.orderStatus || "placed"
                  ).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="card-body p-4">
            {order.items?.map((item, index) => {
              const product =
                item.productId &&
                typeof item.productId === "object"
                  ? item.productId
                  : null;

              const image =
                product?.image || item.image;

              return (
                <div
                  key={item._id || index}
                  className="row align-items-center border-bottom py-3"
                >
                  {/* IMAGE */}
                  <div className="col-3 col-md-2">
                    {image ? (
                      <img
                        src={
                          image.startsWith("http")
                            ? image
                            : `${API}${image}`
                        }
                        alt={item.name || "Product"}
                        style={{
                          width: "80px",
                          height: "95px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "80px",
                          height: "95px",
                          background: "#eee",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "30px",
                        }}
                      >
                        👗
                      </div>
                    )}
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="col-5 col-md-5">
                    <h6 className="fw-bold mb-1">
                      {item.name || "Product"}
                    </h6>

                    {item.size && (
                      <small className="text-muted d-block">
                        Size: {item.size}
                      </small>
                    )}

                    {item.color && (
                      <small className="text-muted d-block">
                        Color: {item.color}
                      </small>
                    )}

                    <small className="text-muted">
                      Quantity: {item.quantity || 1}
                    </small>
                  </div>

                  {/* PRICE */}
                  <div className="col-4 col-md-5 text-end">
                    <div className="fw-bold">
                      ₹
                      {Number(
                        item.price || 0
                      ).toLocaleString("en-IN")}
                    </div>

                    <small className="text-muted">
                      × {item.quantity || 1}
                    </small>

                    <div className="mt-1 fw-bold">
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 1)
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* TOTAL */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                <small className="text-muted">
                  Payment Status
                </small>

                <div className="fw-bold">
                  {(
                    order.paymentStatus || "pending"
                  ).toUpperCase()}
                </div>
              </div>

              <div className="text-end">
                <small className="text-muted">
                  Total Amount
                </small>

                <h4
                  className="fw-bold mb-0"
                  style={{ color: "#b8860b" }}
                >
                  ₹
                  {Number(
                    order.totalAmount || 0
                  ).toLocaleString("en-IN")}
                </h4>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyOrders;
