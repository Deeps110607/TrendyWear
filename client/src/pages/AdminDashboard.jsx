
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    complaints: 0,
  });

  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);

    try {
      const requests = await Promise.allSettled([
        axios.get(`${API}/api/products`),
        axios.get(`${API}/api/users`),
        axios.get(`${API}/api/orders`),
        axios.get(`${API}/api/complaints`),
      ]);

      const getData = (index) => {
        if (requests[index].status !== "fulfilled") return [];

        const response = requests[index].value.data;

        if (Array.isArray(response)) return response;

        return (
          response?.products ||
          response?.users ||
          response?.orders ||
          response?.complaints ||
          response?.data ||
          []
        );
      };

      setStats({
        products: getData(0).length,
        customers: getData(1).length,
        orders: getData(2).length,
        complaints: getData(3).length,
      });
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const goTo = (path) => {
    window.location.href = path;
  };

  const cardStyle = {
    borderRadius: "8px",
    padding: "24px 12px",
    minHeight: "136px",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 5px 12px rgba(0,0,0,0.12)",
  };

  const buttonStyle = {
    border: "none",
    borderRadius: "7px",
    minHeight: "58px",
    padding: "14px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    width: "100%",
  };

  return (
    <main
      style={{
        width: "100%",
        minHeight: "calc(100vh - 70px)",
        boxSizing: "border-box",
        background: "#f5f5f5",
        padding: "32px",
        margin: 0,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "36px",
          }}
        >
          <div>
            <h1
              style={{
                color: "#b8860b",
                fontWeight: "bold",
                fontSize: "34px",
                margin: "0 0 8px",
              }}
            >
              👋 Welcome Admin
            </h1>

            <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
              Manage your TrendyWear store from the dashboard.
            </p>
          </div>

          <button
            onClick={loadStats}
            disabled={loading}
            style={{
              ...buttonStyle,
              width: "auto",
              minHeight: "42px",
              padding: "10px 18px",
              background: "#212529",
              color: "#fff",
            }}
          >
            🔄 {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <div style={{ ...cardStyle, background: "#0d6efd" }}>
            <h3 style={{ fontSize: "19px", margin: "0 0 14px" }}>
              📦 Total Products
            </h3>
            <div style={{ fontSize: "38px", fontWeight: "bold" }}>
              {stats.products}
            </div>
          </div>

          <div style={{ ...cardStyle, background: "#198754" }}>
            <h3 style={{ fontSize: "19px", margin: "0 0 14px" }}>
              👥 Total Customers
            </h3>
            <div style={{ fontSize: "38px", fontWeight: "bold" }}>
              {stats.customers}
            </div>
          </div>

          <div style={{ ...cardStyle, background: "#ffc107", color: "#171717" }}>
            <h3 style={{ fontSize: "19px", margin: "0 0 14px" }}>
              🛒 Total Orders
            </h3>
            <div style={{ fontSize: "38px", fontWeight: "bold" }}>
              {stats.orders}
            </div>
          </div>

          <div style={{ ...cardStyle, background: "#dc3545" }}>
            <h3 style={{ fontSize: "19px", margin: "0 0 14px" }}>
              💬 Total Complaints
            </h3>
            <div style={{ fontSize: "38px", fontWeight: "bold" }}>
              {stats.complaints}
            </div>
          </div>
        </div>

        <section
          style={{
            background: "#fff",
            borderRadius: "9px",
            padding: "28px 24px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 24px",
              color: "#212529",
            }}
          >
            ⚙️ Store Management
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <button
              onClick={() => goTo("/admin/add-product")}
              style={{ ...buttonStyle, background: "#ffc107", color: "#111" }}
            >
              ➕ Add Product
            </button>

            <button
              onClick={() => goTo("/admin/products")}
              style={{ ...buttonStyle, background: "#212529", color: "#fff" }}
            >
              📦 Manage Products
            </button>

            <button
              onClick={() => goTo("/admin/categories")}
              style={{ ...buttonStyle, background: "#0dcaf0", color: "#111" }}
            >
              📁 Manage Categories
            </button>

            <button
              onClick={() => goTo("/admin/support")}
              style={{ ...buttonStyle, background: "#dc3545", color: "#fff" }}
            >
              💬 Customer Support
            </button>

            <button
              onClick={() => goTo("/admin/orders")}
              style={{ ...buttonStyle, background: "#198754", color: "#fff" }}
            >
              🛒 Orders
            </button>

            <button
              onClick={() => goTo("/admin/users")}
              style={{ ...buttonStyle, background: "#0d6efd", color: "#fff" }}
            >
              👥 Customers
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
