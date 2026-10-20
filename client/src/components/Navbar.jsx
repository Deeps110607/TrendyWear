import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // ==============================
  // LOAD USER FROM LOCAL STORAGE
  // ==============================
  const loadUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        localStorage.getItem("loggedInUser");

      if (!storedUser) {
        setUser(null);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("Navbar user error:", error);
      setUser(null);
    }
  };

  // ==============================
  // LOAD CART COUNT
  // ==============================
  const loadCartCount = async (currentUser = null) => {
    try {
      const activeUser = currentUser || user;

      if (!activeUser) {
        setCartCount(0);
        return;
      }

      const userId = activeUser._id || activeUser.id;

      if (!userId) {
        setCartCount(0);
        return;
      }

      const response = await axios.get(`${API}/api/cart/${userId}`);

      const cartData = Array.isArray(response.data)
        ? response.data
        : response.data?.cart || [];

      const totalQuantity = cartData.reduce(
        (total, item) => total + Number(item.quantity || 1),
        0
      );

      setCartCount(totalQuantity);
    } catch (error) {
      console.log("Cart count error:", error);
      setCartCount(0);
    }
  };

  // ==============================
  // INITIAL USER LOAD
  // ==============================
  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // ==============================
  // REFRESH CART WHEN USER CHANGES
  // ==============================
  useEffect(() => {
    loadCartCount(user);
  }, [user]);

  // ==============================
  // LISTEN FOR LOGIN / LOGOUT
  // ==============================
  useEffect(() => {
    const handleUserUpdated = () => {
      loadUser();
    };

    const handleStorage = () => {
      loadUser();
    };

    const handleCartUpdated = () => {
      loadCartCount();
    };

    window.addEventListener("userUpdated", handleUserUpdated);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedInUser");

    setUser(null);
    setCartCount(0);

    window.dispatchEvent(new Event("userUpdated"));

    navigate("/login");
  };

  // ==============================
  // CHECK ADMIN
  // ==============================
  const isAdmin =
    user &&
    (
      user.role === "admin" ||
      user.role === "Admin" ||
      user.userType === "admin" ||
      user.userType === "Admin" ||
      user.isAdmin === true
    );

  // ==============================
  // NAVBAR
  // ==============================
  return (
    <nav
      style={{
        width: "100%",
        height: "65px",
        background: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 5%",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        zIndex: 9999,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}
    >
      {/* ================= BRAND ================= */}
      <Link
        to={isAdmin ? "/admin" : "/"}
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontSize: "25px",
          }}
        >
          👗
        </span>

        <span
          style={{
            color: "#ffbf00",
            fontSize: "25px",
            fontWeight: "700",
          }}
        >
          TrendyWear
        </span>
      </Link>

      {/* ================= RIGHT SIDE ================= */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* ================= GUEST ================= */}
        {!user && (
          <>
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                color: "#ffbf00",
                border: "1px solid #ffbf00",
                padding: "8px 15px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Login
            </Link>

            <Link
              to="/register"
              style={{
                textDecoration: "none",
                color: "#1a1a1a",
                background: "#ffbf00",
                padding: "9px 15px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Register
            </Link>
          </>
        )}

        {/* ================= ADMIN ================= */}
        {user && isAdmin && (
          <>
            <Link
              to="/"
              style={navLinkStyle}
            >
              Home
            </Link>

            <Link
              to="/admin"
              style={navLinkStyle}
            >
              Dashboard
            </Link>

            <Link
              to="/admin/support"
              style={navLinkStyle}
            >
              Customer Support
            </Link>

            <button
              onClick={handleLogout}
              style={logoutStyle}
            >
              Logout
            </button>
          </>
        )}

        {/* ================= CUSTOMER ================= */}
        {user && !isAdmin && (
          <>
            <Link
              to="/"
              style={navLinkStyle}
            >
              Home
            </Link>

            <Link
              to="/wishlist"
              style={navLinkStyle}
            >
              ❤️ Wishlist
            </Link>

            <Link
              to="/cart"
              style={{
                ...navLinkStyle,
                position: "relative",
              }}
            >
              🛒 Cart

              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-10px",
                    minWidth: "19px",
                    height: "19px",
                    padding: "0 4px",
                    borderRadius: "50%",
                    background: "#e53935",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/my-orders"
              style={navLinkStyle}
            >
              My Orders
            </Link>

            <Link
              to="/profile"
              style={navLinkStyle}
            >
              Profile
            </Link>

            <Link
              to="/complaints"
              style={navLinkStyle}
            >
              Support
            </Link>

            <button
              onClick={handleLogout}
              style={logoutStyle}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

// ==============================
// STYLES
// ==============================

const navLinkStyle = {
  textDecoration: "none",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "500",
  padding: "8px 10px",
  borderRadius: "5px",
  whiteSpace: "nowrap",
};

const logoutStyle = {
  border: "1px solid #ffbf00",
  background: "transparent",
  color: "#ffbf00",
  padding: "8px 14px",
  borderRadius: "6px",
  fontSize: "14px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export default Navbar;