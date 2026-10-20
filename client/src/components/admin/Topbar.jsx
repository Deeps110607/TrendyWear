import React from "react";

function Topbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div
      style={{
        marginLeft: "260px",
        height: "70px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}
    >
      <div>
        <h3 style={{ margin: 0 }}>Admin Dashboard</h3>
        <small style={{ color: "#777" }}>
          Welcome to TrendyWear AI
        </small>
      </div>

      <div style={{ textAlign: "right" }}>
        <strong>{user?.name || "Administrator"}</strong>
        <br />
        <small>{user?.email}</small>
      </div>
    </div>
  );
}

export default Topbar;