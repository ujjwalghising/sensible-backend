import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faShoppingCart,
  faShirt,
  faHomeAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation(); // Access the current location (path)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Conditionally hide search bar on the Profile page
  const hideSearchBar =
    location.pathname === "/profile" ||
    location.pathname === "/login" ||
    location.pathname === "/cart" ||
    location.pathname === "/register";

  return (
    <nav className="navbar">
      {/* Conditionally render the search bar */}
      {!hideSearchBar && (
        <div className={`search-container ${isVisible ? "visible" : "hidden"}`}>
          <input
            type="text"
            className="search-bar"
            placeholder="Search products..."
          />
          <button className="search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="nav-links">
        <Link to="/" className="but1">
          <FontAwesomeIcon icon={faHomeAlt} />
        </Link>
        <Link to="/products" className="but2">
          <FontAwesomeIcon icon={faShirt} />
        </Link>
      </div>

      {/* Logo */}
      <Link to="/" className="logo">
        <span>Sensible</span>
      </Link>

      {/* Profile & Cart */}
      <div className="nav-links">
        <Link to="/profile" className="icon-button1">
          <FontAwesomeIcon icon={faUser} />
        </Link>
        <Link to="/cart" className="icon-button2">
          <FontAwesomeIcon icon={faShoppingCart} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
