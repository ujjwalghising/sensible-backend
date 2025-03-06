// Footer.jsx
 import "./Footer.css";
 import React from "react";
 import { Link } from "react-router-dom";
 import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
 
 const Footer = () => {
   const currentYear = new Date().getFullYear();
 
   return (
     <footer className="footer-container">
       <div className="footer-content">
         <div className="footer-links">
           <Link to="/">Home</Link>
           <Link to="/about">About</Link>
           <Link to="/contact">Contact</Link>
         </div>
        <div className="socials">
           <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="facebook">
             <FaFacebook />
           </a>
           <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="twitter">
             <FaTwitter />
           </a>
           <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="instagram">
             <FaInstagram />
           </a>
       </div>
       </div>
       <p className="footer-text">&copy; {currentYear} Sensible. All rights reserved.</p>
     </footer>
   );
 };
 
 export default Footer;