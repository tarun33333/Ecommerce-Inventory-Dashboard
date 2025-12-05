import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function RoleRoute({ children, allowed }) {
const { user } = useAuth();


if (!user) return <Navigate to="/login" />;
if (!allowed.includes(user.role)) return <h1>Access Denied</h1>;


return children;
}