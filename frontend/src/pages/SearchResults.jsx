import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../utils/axios";
const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const location = useLocation();

  const query = new URLSearchParams(location.search).get("query");

  useEffect(() => {
    if (query) {
      axios
        .get(`http://localhost:5000/api/products/search?query=${query}`)
        .then((response) => {
          setProducts(response.data);
          setError(null);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Error fetching products");
          setProducts([]);
        });
    }
  }, [query]);

  return (
    <div>
      <h2>Search Results for "{query}"</h2>
      {error ? (
        <p>{error}</p>
      ) : products.length > 0 ? (
        <div className="product-list">
          {products.map((product) => (
            <div key={product._id} className="product-item">
              <h3>{product.name}</h3>
              <img src={product.image} alt={product.name} />
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No products found</p>
      )}
    </div>
  );
};

export default SearchResults;
