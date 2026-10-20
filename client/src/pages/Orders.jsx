import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD ALL ORDERS
  // =====================================================
  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/api/orders`
      );

      console.log(
        "ADMIN ORDERS:",
        response.data
      );

      // IMPORTANT
      const orderData = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || [];

      setOrders(orderData);

    } catch (error) {
      console.error(
        "Orders loading error:",
        error
      );

      setOrders([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // =====================================================
  // UPDATE STATUS
  // =====================================================
  const updateStatus = async (
    orderId,
    status
  ) => {
    try {
      await axios.put(
        `${API}/api/orders/${orderId}/status`,
        {
          status,
        }
      );

      await loadOrders();

    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        "Failed to update order status."
      );
    }
  };

  // =====================================================
  // DATE
  // =====================================================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // IMAGE URL
  // =====================================================
  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    return `${API}${image}`;
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

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h2
              className="fw-bold"
              style={{
                color: "#b8860b",
              }}
            >
              🛒 Ordered List
            </h2>

            <p className="text-muted mb-0">
              View all customer orders and complete order details.
            </p>

          </div>

          <button
            className="btn btn-dark"
            onClick={loadOrders}
          >
            🔄 Refresh
          </button>

        </div>

        {/* =================================================
            ORDER COUNT
        ================================================= */}

        {!loading && (
          <div className="mb-3">

            <span
              className="badge"
              style={{
                background: "#b8860b",
                fontSize: "16px",
                padding: "10px 16px",
              }}
            >
              🛒 {orders.length} Order(s)
            </span>

          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="text-center p-5">

            <div className="spinner-border text-warning"></div>

            <p className="mt-3">
              Loading orders...
            </p>

          </div>

        )}

        {/* =================================================
            NO ORDERS
        ================================================= */}

        {!loading && orders.length === 0 && (

          <div className="card shadow border-0">

            <div className="card-body text-center p-5">

              <div
                style={{
                  fontSize: "55px",
                }}
              >
                📦
              </div>

              <h4 className="fw-bold">
                No Orders Found
              </h4>

              <p className="text-muted">
                No customer orders are available in the database.
              </p>

              <button
                className="btn btn-warning"
                onClick={loadOrders}
              >
                🔄 Check Again
              </button>

            </div>

          </div>

        )}

        {/* =================================================
            ORDERS
        ================================================= */}

        {!loading &&
          orders.length > 0 &&
          orders.map((order) => {

            const customer =
              order.userId || {};

            return (

              <div
                className="card shadow border-0 mb-4"
                key={order._id}
              >

                {/* =================================================
                    ORDER HEADER
                ================================================= */}

                <div
                  className="card-header text-white"
                  style={{
                    background: "#1a1a1a",
                  }}
                >

                  <div className="row align-items-center">

                    <div className="col-lg-4">

                      <strong>
                        Order ID
                      </strong>

                      <div
                        style={{
                          color: "#ffc107",
                          fontSize: "13px",
                          wordBreak: "break-all",
                        }}
                      >
                        {order._id}
                      </div>

                    </div>

                    <div className="col-lg-4">

                      <strong>
                        Order Date
                      </strong>

                      <div>
                        {formatDate(
                          order.createdAt
                        )}
                      </div>

                    </div>

                    <div className="col-lg-4 text-lg-end mt-2 mt-lg-0">

                      <span
                        className="badge bg-warning text-dark"
                        style={{
                          fontSize: "13px",
                          padding: "9px 14px",
                        }}
                      >
                        {(
                          order.orderStatus ||
                          "placed"
                        ).toUpperCase()}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="card-body">

                  {/* =================================================
                      CUSTOMER DETAILS
                  ================================================= */}

                  <div
                    className="p-4 rounded mb-4"
                    style={{
                      background: "#fff8e1",
                      borderLeft:
                        "5px solid #b8860b",
                    }}
                  >

                    <h5
                      className="fw-bold mb-3"
                      style={{
                        color: "#b8860b",
                      }}
                    >
                      👤 Customer Details
                    </h5>

                    <div className="row g-3">

                      <div className="col-md-4">

                        <small className="text-muted">
                          Customer Name
                        </small>

                        <div className="fw-bold">
                          {customer.name ||
                            "Not Available"}
                        </div>

                      </div>

                      <div className="col-md-4">

                        <small className="text-muted">
                          Mobile Number
                        </small>

                        <div className="fw-bold">
                          📱{" "}
                          {customer.phone ||
                            "Not Available"}
                        </div>

                      </div>

                      <div className="col-md-4">

                        <small className="text-muted">
                          Email
                        </small>

                        <div className="fw-bold">
                          ✉️{" "}
                          {customer.email ||
                            "Not Available"}
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      PRODUCT DETAILS
                  ================================================= */}

                  <h5 className="fw-bold mb-3">
                    🛍️ Product Details
                  </h5>

                  <div className="table-responsive">

                    <table className="table table-bordered table-hover align-middle">

                      <thead
                        style={{
                          background: "#1a1a1a",
                          color: "white",
                        }}
                      >

                        <tr>

                          <th>
                            Product
                          </th>

                          <th>
                            Category
                          </th>

                          <th>
                            Price
                          </th>

                          <th>
                            Quantity
                          </th>

                          <th>
                            Size
                          </th>

                          <th>
                            Color
                          </th>

                          <th>
                            Total
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {(order.items || []).map(
                          (item, index) => {

                            const product =
                              item.productId ||
                              {};

                            const image =
                              item.image ||
                              product.image ||
                              "";

                            const price =
                              Number(
                                item.price || 0
                              );

                            const quantity =
                              Number(
                                item.quantity || 1
                              );

                            return (

                              <tr
                                key={index}
                              >

                                <td>

                                  <div
                                    className="d-flex align-items-center gap-3"
                                  >

                                    {image && (

                                      <img
                                        src={getImageUrl(
                                          image
                                        )}
                                        alt={
                                          item.name ||
                                          product.name ||
                                          "Product"
                                        }
                                        style={{
                                          width: "70px",
                                          height: "80px",
                                          objectFit:
                                            "cover",
                                          borderRadius:
                                            "8px",
                                          border:
                                            "1px solid #ddd",
                                        }}
                                        onError={(
                                          e
                                        ) => {
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                      />

                                    )}

                                    <div>

                                      <div className="fw-bold">
                                        {item.name ||
                                          product.name ||
                                          "Product"}
                                      </div>

                                    </div>

                                  </div>

                                </td>

                                <td>
                                  {item.category ||
                                    product.category ||
                                    "-"}
                                </td>

                                <td>
                                  ₹
                                  {price.toFixed(
                                    2
                                  )}
                                </td>

                                <td className="fw-bold">
                                  {quantity}
                                </td>

                                <td>
                                  {item.size ||
                                    "-"}
                                </td>

                                <td>
                                  {item.color ||
                                    "-"}
                                </td>

                                <td className="fw-bold text-success">
                                  ₹
                                  {(
                                    price *
                                    quantity
                                  ).toFixed(2)}
                                </td>

                              </tr>

                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* =================================================
                      PAYMENT DETAILS
                  ================================================= */}

                  <div className="row g-3 mt-3">

                    <div className="col-md-4">

                      <div className="card border-0 bg-light h-100">

                        <div className="card-body">

                          <small className="text-muted">
                            Payment Method
                          </small>

                          <h6 className="fw-bold mt-1">
                            💳{" "}
                            {order.paymentMethod ||
                              "-"}
                          </h6>

                        </div>

                      </div>

                    </div>

                    <div className="col-md-4">

                      <div className="card border-0 bg-light h-100">

                        <div className="card-body">

                          <small className="text-muted">
                            Payment Status
                          </small>

                          <h6 className="fw-bold text-success mt-1">
                            {(
                              order.paymentStatus ||
                              "paid"
                            ).toUpperCase()}
                          </h6>

                        </div>

                      </div>

                    </div>

                    <div className="col-md-4">

                      <div
                        className="card border-0 h-100"
                        style={{
                          background:
                            "#fff3cd",
                        }}
                      >

                        <div className="card-body">

                          <small className="text-muted">
                            Total Order Amount
                          </small>

                          <h4
                            className="fw-bold mt-1"
                            style={{
                              color: "#b8860b",
                            }}
                          >
                            ₹
                            {Number(
                              order.totalAmount ||
                                0
                            ).toFixed(2)}
                          </h4>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      ORDER STATUS
                  ================================================= */}

                  <div
                    className="mt-4 pt-4"
                    style={{
                      borderTop:
                        "1px solid #ddd",
                    }}
                  >

                    <div className="row align-items-center">

                      <div className="col-md-4">

                        <strong>
                          Update Order Status
                        </strong>

                      </div>

                      <div className="col-md-5">

                        <select
                          className="form-select"
                          value={
                            order.orderStatus ||
                            "placed"
                          }
                          onChange={(e) =>
                            updateStatus(
                              order._id,
                              e.target.value
                            )
                          }
                        >

                          <option value="placed">
                            Placed
                          </option>

                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="shipped">
                            Shipped
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>

                        </select>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            );
          })}

      </div>

    </div>
  );
};

export default Orders;