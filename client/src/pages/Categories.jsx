import React, { useEffect, useState } from "react";
import axios from "axios";

function Categories() {

  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    const res = await axios.get("https://trendywear-3uam.onrender.com/api/categories");
    setCategories(res.data.categories);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async (e) => {

    e.preventDefault();

    if (!name) {
      alert("Enter Category Name");
      return;
    }

    await axios.post("https://trendywear-3uam.onrender.com/api/categories", {
      name,
    });

    setName("");

    loadCategories();

  };

  const deleteCategory = async (id) => {

    if (!window.confirm("Delete this category?")) return;

    await axios.delete(
      `https://trendywear-3uam.onrender.com/api/categories/${id}`
    );

    loadCategories();

  };

  return (

    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        padding: "30px"
      }}
    >

      <h2>Category Management</h2>

      <form
        onSubmit={addCategory}
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          marginBottom: "30px"
        }}
      >

        <input
          className="form-control"
          placeholder="Enter Category Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <button className="btn btn-success">
          Add
        </button>

      </form>

      <table className="table table-bordered">

        <thead>

          <tr>

            <th>#</th>

            <th>Category</th>

            <th>Delete</th>

          </tr>

        </thead>

        <tbody>

          {
            categories.map((item,index)=>(

              <tr key={item._id}>

                <td>{index+1}</td>

                <td>{item.name}</td>

                <td>

                  <button
                  className="btn btn-danger"
                  onClick={()=>deleteCategory(item._id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))
          }

        </tbody>

      </table>

    </div>

  );

}

export default Categories;
