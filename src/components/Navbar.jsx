import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faShoppingBag,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <div className="category-dropdown">
          <FontAwesomeIcon icon={faList} className="category-icon" />
          <div className="dropdown-menu">
            <Link to="/products/category/clothing">Clothing</Link>
            <Link to="/products/category/shoes">Shoes</Link>
            <Link to="/products/category/accessories">Accessories</Link>
            <Link to="/products/category/bags">Bagpacks</Link>
          </div>
        </div>
      </div>

      <Link to="/" className="logo">
        <span>Sensible</span>
      </Link>

      <div className="nav-links">
        <div className="search-wrapper">
          <button 
            className="search-button-icon"
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
          <div className="search-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>

        <Link to="/profile" className="icon-button1">
          <FontAwesomeIcon icon={faUser} />
        </Link>
        <Link to="/cart" className="icon-button2">
          <FontAwesomeIcon icon={faShoppingBag} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

// Let me know if you’d like me to tweak anything else! 🚀
