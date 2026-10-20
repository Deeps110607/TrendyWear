import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Wishlist() {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser || storedUser === "undefined") {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (err) {
      console.log("User loading error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);

      const userId = user._id || user.id;

      if (!userId) {
        console.log("User ID not found");
        return;
      }

      const res = await axios.get(
        `https://trendywear-3uam.onrender.com/api/wishlist/${userId}`
      );

      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.log("Wishlist loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const userId = user._id || user.id;

      await axios.delete(
        `https://trendywear-3uam.onrender.com/api/wishlist/${userId}/${productId}`
      );

      setWishlist((current) =>
        current.filter(
          (item) => item.productId?._id !== productId
        )
      );
    } catch (err) {
      console.log("Remove wishlist error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to remove from wishlist."
      );
    }
  };

  if (!user) {
    return (
      <div
        className="container py-5 text-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="py-5">
          <div style={{ fontSize: "60px" }}>🔐</div>

          <h2 className="fw-bold mt-3">
            Login Required
          </h2>

          <p className="text-muted">
            Please login to view your wishlist.
          </p>

          <Link
            to="/login"
            className="btn btn-warning px-4"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="container py-5 text-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="spinner-border text-warning"></div>

        <p className="mt-3 text-muted">
          Loading wishlist...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <div className="container py-5">

        <div className="text-center mb-5">
          <h1
            className="fw-bold"
            style={{ color: "#b8860b" }}
          >
            ❤️ My Wishlist
          </h1>

          <p className="text-muted">
            Your favourite TrendyWear products
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "70px" }}>
              🤍
            </div>

            <h3 className="fw-bold mt-3">
              Your wishlist is empty
            </h3>

            <p className="text-muted">
              Add products you love to your wishlist.
            </p>

            <Link
              to="/"
              className="btn btn-warning px-4"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="row">

            {wishlist.map((item) => {
              const product = item.productId;

              if (!product) {
                return null;
              }

              return (
                <div
                  className="col-lg-3 col-md-4 col-sm-6 mb-4"
                  key={item._id}
                >
                  <div
                    className="card h-100 shadow-sm"
                    style={{
                      borderRadius: "15px",
                      overflow: "hidden",
                      border: "none",
                    }}
                  >

                    {/* PRODUCT IMAGE */}
                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <img
                        src={`https://trendywear-3uam.onrender.com${product.image}`}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "320px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x350?text=No+Image";
                        }}
                      />

                      {/* REMOVE WISHLIST */}
                      <button
                        onClick={() =>
                          removeFromWishlist(product._id)
                        }
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          width: "42px",                         height: "42px",                      borderRadius: "50%",                   border: "none",              backgroundColor: "white",
                        color: "crimson",                       fontSize: "20px",
                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        }}
                        title="Remove from wishlist"
                    >
                        ❤️                     </button>
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="card-body d-flex flex-column">

                    <h5 className="fw-bold">
                        {product.name}                      </h5>                     <p className="text-muted mb-2">
                        {product.category}                     </p>                      <p
                        style={{                         fontSize: "14px",                         minHeight: "42px",
                        }}                     >
                        {product.description ||                         "Beautiful women's fashion collection."}                     </p>                     <h4
                        style={{                          color: "crimson",                          fontWeight: "bold",
                        }}                      >
                        ₹{product.price}                      </h4>                     {product.stock > 0 ? (
                        <small                         style={{
                            color: "green",
                            marginBottom: "10px",                         }}
                        >                         ✓ In Stock
                        </small>                      ) : (
                        <small                          style={{
                            color: "red",
                            marginBottom: "10px",                          }}
                        >                          ✕ Out of Stock
                        </small>                      )}                     <button
                        className="btn btn-warning w-100 mt-auto"
                        disabled={product.stock <= 0}  >
                        {product.stock > 0              ? "Add to Cart"
                    : "Out of Stock"}         </button>

                    </div>                  </div>
                </div>             );
            })}          </div>
        )}      </div>
    </div>  );
}

export default Wishlist;
