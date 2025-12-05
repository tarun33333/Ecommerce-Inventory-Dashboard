import { useState, useEffect } from "react";
import api from "../Components/services/api";
import Navbar from "../Components/Navbar";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "staff" });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users", err);
        }
    };

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

    // User Logic
    const handleUserChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const addUser = async (e) => {
        e.preventDefault();
        try {
            await api.post("/users", newUser);
            setNewUser({ name: "", email: "", password: "", role: "staff" });
            fetchUsers();
            alert("User added successfully");
        } catch (err) {
            console.error("Error adding user", err);
            alert("Failed to add user");
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (err) {
                console.error("Error deleting user", err);
            }
        }
    };

    // Product Logic
    const deleteProduct = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (err) {
                console.error("Error deleting product", err);
            }
        }
    };

    // Order Logic
    const updateOrderStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) {
            console.error("Error updating status", err);
            alert("Failed to update status");
        }
    };

    const deleteOrder = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await api.delete(`/orders/${id}`);
                fetchOrders();
            } catch (err) {
                console.error("Error deleting order", err);
            }
        }
    };

    const stockAlerts = products.filter((p) => p.stock < p.minStock);

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <div className="tabs">
                    <button className={`tab-button ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>Manage Users</button>
                    <button className={`tab-button ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>Manage Products</button>
                    <button className={`tab-button ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>Manage Orders</button>
                    <button className={`tab-button ${activeTab === "alerts" ? "active" : ""}`} onClick={() => setActiveTab("alerts")}>Stock Alerts {stockAlerts.length > 0 && <span className="badge">{stockAlerts.length}</span>}</button>
                </div>

                <div className="tab-content">
                    {activeTab === "users" && (
                        <div>
                            <h3 className="section-title">Add New User</h3>
                            <form onSubmit={addUser} className="product-form">
                                <input type="text" name="name" placeholder="Name" value={newUser.name} onChange={handleUserChange} required className="input-field" />
                                <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleUserChange} required className="input-field" />
                                <input type="password" name="password" placeholder="Password" value={newUser.password} onChange={handleUserChange} required className="input-field" />
                                <select name="role" value={newUser.role} onChange={handleUserChange} className="input-field">
                                    <option value="staff">Staff</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button type="submit" className="btn-primary">Add User</button>
                            </form>

                            <h3 className="section-title mt-4">User List</h3>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <button className="btn-delete" onClick={() => deleteUser(user._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "products" && (
                        <div>
                            <h3 className="section-title">Products</h3>
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
                                                <button className="btn-delete" onClick={() => deleteProduct(product._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div>
                            <h3 className="section-title">All Orders</h3>
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
                                                {editingId === order._id ? (
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        className="input-field"
                                                        style={{ padding: '0.25rem' }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Rejected">Rejected</option>
                                                        <option value="Packed">Packed</option>
                                                        <option value="Shipped">Shipped</option>
                                                    </select>
                                                ) : (
                                                    <span className={`badge ${order.status === 'Approved' ? 'bg-green' :
                                                        order.status === 'Rejected' ? 'bg-red' :
                                                            order.status === 'Shipped' ? 'bg-blue' : ''
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {editingId === order._id ? (
                                                    <button className="btn-primary" onClick={() => setEditingId(null)}>Done</button>
                                                ) : (
                                                    <button className="btn-edit" style={{ marginRight: '0.5rem' }} onClick={() => setEditingId(order._id)}>Edit</button>
                                                )}
                                                <button className="btn-delete" onClick={() => deleteOrder(order._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "alerts" && (
                        <div>
                            <h3 className="section-title">Low Stock Alerts</h3>
                            {stockAlerts.length === 0 ? <p>No alerts.</p> : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Stock</th>
                                            <th>Min Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockAlerts.map((product) => (
                                            <tr key={product._id}>
                                                <td>{product.name}</td>
                                                <td className="text-red">{product.stock}</td>
                                                <td>{product.minStock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
