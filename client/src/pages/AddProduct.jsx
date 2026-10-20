import React, { useEffect, useState } from "react";
import axios from "axios";

function AddProduct() {

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState("");
  
  const [categories, setCategories] = useState([]);

  useEffect(() => {
  loadCategories();
}, []);

const loadCategories = async () => {
  try {
    const res = await axios.get(
      "https://trendywear-3uam.onrender.com/api/categories"
    );

    setCategories(res.data.categories);
  } catch (err) {
    console.log(err);
  }
};

  const [form, setForm] = useState({

    name: "",

    category: "",

    brand: "TrendyWear",

    description: "",

    price: "",

    stock: "",

    colors: "",

    sizes: "",

    discount: 0,

    featured: false

  });

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setForm({

      ...form,

      [name]: type === "checkbox" ? checked : value

    });

  };

  const handleImage = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));

  };
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!image) {
      alert("Please select a product image.");
      return;
    }

    try {

      const data = new FormData();

      data.append("image", image);

      data.append("name", form.name);

      data.append("category", form.category);

      data.append("brand", form.brand);

      data.append("description", form.description);

      data.append("price", form.price);

      data.append("stock", form.stock);

      data.append("discount", form.discount);

      data.append(
        "colors",
        JSON.stringify(
          form.colors
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== "")
        )
      );

      data.append(
        "sizes",
        JSON.stringify(
          form.sizes
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== "")
        )
      );

      data.append("isFeatured", form.featured);

      const res = await axios.post(
  "https://trendywear-3uam.onrender.com/api/products",
  data,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);

alert(res.data.message);

      alert("✅ Product Added Successfully");

      setForm({
        name: "",
        category: "",
        brand: "TrendyWear",
        description: "",
        price: "",
        stock: "",
        colors: "",
        sizes: "",
        discount: 0,
        featured: false
      });

      setImage(null);

      setPreview("");

    } catch (err) {

      console.log(err);

      alert("❌ Failed to add product.");

    }

  };
  return (
    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        padding: "30px",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 5px 15px rgba(0,0,0,.1)",
        }}
      >
        <h2 style={{ marginBottom: "25px" }}>
          ➕ Add New Product
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <label className="form-label">
              Product Image
            </label>

            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImage}
            />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "180px",
                  marginTop: "20px",
                  borderRadius: "10px",
                }}
              />
            )}

          </div>

          <div className="mb-3">

            <label className="form-label">
              Product Name
            </label>

            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-3">

            <label className="form-label">
              Category
            </label>

            <select
              className="form-control"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >

            <option value="">Select Category</option>

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

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Brand
              </label>

              <input
                className="form-control"
                name="brand"
                value={form.brand}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Price
              </label>

              <input
                type="number"
                className="form-control"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Stock
              </label>

              <input
                type="number"
                className="form-control"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Discount %
              </label>

              <input
                type="number"
                className="form-control"
                name="discount"
                value={form.discount}
                onChange={handleChange}
              />

            </div>
                        <div className="col-md-6 mb-3">

              <label className="form-label">
                Colors
              </label>

              <input
                type="text"
                className="form-control"
                name="colors"
                value={form.colors}
                onChange={handleChange}
                placeholder="Black, White, Blue"
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Sizes
              </label>

              <input
                type="text"
                className="form-control"
                name="sizes"
                value={form.sizes}
                onChange={handleChange}
                placeholder="S,M,L,XL"
              />

            </div>

          </div>

          <div className="mb-3">

            <label className="form-label">
              Description
            </label>

            <textarea
              rows="5"
              className="form-control"
              name="description"
              value={form.description}
              onChange={handleChange}
            />

          </div>

          <div className="form-check mb-4">

            <input
              className="form-check-input"
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
            />

            <label className="form-check-label">
              Featured Product
            </label>

          </div>

          <button
            type="submit"
            className="btn btn-warning w-100"
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              padding: "12px"
            }}
          >
            ➕ Add Product
          </button>

        </form>

      </div>

    </div>

  );

}

export default AddProduct;
