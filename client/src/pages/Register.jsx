
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://trendywear-3uam.onrender.com/api/auth/register",
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
        }
      );

      if (!res.data.success || !res.data.user || !res.data.token) {
        setError(res.data.message || "Registration failed!");
        return;
      }

      // Save the new user's login session
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Remove any stale user session keys
      localStorage.removeItem("currentUser");
      localStorage.removeItem("loggedInUser");

      // Tell the website that the user has logged in
      window.dispatchEvent(new Event("userUpdated"));

      // Open the home page without requiring another login
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0d0d0d",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #b8860b",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 8px 32px rgba(184,134,11,0.2)",
        }}
      >
        <div className="text-center mb-4">
          <h2
            style={{
              color: "#b8860b",
              fontFamily: "Georgia, serif",
              fontSize: "2rem",
            }}
          >
            👗 TrendyWear
          </h2>

          <h4 style={{ color: "#fff", marginTop: "8px" }}>
            Create Account
          </h4>

          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            Join us for exclusive fashion collections
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#2d0a0a",
              border: "1px solid #ff4444",
              borderRadius: "8px",
              padding: "10px 15px",
              marginBottom: "20px",
              color: "#ff6666",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="mb-3">
            <label style={labelStyle}>Email Address</label>
            <input
              style={inputStyle}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label style={labelStyle}>Phone Number</label>
            <input
              style={inputStyle}
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="mb-3">
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Create a password"
            />
          </div>

          <div className="mb-4">
            <label style={labelStyle}>Confirm Password</label>
            <input
              style={inputStyle}
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#b8860b",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "13px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "⏳ Creating Account..." : "✨ Create Account"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#b8860b",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  color: "#d4af37",
  fontSize: "0.9rem",
  marginBottom: "6px",
  display: "block",
};

const inputStyle = {
  width: "100%",
  backgroundColor: "#2a2a2a",
  border: "1px solid #b8860b",
  borderRadius: "8px",
  padding: "12px 15px",
  color: "#fff",
  outline: "none",
  fontSize: "0.95rem",
};

export default Register;
