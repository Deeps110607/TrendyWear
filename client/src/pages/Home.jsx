import React, { useEffect, useState } from "react";
import axios from "axios";
import SmartSearch from "../components/SmartSearch";
const API = "http://localhost:5000";

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Payment modal
  const [paymentProduct, setPaymentProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [orderPlacing, setOrderPlacing] = useState(false);

  // Success popup
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const user = getUser();

    if (user) {
      loadWishlist(user);
      loadCart(user);
    }
  }, []);

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================
  const getUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser || storedUser === "undefined") {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.log("Invalid user data:", error);
      return null;
    }
  };

  // =====================================================
  // LOAD PRODUCTS + CATEGORIES
  // =====================================================
  const loadData = async () => {
    try {
      setLoading(true);

      const [productRes, categoryRes] = await Promise.all([
        axios.get(`${API}/api/products`),
        axios.get(`${API}/api/categories`),
      ]);

      setProducts(productRes.data || []);
      setCategories(categoryRes.data?.categories || []);
    } catch (error) {
      console.log("Home loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD WISHLIST
  // =====================================================
  const loadWishlist = async (user) => {
    try {
      const userId = user?._id || user?.id;

      if (!userId) return;

      const res = await axios.get(
        `${API}/api/wishlist/${userId}`
      );

      const ids = (res.data?.wishlist || [])
        .map((item) => item.productId?._id)
        .filter(Boolean);

      setWishlistIds(ids);
    } catch (error) {
      console.log("Wishlist loading error:", error);
    }
  };

  // =====================================================
  // LOAD CART
  // =====================================================
  const loadCart = async (user) => {
    try {
      const userId = user?._id || user?.id;

      if (!userId) return;

      const res = await axios.get(
        `${API}/api/cart/${userId}`
      );

      const cartItems =
        res.data?.cart ||
        res.data?.items ||
        [];

      const ids = cartItems
        .map((item) =>
          item.productId?._id ||
          item.productId ||
          item.product?._id
        )
        .filter(Boolean);

      setCartIds(ids);
    } catch (error) {
      // Cart backend will be added next.
      console.log("Cart loading:", error.response?.data || error.message);
    }
  };

  // =====================================================
  // LOGIN CHECK
  // =====================================================
  const requireLogin = () => {
    const user = getUser();

    if (!user) {
      alert("Please login first to use Wishlist and Cart.");
      window.location.href = "/login";
      return null;
    }

    return user;
  };

  // =====================================================
  // WISHLIST
  // =====================================================
  const toggleWishlist = async (product) => {
    const user = requireLogin();

    if (!user) return;

    const userId = user._id || user.id;
    const productId = product._id;

    try {
      setActionLoading(true);

      const alreadyAdded = wishlistIds.includes(productId);

      if (alreadyAdded) {
        await axios.delete(
          `${API}/api/wishlist/${userId}/${productId}`
        );

        setWishlistIds((current) =>
          current.filter((id) => id !== productId)
        );

        showSuccess("Removed from Wishlist");
      } else {
        await axios.post(`${API}/api/wishlist`, {
          userId,
          productId,
        });

        setWishlistIds((current) => [
          ...current,
          productId,
        ]);

        showSuccess("❤️ Added to Wishlist");
      }
    } catch (error) {
      console.log("Wishlist error:", error);

      alert(
        error.response?.data?.message ||
          "Wishlist operation failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // ADD TO CART
  // =====================================================
  const addToCart = async (product) => {
    const user = requireLogin();

    if (!user) return;

    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    const userId = user._id || user.id;

    try {
      setActionLoading(true);

      await axios.post(`${API}/api/cart`, {
        userId,
        productId: product._id,
        quantity: 1,
      });
window.dispatchEvent(new Event("cartUpdated"));
      setCartIds((current) => {
        if (current.includes(product._id)) {
          return current;
        }

        return [...current, product._id];
      });

      showSuccess("🛒 Product added to Cart");
    } catch (error) {
      console.log("Cart error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add product to cart."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // BUY NOW
  // =====================================================
  const openBuyNow = (product) => {
    const user = requireLogin();

    if (!user) return;

    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    setPaymentProduct(product);
    setPaymentMethod("");
    setShowPayment(true);
  };

  // =====================================================
  // CLOSE PAYMENT
  // =====================================================
  const closePayment = () => {
    if (orderPlacing) return;

    setShowPayment(false);
    setPaymentProduct(null);
    setPaymentMethod("");
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================
  const placeOrder = async () => {
    if (!paymentProduct) return;

    const user = getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    const userId = user._id || user.id;

    try {
      setOrderPlacing(true);

      await axios.post(`${API}/api/orders`, {
        userId,
        items: [
          {
            productId: paymentProduct._id,
            quantity: 1,
            price: paymentProduct.price,
            name: paymentProduct.name,
          },
        ],
        totalAmount: paymentProduct.price,
        paymentMethod,
      });

      setShowPayment(false);
      setPaymentProduct(null);
      setPaymentMethod("");

      showSuccess("✅ Order placed successfully!");

      // Refresh products in case stock changes
      loadData();
    } catch (error) {
      console.log("Order error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to place order."
      );
    } finally {
      setOrderPlacing(false);
    }
  };

  // =====================================================
  // SUCCESS MESSAGE
  // =====================================================
  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // =====================================================
  // CATEGORY PRODUCTS
  // =====================================================
  const getCategoryProducts = (categoryName) => {
    return products.filter(
      (product) =>
        product.category?.toLowerCase() ===
        categoryName?.toLowerCase()
    );
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div
        className="text-center py-5"
        style={{
          minHeight: "80vh",
        }}
      >
        <div className="spinner-border text-warning"></div>

        <p className="mt-3 text-muted">
          Loading TrendyWear collection...
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

      {/* =================================================
          SUCCESS POPUP
      ================================================= */}
      {successMessage && (
        <div
          style={{
            position: "fixed",
            top: "25px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            backgroundColor: "#198754",
            color: "white",
            padding: "14px 28px",
            borderRadius: "10px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
            fontWeight: "bold",
            minWidth: "280px",
            textAlign: "center",
          }}
        >
          {successMessage}
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="container py-5">

        <div className="text-center mb-5">

          <h1
            style={{
              fontWeight: "bold",
              color: "#b8860b",
            }}
          >
            TrendyWear Women's Collection
          </h1>

          <p className="text-muted">
            Discover the latest fashion trends specially
            designed for women.
          </p>

        </div>
  
<SmartSearch
  products={products}
  wishlistIds={wishlistIds}
  cartIds={cartIds}
  toggleWishlist={toggleWishlist}
  addToCart={addToCart}
  openBuyNow={openBuyNow}
  actionLoading={actionLoading}
/>


        {/* =================================================
            NO CATEGORIES
        ================================================= */}
        {categories.length === 0 && (
          <div className="text-center py-5">
            <h3>No Categories Available</h3>

            <p className="text-muted">
              Admin has not created any categories yet.
            </p>
          </div>
        )}

        {/* =================================================
            CATEGORY SECTIONS
        ================================================= */}
        {categories.map((category) => {

          const categoryProducts =
            getCategoryProducts(category.name);

          if (categoryProducts.length === 0) {
            return null;
          }

          const categoryName =
            category.name.toLowerCase();

          const isNightwear =
            categoryName === "nightwear" ||
            categoryName === "nightdress";

          return (
            <section
              key={category._id}
              className="mb-5"
            >

              {/* CATEGORY TITLE */}
              <div className="text-center mb-4">

                <h2
                  style={{
                    fontWeight: "bold",
                    color: "#1a1a1a",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {category.name}
                </h2>

                <div
                  style={{
                    width: "70px",
                    height: "4px",
                    backgroundColor: "#b8860b",
                    margin: "10px auto",
                    borderRadius: "5px",
                  }}
                />

                <p className="text-muted">
                  Explore our{" "}
                  {category.name.toLowerCase()} collection
                </p>

              </div>

              {/* NIGHTWEAR HORIZONTAL SCROLL */}
              {isNightwear ? (
                <div
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "20px",
                    padding: "10px 5px 25px",
                  }}
                >
                  {categoryProducts.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        minWidth: "280px",
                        maxWidth: "280px",
                        flexShrink: 0,
                      }}
                    >
                      <ProductCard
                        item={item}
                        wishlistIds={wishlistIds}
                        cartIds={cartIds}
                        toggleWishlist={toggleWishlist}
                        addToCart={addToCart}
                        openBuyNow={openBuyNow}
                        actionLoading={actionLoading}
                      />
                    </div>
                  ))}
                </div>
              ) : (

                /* NORMAL CATEGORY GRID */
                <div className="row">

                  {categoryProducts.map((item) => (
                    <div
                      className="col-lg-3 col-md-4 col-sm-6 mb-4"
                      key={item._id}
                    >
                      <ProductCard
                        item={item}
                        wishlistIds={wishlistIds}
                        cartIds={cartIds}
                        toggleWishlist={toggleWishlist}
                        addToCart={addToCart}
                        openBuyNow={openBuyNow}
                        actionLoading={actionLoading}
                      />
                    </div>
                  ))}

                </div>
              )}

            </section>
          );
        })}
      </div>

      {/* =================================================
          BUY NOW PAYMENT MODAL
      ================================================= */}
      {showPayment && paymentProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "30px",
              boxShadow:
                "0 10px 40px rgba(0,0,0,0.4)",
            }}
          >

            {/* MODAL HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">

              <h3
                className="fw-bold mb-0"
                style={{
                  color: "#b8860b",
                }}
              >
                Complete Payment
              </h3>

              <button
                onClick={closePayment}
                disabled={orderPlacing}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "25px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>

            </div>

            {/* PRODUCT */}
            <div
              className="d-flex align-items-center mb-4"
              style={{
                backgroundColor: "#f7f7f7",
                borderRadius: "12px",
                padding: "12px",
              }}
            >

              <img
                src={`${API}${paymentProduct.image}`}
                alt={paymentProduct.name}
                style={{
                  width: "80px",
                  height: "90px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

              <div className="ms-3">

                <h6 className="fw-bold mb-1">
                  {paymentProduct.name}
                </h6>

                <p
                  className="mb-0 fw-bold"
                  style={{
                    color: "crimson",
                  }}
                >
                  ₹{paymentProduct.price}
                </p>

              </div>

            </div>

            {/* PAYMENT METHODS */}
            <h5 className="fw-bold mb-3">
              Select Payment Method
            </h5>

            {/* UPI */}
            <label
              className="d-block border rounded p-3 mb-2"
              style={{
                cursor: "pointer",
                backgroundColor:
                  paymentMethod === "UPI"
                    ? "#fff8dc"
                    : "white",
              }}
            >

              <input
                type="radio"
                name="payment"
                value="UPI"
                checked={paymentMethod === "UPI"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="me-2"
              />

              <strong>📱 UPI</strong>

            </label>

            {/* CARD */}
            <label
              className="d-block border rounded p-3 mb-2"
              style={{
                cursor: "pointer",
                backgroundColor:
                  paymentMethod === "CARD"
                    ? "#fff8dc"
                    : "white",
              }}
            >

              <input
                type="radio"
                name="payment"
                value="CARD"
                checked={paymentMethod === "CARD"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="me-2"
              />

              <strong>💳 Card</strong>

            </label>

            {/* SCANNER */}
            <label
              className="d-block border rounded p-3 mb-3"
              style={{
                cursor: "pointer",
                backgroundColor:
                  paymentMethod === "SCANNER"
                    ? "#fff8dc"
                    : "white",
              }}
            >

              <input
                type="radio"
                name="payment"
                value="SCANNER"
                checked={paymentMethod === "SCANNER"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="me-2"
              />

              <strong>📷 Scanner</strong>

            </label>

            {/* SCANNER IMAGE */}
            {paymentMethod === "SCANNER" && (
              <div
                className="text-center mb-4"
                style={{
                  backgroundColor: "#f8f8f8",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >

                <p className="fw-bold">
                  Scan to make payment
                </p>

                <img
                  src="/payment-scanner.jpg"
                  alt="Payment Scanner"
                  style={{
                    width: "220px",
                    height: "220px",
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    backgroundColor: "white",
                  }}
                />

              </div>
            )}

            {/* UPI INFORMATION */}
            {paymentMethod === "UPI" && (
              <div
                className="alert alert-info"
              >
                Enter your UPI payment through your
                preferred UPI application.
              </div>
            )}

            {/* CARD INFORMATION */}
            {paymentMethod === "CARD" && (
              <div
                className="mb-3"
              >

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Card Number"
                  maxLength="19"
                />

                <div className="row">

                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div className="col-6">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="CVV"
                      maxLength="3"
                    />
                  </div>

                </div>

              </div>
            )}

            {/* TOTAL */}
            <div
              className="d-flex justify-content-between align-items-center border-top pt-3 mt-3"
            >

              <strong>
                Total Amount
              </strong>

              <h4
                className="mb-0"
                style={{
                  color: "crimson",
                }}
              >
                ₹{paymentProduct.price}
              </h4>

            </div>

            {/* PAY BUTTON */}
            <button
              className="btn btn-warning w-100 mt-4 py-3 fw-bold"
              onClick={placeOrder}
              disabled={
                orderPlacing ||
                !paymentMethod
              }
            >
              {orderPlacing
                ? "Processing Order..."
                : `Pay ₹${paymentProduct.price}`}
            </button>

            <button
              className="btn btn-light w-100 mt-2"
              onClick={closePayment}
              disabled={orderPlacing}
            >
              Cancel
            </button>

          </div>
        </div>
      )}

    </div>
  );
}


// =====================================================
// PRODUCT CARD
// =====================================================
function ProductCard({
  item,
  wishlistIds,
  cartIds,
  toggleWishlist,
  addToCart,
  openBuyNow,
  actionLoading,
}) {
  const isWishlist =
    wishlistIds.includes(item._id);

  const isCart =
    cartIds.includes(item._id);

  return (
    <div
      className="card shadow-sm h-100"
      style={{
        borderRadius: "15px",
        overflow: "hidden",
        border: "none",
        position: "relative",
      }}
    >

      {/* =================================================
          PRODUCT IMAGE
      ================================================= */}
      <div
        style={{
          position: "relative",
        }}
      >

        <img
          src={`${API}${item.image}`}
          alt={item.name}
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

        {/* =================================================
            WISHLIST BUTTON
        ================================================= */}
        <button
          onClick={() =>
            toggleWishlist(item)
          }
          disabled={actionLoading}
          title={
            isWishlist
              ? "Remove from Wishlist"
              : "Add to Wishlist"
          }
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "45px",
            height: "45px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "white",
            color: isWishlist
              ? "crimson"
              : "#555",
            fontSize: "22px",
            boxShadow:
              "0 3px 10px rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          {isWishlist ? "❤️" : "♡"}
        </button>

      </div>

      {/* =================================================
          PRODUCT DETAILS
      ================================================= */}
      <div className="card-body d-flex flex-column">

        <h5
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          {item.name}
        </h5>

        <p
          className="text-muted"
          style={{
            marginBottom: "8px",
          }}
        >
          {item.category}
        </p>

        <p
          style={{
            fontSize: "14px",
            minHeight: "45px",
            color: "#555",
          }}
        >
          {item.description ||
            "Beautiful women's fashion collection."}
        </p>

        <h4
          style={{
            color: "crimson",
            fontWeight: "bold",
          }}
        >
          ₹{item.price}
        </h4>

        {item.stock > 0 ? (
          <small
            style={{
              color: "green",
              marginBottom: "12px",
            }}
          >
            ✓ In Stock
          </small>
        ) : (
          <small
            style={{
              color: "red",
              marginBottom: "12px",
            }}
          >
            ✕ Out of Stock
          </small>
        )}

        {/* =================================================
            ADD TO CART
        ================================================= */}
        <button
          className="btn w-100 mb-2"
          onClick={() => addToCart(item)}
          disabled={
            item.stock <= 0 ||
            actionLoading
          }
          style={{
            backgroundColor: isCart
              ? "#198754"
              : "#1a1a1a",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {isCart
            ? "✓ Added to Cart"
            : "🛒 Add to Cart"}
        </button>

        {/* =================================================
            BUY NOW
        ================================================= */}
        <button
          className="btn btn-warning w-100"
          onClick={() => openBuyNow(item)}
          disabled={
            item.stock <= 0 ||
            actionLoading
          }
          style={{
            fontWeight: "bold",
          }}
        >
          ⚡ Buy Now
        </button>

      </div>
    </div>
  );
}

export default Home;