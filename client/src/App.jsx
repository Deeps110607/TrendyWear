import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Wishlist from "./pages/Wishlist";
import Navbar from "./components/Navbar";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Complaints from "./pages/Complaints";
import AdminSupport from "./pages/AdminSupport";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import ManageProducts from "./pages/ManageProducts";
import Orders from "./pages/Orders";
import Returns from "./pages/Returns";
import Users from "./pages/Users";
import Home from "./pages/Home";
import MyOrders from "./pages/MyOrders";
import Cart from "./pages/Cart";
function App() {
  return (
    <Router>

      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/my-orders"  element={<MyOrders />}/>
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/returns" element={<Returns />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/categories" element={<Categories />} />

      </Routes>

    </Router>
  );
}

export default App;