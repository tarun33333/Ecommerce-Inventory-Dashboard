import { useState, useEffect } from "react";
import api from "../Components/services/api";
import Navbar from "../Components/Navbar";

export default function StaffDashboard() {
    const [activeTab, setActiveTab] = useState("view");
    const [products, setProducts] = useState([]);
    const [stockUpdates, setStockUpdates] = useState({});

    // Order State
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
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

    // Stock Update Logic
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

    // Order Logic
    const addToCart = () => {
        if (!selectedProduct || quantity <= 0) return;
        const product = products.find(p => p._id === selectedProduct);

        const newItem = {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: parseInt(quantity)
        };

        setCart([...cart, newItem]);
        setSelectedProduct("");
        setQuantity(1);
    };

    const submitOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0 || !customerName) return;

        const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        try {
            await api.post("/orders", { customerName, items: cart, totalAmount });
            alert("Order Created!");
            setCart([]);
            setCustomerName("");
            fetchOrders();
        } catch (err) {
            console.error("Error creating order", err);
            alert("Failed to create order");
        }
    };

    const markPacked = async (id) => {
        try {
            await api.put(`/orders/${id}/status`, { status: "Packed" });
            fetchOrders();
        } catch (err) {
            console.error("Error updating status", err);
            alert(err.response?.data?.msg || "Failed to update status");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <h2 className="dashboard-title">Staff Dashboard</h2>

                <div className="tabs">
                    <button className={`tab-button ${activeTab === "view" ? "active" : ""}`} onClick={() => setActiveTab("view")}>View Products</button>
                    <button className={`tab-button ${activeTab === "update" ? "active" : ""}`} onClick={() => setActiveTab("update")}>Update Stock</button>
                    <button className={`tab-button ${activeTab === "createOrder" ? "active" : ""}`} onClick={() => setActiveTab("createOrder")}>Create Order</button>
                    <button className={`tab-button ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>Orders</button>
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
                                        <p>Price: ₹{product.price}</p>
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

                    {activeTab === "createOrder" && (
                        <div>
                            <h3 className="section-title">Create New Order</h3>
                            <div className="product-form">
                                <input
                                    type="text"
                                    placeholder="Customer Name"
                                    className="input-field"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <select
                                        className="input-field"
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        className="input-field"
                                        style={{ width: '100px' }}
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min="1"
                                    />
                                    <button className="btn-secondary" onClick={addToCart}>Add Item</button>
                                </div>
                            </div>

                            {cart.length > 0 && (
                                <div>
                                    <h4>Cart</h4>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{item.price}</td>
                                                    <td>₹{item.price * item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                        <strong>Total: ₹{cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</strong>
                                        <br />
                                        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={submitOrder}>Submit Order</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div>
                            <h3 className="section-title">Orders</h3>
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
                                                <span className={`badge ${order.status === 'Approved' ? 'bg-green' : ''}`}>{order.status}</span>
                                            </td>
                                            <td>
                                                {order.status === "Approved" && (
                                                    <button className="btn-primary" onClick={() => markPacked(order._id)}>Mark Packed</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
