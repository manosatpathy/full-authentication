import { useAppContext } from "@/context/AppContext";
import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedRoute = () => {
  const { isAuthenticated } = useAppContext();

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default AuthenticatedRoute;
