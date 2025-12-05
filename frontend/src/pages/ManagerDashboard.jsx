import { useState, useEffect } from "react";
import api from "../Components/services/api";
import Navbar from "../Components/Navbar";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function ManagerDashboard() {
    const [activeTab, setActiveTab] = useState("products");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [analytics, setAnalytics] = useState({ statusDistribution: [], staffActivity: [] });
    const [formData, setFormData] = useState({ name: "", price: "", stock: "", minStock: "", description: "" });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchAnalytics();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products", err);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get("/orders");
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders", err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get("/analytics/manager");
            setAnalytics(res.data);
        } catch (err) {
            console.error("Error fetching analytics", err);
        }
    };

    // Product Logic
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
        setActiveTab("products");
    };

    // Order Logic
    const updateOrderStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) {
            console.error("Error updating status", err);
            alert(err.response?.data?.msg || "Failed to update status");
        }
    };

    const lowStock = products.filter((p) => p.stock < p.minStock);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <div className="tabs">
                    <button className={`tab-button ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>Add/Edit Products</button>
                    <button className={`tab-button ${activeTab === "lowstock" ? "active" : ""}`} onClick={() => setActiveTab("lowstock")}>Low Stock {lowStock.length > 0 && <span className="badge">{lowStock.length}</span>}</button>
                    <button className={`tab-button ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>Manage Orders</button>
                    <button className={`tab-button ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>Analytics</button>
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
                                            <td>₹{product.price}</td>
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

                    {activeTab === "orders" && (
                        <div>
                            <h3 className="section-title">Manage Orders</h3>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>{order._id.substring(0, 8)}...</td>
                                            <td>{order.customerName}</td>
                                            <td>₹{order.totalAmount}</td>
                                            <td>
                                                <span className={`badge ${order.status === 'Approved' ? 'bg-green' : order.status === 'Rejected' ? 'bg-red' : ''}`}>{order.status}</span>
                                            </td>
                                            <td>
                                                {order.status === "Pending" && (
                                                    <>
                                                        <button className="btn-primary" style={{ marginRight: '0.5rem', backgroundColor: '#10b981' }} onClick={() => updateOrderStatus(order._id, "Approved")}>Approve</button>
                                                        <button className="btn-delete" onClick={() => updateOrderStatus(order._id, "Rejected")}>Reject</button>
                                                    </>
                                                )}
                                                {order.status === "Packed" && (
                                                    <button className="btn-primary" onClick={() => updateOrderStatus(order._id, "Shipped")}>Mark Shipped</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div>
                            <h3 className="section-title">Analytics Dashboard</h3>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                                <div style={{ flex: '1 1 400px' }}>
                                    <h4>Order Status Distribution</h4>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={analytics.statusDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                    nameKey="_id"
                                                >
                                                    {analytics.statusDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div style={{ flex: '1 1 400px' }}>
                                    <h4>Staff Activity (Orders Created/Day)</h4>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={analytics.staffActivity}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="_id" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" fill="#ffc658" name="Orders Created" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
