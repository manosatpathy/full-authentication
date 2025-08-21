import { useAppContext } from "@/context/AppContext";
import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedRoute = () => {
  const { isAuthenticated, isLoading } = useAppContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  return <Outlet />;
};

export default AuthenticatedRoute;
