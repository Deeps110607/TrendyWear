import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const res = await axios.post(
        "https://trendywear-3uam.onrender.com/api/auth/login",
        form
      );

      if (!res.data.success) {

        setError(res.data.message);

        setLoading(false);

        return;

      }

      localStorage.setItem("token", res.data.token);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {

        navigate("/admin");

      } else {

        navigate("/");

      }

    } catch (err) {

      setError(err.response?.data?.message || "Login Failed");

    }

    setLoading(false);

  };

  return (

    <div
      style={{
        background: "#0d0d0d",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <div
        style={{
          width: "420px",
          background: "#1b1b1b",
          borderRadius: "15px",
          padding: "35px",
          border: "1px solid gold",
        }}
      >

        <h2
          style={{
            color: "gold",
            textAlign: "center",
          }}
        >
          👗 TrendyWear AI
        </h2>

        <h5
          style={{
            color: "white",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Smart Fashion Starts Here
        </h5>

        {error && (

          <div className="alert alert-danger">

            {error}

          </div>

        )}

        <form onSubmit={handleSubmit}>

          <input
            className="form-control mb-3"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            className="form-control mb-3"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            className="btn btn-warning w-100"
            disabled={loading}
          >

            {loading ? "Please Wait..." : "Login"}

          </button>

        </form>

        <p
          style={{
            color: "white",
            textAlign: "center",
            marginTop: "20px",
          }}
        >

          Don't have an account?

          <Link
            to="/register"
            style={{
              color: "gold",
              marginLeft: "8px",
            }}
          >

            Register

          </Link>

        </p>

      </div>

    </div>

  );

}

export default Login;
