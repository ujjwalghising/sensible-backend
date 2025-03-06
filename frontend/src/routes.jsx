import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchResults from "./pages/SearchResults";



// ✅ Function to check authentication
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null; // Checks if a token exists
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/search" element={<SearchResults />} />
    <Route path="/products/category/:categoryName?" element={<Products />} />


    {/* ✅ Protect the profile route */}
    <Route
      path="/profile"
      element={isAuthenticated() ? <Profile /> : <Navigate to="/login" />}
    />

    {/* ✅ Default route to home if no match */}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default AppRoutes;
