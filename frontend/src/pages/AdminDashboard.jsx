import { useState, useEffect } from "react";
import api from "../Components/services/api";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "staff" });

    useEffect(() => {
        fetchUsers();
        fetchProducts();
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

    const stockAlerts = products.filter((p) => p.stock < p.minStock);

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Admin Dashboard</h2>

            <div className="tabs">
                <button className={`tab-button ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>Manage Users</button>
                <button className={`tab-button ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>Manage Products</button>
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
                                        <td>${product.price}</td>
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
    );
}
