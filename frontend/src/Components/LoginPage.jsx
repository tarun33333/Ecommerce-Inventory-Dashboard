import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";
import { useAuth } from "./context/AuthContext";

export default function LoginPage() {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [error, setError] = useState("");
        const navigate = useNavigate();
        const { login } = useAuth();

        const submit = async (e) => {
                e.preventDefault();

                try {
                        const res = await api.post("/auth/login", { email, password });
                        login({ token: res.data.token, role: res.data.role, name: res.data.name });

                        if (res.data.role === "admin") navigate("/admin");
                        else if (res.data.role === "manager") navigate("/manager");
                        else navigate("/staff");
                } catch (err) {
                        setError(err.response?.data?.msg || "Login failed");
                }
        };

        return (
                <div className="login-container">
                        <form onSubmit={submit} className="login-form">
                                <h2 className="login-title">Login</h2>

                                {error && <div className="error-message">{error}</div>}

                                <input
                                        type="email"
                                        placeholder="Email"
                                        className="input-field"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                />

                                <input
                                        type="password"
                                        placeholder="Password"
                                        className="input-field"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                />

                                <button className="login-button">Login</button>
                        </form>
                </div>
        );
}