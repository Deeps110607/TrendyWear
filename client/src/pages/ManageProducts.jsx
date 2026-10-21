import React, { useEffect, useState } from "react";
import axios from "axios";

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const [editingProduct, setEditingProduct] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    discount: 0,
    stock: "",
    colors: "",
    sizes: "",
    isFeatured: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // LOAD PRODUCTS + CATEGORIES
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [productRes, categoryRes] = await Promise.all([
        axios.get("https://trendywear-3uam.onrender.com/api/products"),
        axios.get("https://trendywear-3uam.onrender.com/api/categories"),
      ]);

      setProducts(productRes.data || []);
      setCategories(categoryRes.data.categories || []);
    } catch (err) {
      console.log("Loading error:", err);
      alert("❌ Failed to load product management data.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SEARCH + CATEGORY FILTER
  // ==========================================

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      product.name?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.brand?.toLowerCase().includes(searchText);

    const matchesCategory =
      categoryFilter === "All" ||
      product.category?.toLowerCase() ===
        categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // ==========================================
  // START EDIT
  // ==========================================

  const startEdit = (product) => {
    setEditingProduct(product);

    setEditForm({
      name: product.name || "",
      category: product.category || "",
      brand: product.brand || "TrendyWear",
      description: product.description || "",
      price: product.price || "",
      discount: product.discount || 0,
      stock: product.stock || "",
      colors: Array.isArray(product.colors)
        ? product.colors.join(", ")
        : "",
      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(", ")
        : "",
      isFeatured: product.isFeatured || false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // EDIT FORM CHANGE
  // ==========================================

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const updateProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      const updatedProduct = {
        name: editForm.name,
        category: editForm.category,
        brand: editForm.brand,
        description: editForm.description,
        price: Number(editForm.price),
        discount: Number(editForm.discount),
        stock: Number(editForm.stock),

        colors: editForm.colors
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),

        sizes: editForm.sizes
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),

        isFeatured: editForm.isFeatured,
      };

      const res = await axios.put(
        `https://trendywear-3uam.onrender.com/api/products/${editingProduct._id}`,
        updatedProduct
      );

      alert("✅ Product updated successfully.");

      setEditingProduct(null);

      // Update product immediately in UI
      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product._id === editingProduct._id
            ? res.data
            : product
        )
      );
    } catch (err) {
      console.log("Update error:", err);

      alert(
        err.response?.data?.message ||
          "❌ Failed to update product."
      );
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${name}"?\n\nThis product will be removed from the product collection.`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://trendywear-3uam.onrender.com/api/products/${id}`
      );

      // Remove from current screen immediately
      setProducts((previousProducts) =>
        previousProducts.filter(
          (product) => product._id !== id
        )
      );

      alert("✅ Product deleted successfully.");
    } catch (err) {
      console.log("Delete error:", err);

      alert(
        err.response?.data?.message ||
          "❌ Failed to delete product."
      );
    }
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const cancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        padding: "30px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div className="container-fluid">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h2
              style={{
                fontWeight: "bold",
                color: "#b8860b",
              }}
            >
              📦 Product Management
            </h2>

            <p className="text-muted mb-0">
              Add, edit, search and manage your TrendyWear products.
            </p>
          </div>

          <button
            className="btn btn-warning fw-bold"
            onClick={loadData}
          >
            🔄 Refresh
          </button>

        </div>

        {/* ==========================================
            EDIT PRODUCT
        ========================================== */}

        {editingProduct && (
          <div
            className="card shadow border-0 mb-4"
            style={{
              borderRadius: "15px",
            }}
          >
            <div
              className="card-header text-white"
              style={{
                backgroundColor: "#1a1a1a",
              }}
            >
              <h5 className="mb-0">
                ✏️ Edit Product
              </h5>
            </div>

            <div className="card-body p-4">

              <form onSubmit={updateProduct}>

                <div className="row">

                  {/* PRODUCT NAME */}

                  <div className="col-md-6 mb-3">

                    <label className="form-label fw-bold">
                      Product Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  {/* CATEGORY */}

                  <div className="col-md-6 mb-3">

                    <label className="form-label fw-bold">
                      Category
                    </label>

                    <select
                      className="form-control"
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">
                        Select Category
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category._id}
                          value={category.name}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>

                  </div>

                  {/* BRAND */}

                  <div className="col-md-6 mb-3">

                    <label className="form-label fw-bold">
                      Brand
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="brand"
                      value={editForm.brand}
                      onChange={handleEditChange}
                    />

                  </div>

                  {/* PRICE */}

                  <div className="col-md-6 mb-3">

                    <label className="form-label fw-bold">
                      Price
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      min="0"
                      required
                    />

                  </div>

                  {/* STOCK */}

                  <div className="col-md-6 mb-3">

                    <label className="form-label fw-bold">
                      Stock
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      name="stock"
                      value={editForm.stock}
                      onChange={handleEditChange}
                      min="0"
                      required
                    />

                  </div>

                  {/* DISCOUNT */}

                  <div className="col-md-6 mb-3">

                    <label className="form-label fw-bold">
                      Discount %
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      name="discount"
                      value={editForm.discount}
                      onChange={handleEditChange}
                      min="0"
                      max="100"
                    />

                  </div>

                  {/* COLORS */}

                  <div className="col-md-6 mb-3">

                    <label className="form-label fw-bold">
                      Colors
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="colors"
                      value={editForm.colors}
                      onChange={handleEditChange}
                      placeholder="Black, White, Blue"
                    />

                  </div>

                  {/* SIZES */}

                  <div className="col-md-6 mb-3">

                    <label className="form-label fw-bold">
                      Sizes
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="sizes"
                      value={editForm.sizes}
                      onChange={handleEditChange}
                      placeholder="S, M, L, XL"
                    />

                  </div>

                  {/* DESCRIPTION */}

                  <div className="col-12 mb-3">

                    <label className="form-label fw-bold">
                      Description
                    </label>

                    <textarea
                      rows="4"
                      className="form-control"
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                    />

                  </div>

                  {/* FEATURED */}

                  <div className="col-12 mb-3">

                    <div className="form-check">

                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="featuredProduct"
                        name="isFeatured"
                        checked={editForm.isFeatured}
                        onChange={handleEditChange}
                      />

                      <label
                        className="form-check-label fw-bold"
                        htmlFor="featuredProduct"
                      >
                        ⭐ Featured Product
                      </label>

                    </div>

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="d-flex gap-2">

                  <button
                    type="submit"
                    className="btn btn-success px-4"
                  >
                    💾 Save Changes
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary px-4"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>
          </div>
        )}

        {/* ==========================================
            SEARCH + FILTER
        ========================================== */}

        <div className="card shadow border-0 mb-4">

          <div className="card-body">

            <div className="row g-3">

              <div className="col-md-8">

                <label className="form-label fw-bold">
                  🔎 Search Products
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by product name, category or brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

              </div>

              <div className="col-md-4">

                <label className="form-label fw-bold">
                  📂 Filter Category
                </label>

                <select
                  className="form-control"
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value)
                  }
                >

                  <option value="All">
                    All Categories
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}

                </select>

              </div>

            </div>

          </div>
        </div>

        {/* ==========================================
            PRODUCT COUNT
        ========================================== */}

        <div className="mb-3">

          <strong>
            Showing {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
          </strong>

        </div>

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <div className="text-center py-5">

            <div
              className="spinner-border text-warning"
              role="status"
            />

            <p className="mt-3 text-muted">
              Loading products...
            </p>

          </div>
        )}

        {/* ==========================================
            NO PRODUCTS
        ========================================== */}

        {!loading && filteredProducts.length === 0 && (
          <div className="card shadow border-0">

            <div className="card-body text-center py-5">

              <h4>
                📦 No Products Found
              </h4>

              <p className="text-muted">
                Try changing your search or category filter.
              </p>

            </div>

          </div>
        )}

        {/* ==========================================
            PRODUCTS TABLE
        ========================================== */}

        {!loading && filteredProducts.length > 0 && (

          <div className="card shadow border-0">

            <div className="card-body p-0">

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead
                    style={{
                      backgroundColor: "#1a1a1a",
                      color: "white",
                    }}
                  >

                    <tr>

                      <th className="p-3">
                        Image
                      </th>

                      <th>
                        Product
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Price
                      </th>

                      <th>
                        Stock
                      </th>

                      <th>
                        Featured
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredProducts.map((product) => (

                      <tr key={product._id}>

                        {/* IMAGE */}

                        <td className="p-3">

                          <img
                            src={
  product.image?.startsWith("http")
    ? product.image
    : `https://trendywear-3uam.onrender.com${product.image || ""}`
}
                            alt={product.name}
                            style={{
                              width: "70px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/70x80?text=No+Image";
                            }}
                          />

                        </td>

                        {/* NAME */}

                        <td>

                          <strong>
                            {product.name}
                          </strong>

                          {product.brand && (
                            <small className="d-block text-muted">
                              {product.brand}
                            </small>
                          )}

                        </td>

                        {/* CATEGORY */}

                        <td>

                          <span className="badge bg-secondary">
                            {product.category}
                          </span>

                        </td>

                        {/* PRICE */}

                        <td>

                          <strong
                            style={{
                              color: "crimson",
                            }}
                          >
                            ₹{product.price}
                          </strong>

                          {product.discount > 0 && (
                            <small className="d-block text-success">
                              {product.discount}% OFF
                            </small>
                          )}

                        </td>

                        {/* STOCK */}

                        <td>

                          {product.stock > 0 ? (
                            <span className="badge bg-success">
                              {product.stock} Available
                            </span>
                          ) : (
                            <span className="badge bg-danger">
                              Out of Stock
                            </span>
                          )}

                        </td>

                        {/* FEATURED */}

                        <td>

                          {product.isFeatured ? (
                            <span className="badge bg-warning text-dark">
                              ⭐ Yes
                            </span>
                          ) : (
                            <span className="text-muted">
                              No
                            </span>
                          )}

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="d-flex gap-2">

                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                startEdit(product)
                              }
                            >
                              ✏️ Edit
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                deleteProduct(
                                  product._id,
                                  product.name
                                )
                              }
                            >
                              🗑️ Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default ManageProducts;
