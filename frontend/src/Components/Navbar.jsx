import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">Inventory Management</div>
            <div className="navbar-user">
                <span className="user-name">Welcome, {user?.name || "User"}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
        </nav>
    );
}
