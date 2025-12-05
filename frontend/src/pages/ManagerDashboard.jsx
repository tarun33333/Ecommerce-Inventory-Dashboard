import { useState, useEffect } from "react";
import api from "../Components/services/api";

export default function ManagerDashboard() {
    const [activeTab, setActiveTab] = useState("products");
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ name: "", price: "", stock: "", minStock: "", description: "" });
    const [editingId, setEditingId] = useState(null);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData);
            } else {
                await api.post("/products", formData);
            }
            setFormData({ name: "", price: "", stock: "", minStock: "", description: "" });
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            console.error("Error saving product", err);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            price: product.price,
            stock: product.stock,
            minStock: product.minStock,
            description: product.description || ""
        });
        setEditingId(product._id);
        setActiveTab("products"); // Ensure we are on the form tab
    };

    const lowStock = products.filter((p) => p.stock < p.minStock);

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Manager Dashboard</h2>

            <div className="tabs">
                <button className={`tab-button ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>Add/Edit Products</button>
                <button className={`tab-button ${activeTab === "lowstock" ? "active" : ""}`} onClick={() => setActiveTab("lowstock")}>Low Stock {lowStock.length > 0 && <span className="badge">{lowStock.length}</span>}</button>
            </div>

            <div className="tab-content">
                {activeTab === "products" && (
                    <div>
                        <h3 className="section-title">{editingId ? "Edit Product" : "Add New Product"}</h3>
                        <form onSubmit={handleSubmit} className="product-form">
                            <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required className="input-field" />
                            <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required className="input-field" />
                            <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} required className="input-field" />
                            <input type="number" name="minStock" placeholder="Min Stock (Alert)" value={formData.minStock} onChange={handleChange} className="input-field" />
                            <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="input-field" />
                            <button type="submit" className="btn-primary">{editingId ? "Update Product" : "Add Product"}</button>
                            {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setFormData({ name: "", price: "", stock: "", minStock: "", description: "" }); }}>Cancel Edit</button>}
                        </form>

                        <h3 className="section-title mt-4">Product List</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id}>
                                        <td>{product.name}</td>
                                        <td>${product.price}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "lowstock" && (
                    <div>
                        <h3 className="section-title">Low Stock Items</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Stock</th>
                                    <th>Min Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map((product) => (
                                    <tr key={product._id}>
                                        <td>{product.name}</td>
                                        <td className="text-red">{product.stock}</td>
                                        <td>{product.minStock}</td>
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
