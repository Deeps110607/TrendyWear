import React from "react";

function DashboardCard({ title, value, icon, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "15px",
        padding: "25px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeft: `6px solid ${color}`,
        transition: "0.3s",
        cursor: "pointer"
      }}
    >
      <div>
        <h5
          style={{
            color: "#666",
            marginBottom: "10px"
          }}
        >
          {title}
        </h5>

        <h2
          style={{
            margin: 0,
            fontWeight: "bold"
          }}
        >
          {value}
        </h2>
      </div>

      <div
        style={{
          fontSize: "42px"
        }}
      >
        {icon}
      </div>
    </div>
  );
}

export default DashboardCard;