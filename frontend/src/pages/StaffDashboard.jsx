import { useState, useEffect } from "react";
import api from "../Components/services/api";

export default function StaffDashboard() {
    const [activeTab, setActiveTab] = useState("view");
    const [products, setProducts] = useState([]);
    const [stockUpdates, setStockUpdates] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products", err);
        }
    };

    const handleStockChange = (id, value) => {
        setStockUpdates({ ...stockUpdates, [id]: value });
    };

    const updateStock = async (id) => {
        const newStock = stockUpdates[id];
        if (!newStock) return;

        try {
            await api.put(`/products/${id}/stock`, { stock: newStock });
            alert("Stock updated!");
            fetchProducts();
            setStockUpdates({ ...stockUpdates, [id]: "" });
        } catch (err) {
            console.error("Error updating stock", err);
            alert("Failed to update stock");
        }
    };

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Staff Dashboard</h2>

            <div className="tabs">
                <button className={`tab-button ${activeTab === "view" ? "active" : ""}`} onClick={() => setActiveTab("view")}>View Products</button>
                <button className={`tab-button ${activeTab === "update" ? "active" : ""}`} onClick={() => setActiveTab("update")}>Update Stock</button>
            </div>

            <div className="tab-content">
                {activeTab === "view" && (
                    <div>
                        <h3 className="section-title">Product List</h3>
                        <div className="product-grid">
                            {products.map((product) => (
                                <div key={product._id} className="product-card">
                                    <h4>{product.name}</h4>
                                    <p>{product.description}</p>
                                    <p>Price: ${product.price}</p>
                                    <p>Stock: {product.stock}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "update" && (
                    <div>
                        <h3 className="section-title">Update Stock Quantity</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Current Stock</th>
                                    <th>New Stock</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id}>
                                        <td>{product.name}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="input-small"
                                                value={stockUpdates[product._id] || ""}
                                                onChange={(e) => handleStockChange(product._id, e.target.value)}
                                                placeholder="New Qty"
                                            />
                                        </td>
                                        <td>
                                            <button className="btn-primary" onClick={() => updateStock(product._id)}>Update</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
