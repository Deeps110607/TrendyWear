import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://trendywear-3uam.onrender.com";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;

  const refreshNavbarCart = () => {
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // =====================================================
  // LOAD CART
  // =====================================================
  const loadCart = async () => {
    if (!userId) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/api/cart/${userId}`);

      const data = response.data;

      if (Array.isArray(data)) {
        setCart(data);
      } else if (Array.isArray(data.cart)) {
        setCart(data.cart);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Cart loading error:", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  // =====================================================
  // REMOVE ITEM
  // =====================================================
  const removeItem = async (productId) => {
    try {
      await axios.delete(
        `${API}/api/cart/${userId}/${productId}`
      );

      setMessage("Product removed from cart.");

      await loadCart();

      refreshNavbarCart();

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("Remove cart error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to remove product."
      );
    }
  };

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      await axios.put(
        `${API}/api/cart/${userId}/${productId}`,
        {
          quantity,
        }
      );

      await loadCart();

      refreshNavbarCart();
    } catch (error) {
      console.error("Quantity update error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to update quantity."
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    }
  };

  // =====================================================
  // TOTAL
  // =====================================================
  const totalAmount = cart.reduce((total, item) => {
    const product = item.productId;

    if (!product) return total;

    const price = Number(product.price || 0);
    const discount = Number(product.discount || 0);
    const quantity = Number(item.quantity || 1);

    const discountedPrice =
      discount > 0
        ? price - (price * discount) / 100
        : price;

    return total + discountedPrice * quantity;
  }, 0);

  // =====================================================
  // CHECKOUT
  // =====================================================
  const openPayment = () => {
    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    setShowPayment(true);
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================
  const placeOrder = async () => {
    if (!userId) {
      setMessage("Please login first.");
      return;
    }

    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    try {
      setProcessing(true);

      const items = cart
        .filter((item) => item.productId)
        .map((item) => ({
          productId: item.productId._id,
          quantity: Number(item.quantity || 1),
          price: item.productId.price,
          name: item.productId.name,
          size: item.size || "",
          color: item.color || "",
        }));

      if (items.length === 0) {
        setMessage("No valid products found in cart.");
        return;
      }

      const orderData = {
        userId,
        items,
        totalAmount,
        paymentMethod,
      };

      const response = await axios.post(
        `${API}/api/orders`,
        orderData
      );

      if (response.data.success) {
        setShowPayment(false);

        setCart([]);

        refreshNavbarCart();

        setMessage("Order placed successfully!");

        setTimeout(() => {
          setMessage("");
        }, 4000);
      } else {
        setMessage(
          response.data.message ||
            "Unable to place order."
        );
      }
    } catch (error) {
      console.error("Order error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to place order."
      );
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // NOT LOGGED IN
  // =====================================================
  if (!userId) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>🛒 Your Cart</h2>

          <p>Please login to view your cart.</p>

          <a
            href="/login"
            style={{
              display: "inline-block",
              padding: "10px 25px",
              background: "#b8860b",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
        }}
      >
        Loading cart...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* MESSAGE */}
      {message && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: "25px",
            zIndex: 9999,
            background: "#198754",
            color: "white",
            padding: "14px 25px",
            borderRadius: "8px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
        >
          {message}
        </div>
      )}

      <h1
        style={{
          marginBottom: "30px",
          fontWeight: "700",
        }}
      >
        🛒 My Cart
      </h1>

      {/* EMPTY CART */}
      {cart.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "70px 20px",
            background: "#fafafa",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontSize: "60px" }}>🛒</div>

          <h2>Your cart is empty</h2>

          <p>Add some products to your cart.</p>

          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: "15px",
              padding: "11px 25px",
              background: "#b8860b",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <>
          {/* CART ITEMS */}
          <div>
            {cart.map((item) => {
              const product = item.productId;

              if (!product) return null;

              const price = Number(product.price || 0);
              const discount = Number(product.discount || 0);

              const finalPrice =
                discount > 0
                  ? price - (price * discount) / 100
                  : price;

              return (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "18px",
                    marginBottom: "15px",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow:
                      "0 2px 10px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* IMAGE */}
                  <img
                    src={
  product.image?.startsWith("http")
    ? product.image
    : `${API}${product.image || ""}`
}
                    alt={product.name}
                    style={{
                      width: "110px",
                      height: "130px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />

                  {/* DETAILS */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: "8px" }}>
                      {product.name}
                    </h3>

                    <p
                      style={{
                        margin: "4px 0",
                        color: "#666",
                      }}
                    >
                      Category: {product.category}
                    </p>

                    <p
                      style={{
                        fontWeight: "bold",
                        color: "#b8860b",
                        fontSize: "18px",
                      }}
                    >
                      ₹{finalPrice.toFixed(2)}
                    </p>

                    {discount > 0 && (
                      <p
                        style={{
                          margin: "0",
                          color: "#dc3545",
                        }}
                      >
                        {discount}% OFF
                      </p>
                    )}

                    {item.size && (
                      <p>Size: {item.size}</p>
                    )}

                    {item.color && (
                      <p>Colour: {item.color}</p>
                    )}
                  </div>

                  {/* QUANTITY */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() =>
                        updateQuantity(
                          product._id,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                      style={{
                        width: "35px",
                        height: "35px",
                        border: "1px solid #ccc",
                        background:
                          item.quantity <= 1
                            ? "#eee"
                            : "white",
                        borderRadius: "5px",
                      }}
                    >
                      −
                    </button>

                    <strong>{item.quantity}</strong>

                    <button
                      onClick={() =>
                        updateQuantity(
                          product._id,
                          item.quantity + 1
                        )
                      }
                      style={{
                        width: "35px",
                        height: "35px",
                        border: "1px solid #ccc",
                        background: "white",
                        borderRadius: "5px",
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* ITEM TOTAL */}
                  <div
                    style={{
                      minWidth: "120px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    ₹
                    {(
                      finalPrice *
                      Number(item.quantity || 1)
                    ).toFixed(2)}
                  </div>

                  {/* REMOVE */}
                  <button
                    onClick={() =>
                      removeItem(product._id)
                    }
                    style={{
                      border: "none",
                      background: "#dc3545",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* TOTAL */}
          <div
            style={{
              marginTop: "30px",
              padding: "25px",
              background: "#f8f8f8",
              borderRadius: "12px",
              textAlign: "right",
            }}
          >
            <h2>
              Total: ₹{totalAmount.toFixed(2)}
            </h2>

            <button
              onClick={openPayment}
              style={{
                marginTop: "10px",
                padding: "13px 35px",
                background: "#b8860b",
                color: "white",
                border: "none",
                borderRadius: "7px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Proceed to Payment
            </button>
          </div>
        </>
      )}

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9998,
          }}
        >
          <div
            style={{
              width: "420px",
              maxWidth: "90%",
              background: "white",
              borderRadius: "15px",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              onClick={() =>
                !processing && setShowPayment(false)
              }
              disabled={processing}
              style={{
                position: "absolute",
                right: "15px",
                top: "10px",
                border: "none",
                background: "none",
                fontSize: "25px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <h2>Payment</h2>

            <p>
              <strong>
                {cart.length} item(s)
              </strong>{" "}
              in your order
            </p>

            <h3>
              Total: ₹{totalAmount.toFixed(2)}
            </h3>

            {/* PAYMENT OPTIONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              {["UPI", "CARD", "SCANNER"].map(
                (method) => (
                  <button
                    key={method}
                    onClick={() =>
                      setPaymentMethod(method)
                    }
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: "12px 5px",
                      border:
                        paymentMethod === method
                          ? "2px solid #b8860b"
                          : "1px solid #ccc",
                      background:
                        paymentMethod === method
                          ? "#fff8df"
                          : "white",
                      borderRadius: "7px",
                      fontWeight: "bold",
                    }}
                  >
                    {method}
                  </button>
                )
              )}
            </div>

            {/* SCANNER */}
            {paymentMethod === "SCANNER" && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                }}
              >
                <p>Scan to pay</p>

                <img
                  src="/payment-scanner.jpeg"
                  alt="Payment Scanner"
                  style={{
                    width: "220px",
                    height: "220px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {paymentMethod === "UPI" && (
              <div style={{ marginTop: "20px" }}>
                <p>
                  Pay using your UPI application.
                </p>
              </div>
            )}

            {paymentMethod === "CARD" && (
              <div style={{ marginTop: "20px" }}>
                <p>
                  Pay using your debit/credit card.
                </p>
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={processing}
              style={{
                width: "100%",
                marginTop: "25px",
                padding: "14px",
                background: processing
                  ? "#777"
                  : "#198754",
                color: "white",
                border: "none",
                borderRadius: "7px",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {processing
                ? "Processing..."
                : `Pay ₹${totalAmount.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
