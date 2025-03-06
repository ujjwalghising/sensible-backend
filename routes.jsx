import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./src/pages/Home";
import Products from "./src/pages/Products";
import Cart from "./src/pages/Cart";
import Profile from "./src/pages/Profile";
import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import SearchResults from "./src/pages/SearchResults";



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
