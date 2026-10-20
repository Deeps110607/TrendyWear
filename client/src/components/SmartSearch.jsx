import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

function SmartSearch({
  products = [],
  wishlistIds = [],
  cartIds = [],
  toggleWishlist,
  addToCart,
  openBuyNow,
  actionLoading = false,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // =====================================================
  // NORMAL SEARCH
  // =====================================================

  const normalResults = (() => {
    const text = query.trim().toLowerCase();

    if (!text) return [];

    const words = text
      .split(/\s+/)
      .filter(Boolean);

    return products
      .filter((product) => {
        const searchableText = [
          product.name,
          product.category,
          product.description,
          ...(Array.isArray(product.colors)
            ? product.colors
            : [product.colors]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return words.every((word) =>
          searchableText.includes(word)
        );
      })
      .slice(0, 12);
  })();

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10 MB.");
      return;
    }

    setImageFile(file);
    setAiResult(null);
    setAiError("");

    const url = URL.createObjectURL(file);
    setPreview(url);

    setOpen(true);
  };

  // =====================================================
  // CLEAR IMAGE
  // =====================================================

  const clearImage = () => {
    setImageFile(null);
    setPreview("");
    setAiResult(null);
    setAiError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  // =====================================================
  // AI SEARCH
  // =====================================================

  const findAIProducts = async () => {
    if (!imageFile) {
      setAiError("Please select a dress photo first.");
      return;
    }

    try {
      setAiLoading(true);
      setAiError("");
      setAiResult(null);

      const formData = new FormData();

      formData.append("image", imageFile);

      const response = await axios.post(
        `${API}/api/ai/analyze-dress`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000,
        }
      );

      if (!response.data?.success) {
        setAiError(
          response.data?.message ||
            "Unable to find matching products."
        );
        return;
      }

      setAiResult(response.data);
    } catch (error) {
      console.error(
        "AI search error:",
        error.response?.data || error
      );

      setAiError(
  error.response?.data?.message ||
    error.message ||
    "Unknown AI search error"
);
    } finally {
      setAiLoading(false);
    }
  };

  // =====================================================
  // IMAGE CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =====================================================
  // PRODUCT IMAGE
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "https://via.placeholder.com/300x350?text=No+Image";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // =====================================================
  // PRODUCT CARD
  // =====================================================

  const ProductResultCard = ({ product, aiScore }) => {
    const isWishlist = wishlistIds.includes(product._id);
    const isCart = cartIds.includes(product._id);

    return (
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #eee",
          boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/300x350?text=No+Image";
            }}
          />

          {aiScore && (
            <span
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                background: "#b8860b",
                color: "white",
                padding: "5px 9px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {aiScore}% Match
            </span>
          )}

          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            disabled={actionLoading}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "none",
              background: "white",
              fontSize: "20px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {isWishlist ? "❤️" : "♡"}
          </button>
        </div>

        <div style={{ padding: "14px" }}>
          <h6
            style={{
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            {product.name}
          </h6>

          <div
            style={{
              fontSize: "13px",
              color: "#777",
              marginBottom: "5px",
            }}
          >
            {product.category}
          </div>

          <div
            style={{
              color: "#b8860b",
              fontWeight: "bold",
              fontSize: "18px",
              marginBottom: "10px",
            }}
          >
            ₹{product.price}
          </div>

          {aiScore && product.matchReasons?.length > 0 && (
            <div
              style={{
                fontSize: "12px",
                color: "#555",
                marginBottom: "10px",
              }}
            >
              {product.matchReasons
                .slice(0, 2)
                .map((reason, index) => (
                  <div key={index}>✓ {reason}</div>
                ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "7px",
            }}
          >
            <button
              type="button"
              onClick={() => addToCart(product)}
              disabled={actionLoading}
              style={{
                flex: 1,
                border: "none",
                borderRadius: "6px",
                padding: "8px",
                background: isCart
                  ? "#198754"
                  : "#212529",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {isCart ? "✓ Cart" : "🛒 Cart"}
            </button>

            <button
              type="button"
              onClick={() => openBuyNow(product)}
              disabled={actionLoading}
              style={{
                flex: 1,
                border: "none",
                borderRadius: "6px",
                padding: "8px",
                background: "#b8860b",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              ⚡ Buy
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "470px",
      }}
    >
      {/* =================================================
          SEARCH BAR
      ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "30px",
          padding: "5px 7px 5px 16px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
        }}
      >
        <span
          style={{
            fontSize: "19px",
            marginRight: "8px",
          }}
        >
          🔍
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setAiResult(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search saree, kurti, nightwear..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "14px",
            minWidth: 0,
          }}
        />

        {/* PHOTO BUTTON */}

        <button
          type="button"
          onClick={() => {
            setOpen(true);
            fileInputRef.current?.click();
          }}
          title="Upload dress photo"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "none",
            background: "#f5f5f5",
            fontSize: "18px",
            cursor: "pointer",
            marginLeft: "5px",
          }}
        >
          📷
        </button>
      </div>

      {/* =================================================
          HIDDEN FILE INPUT
      ================================================= */}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      {/* CAMERA INPUT */}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      {/* =================================================
          SEARCH PANEL
      ================================================= */}

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "52px",
              right: 0,
              width: "min(600px, 92vw)",
              maxHeight: "75vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "15px",
              boxShadow: "0 12px 35px rgba(0,0,0,0.2)",
              zIndex: 1000,
              padding: "18px",
            }}
          >
            {/* =================================================
                PHOTO SEARCH
            ================================================= */}

            <div
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "15px",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "15px",
                  marginBottom: "4px",
                }}
              >
                🤖 Find your best fashion match
              </div>

              <div
                style={{
                  color: "#777",
                  fontSize: "12px",
                  marginBottom: "12px",
                }}
              >
                Upload or take a photo of a dress and TrendyWear AI
                will find matching products from our collection.
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  style={{
                    border: "1px solid #b8860b",
                    background: "white",
                    color: "#8a6500",
                    borderRadius: "7px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  📁 Upload Photo
                </button>

                <button
                  type="button"
                  onClick={() =>
                    cameraInputRef.current?.click()
                  }
                  style={{
                    border: "none",
                    background: "#b8860b",
                    color: "white",
                    borderRadius: "7px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  📸 Take Photo
                </button>

                {imageFile && (
                  <button
                    type="button"
                    onClick={clearImage}
                    style={{
                      border: "none",
                      background: "#f1f1f1",
                      color: "#555",
                      borderRadius: "7px",
                      padding: "8px 12px",
                      fontSize: "13px",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {preview && (
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <img
                    src={preview}
                    alt="Selected dress"
                    style={{
                      width: "75px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "7px",
                      }}
                    >
                      {imageFile?.name}
                    </div>

                    <button
                      type="button"
                      onClick={findAIProducts}
                      disabled={aiLoading}
                      style={{
                        border: "none",
                        background: "#212529",
                        color: "white",
                        borderRadius: "7px",
                        padding: "8px 14px",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {aiLoading
                        ? "🤖 Finding matches..."
                        : "✨ Find AI Matches"}
                    </button>
                  </div>
                </div>
              )}

              {aiError && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px",
                    background: "#fff1f1",
                    color: "#c62828",
                    borderRadius: "7px",
                    fontSize: "13px",
                  }}
                >
                  {aiError}
                </div>
              )}
            </div>

            {/* =================================================
                AI ANALYSIS
            ================================================= */}

            {aiResult?.analysis && (
              <div
                style={{
                  background: "#faf7ef",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "15px",
                }}
              >
                <strong>AI detected:</strong>

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                    marginTop: "8px",
                  }}
                >
                  {[
                    ["Type", aiResult.analysis.dressType],
                    ["Color", aiResult.analysis.color],
                    ["Shade", aiResult.analysis.shade],
                    ["Pattern", aiResult.analysis.pattern],
                    ["Style", aiResult.analysis.style],
                  ].map(([label, value]) => (
                    <span
                      key={label}
                      style={{
                        background: "white",
                        border: "1px solid #eadfbf",
                        padding: "5px 8px",
                        borderRadius: "15px",
                        fontSize: "11px",
                      }}
                    >
                      <strong>{label}:</strong> {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                AI RESULTS
            ================================================= */}

            {aiResult && (
              <div>
                <h6
                  style={{
                    fontWeight: "bold",
                    marginBottom: "12px",
                  }}
                >
                  ✨ Best matches
                </h6>

                {aiResult.matches?.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {aiResult.matches.map((product) => (
                      <ProductResultCard
                        key={product._id}
                        product={product}
                        aiScore={product.matchScore}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#666",
                      background: "#fafafa",
                      borderRadius: "10px",
                    }}
                  >
                    😔{" "}
                    {aiResult.message ||
                      "No matching product is currently available in TrendyWear."}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                NORMAL SEARCH RESULTS
            ================================================= */}

            {!aiResult &&
              query.trim() &&
              normalResults.length > 0 && (
                <div>
                  <h6
                    style={{
                      fontWeight: "bold",
                      marginBottom: "12px",
                    }}
                  >
                    🔎 Search results
                  </h6>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {normalResults.map((product) => (
                      <ProductResultCard
                        key={product._id}
                        product={product}
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* =================================================
                NORMAL SEARCH - NO RESULTS
            ================================================= */}

            {!aiResult &&
              query.trim() &&
              normalResults.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#777",
                  }}
                >
                  No products found for{" "}
                  <strong>"{query}"</strong>
                </div>
              )}

            {/* =================================================
                EMPTY SEARCH
            ================================================= */}

            {!query.trim() && !imageFile && !aiResult && (
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  color: "#777",
                  fontSize: "13px",
                }}
              >
                Search normally or use 📷 to find a dress by photo.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SmartSearch;