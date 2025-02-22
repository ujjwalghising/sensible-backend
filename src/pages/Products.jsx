import { useNavigate } from "react-router-dom";
import "./Products.css";

const Products = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: 1, image:"/images/img1.jpeg",
      name: "discover",
    },
    {
      id: 2, image:"/images/img2.jpeg",
      name: "discover",
    },
    {
      id: 3, image:"/images/img3.jpeg",
      name: "discover",
    },
    {
      id: 4, image:"/images/img4.jpeg",
      name: "discover",
    },
    {
      id: 5, image:"/images/img5.jpeg",
      name: "discover",
    },
    {
      id: 6, image:"/images/img6.jpeg",
      name: "discover",
    },
    {
      id: 7, image:"/images/img7.jpeg",
      name: "discover",
    },
    {
      id: 8, image:"/images/img8.jpeg",
      name: "discover",
    },
    {
      id: 9, image:"https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "discover",
    },
    {
      id: 10,
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
      text: "Find your perfect outfit today!",
      name: "Glass",
    },
    
  ];

  return (
    <div className="product-container">
      <div className="product-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <img src={product.image} alt={product.name} className="product-image" />
            <h3>{product.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;