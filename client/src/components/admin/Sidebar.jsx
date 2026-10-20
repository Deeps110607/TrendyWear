import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

 const menus = [
  { name: "Dashboard", path: "/admin", icon: "📊" },
  { name: "Categories", path: "/admin/categories", icon: "📂" },
  { name: "Products", path: "/admin/products", icon: "👕" },
  { name: "Add Product", path: "/admin/add-product", icon: "➕" },
  { name: "Orders", path: "/admin/orders", icon: "📦" },
  { name: "Returns", path: "/admin/returns", icon: "🔄" },
  { name: "Users", path: "/admin/users", icon: "👥" }
];
  return (
    <div
      style={{
        width: "260px",
        background: "#111",
        color: "#fff",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        padding: "25px"
      }}
    >
      <h2
        style={{
          color: "#FFD700",
          marginBottom: "40px",
          textAlign: "center"
        }}
      >
        TrendyWear AI
      </h2>

      {menus.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            display: "block",
            textDecoration: "none",
            color: location.pathname === item.path ? "#FFD700" : "#fff",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "10px",
            background:
              location.pathname === item.path ? "#222" : "transparent"
          }}
        >
          {item.icon} {item.name}
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;