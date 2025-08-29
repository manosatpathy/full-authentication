import { useAppContext } from "@/context/AppContext";
import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedRoute = () => {
  const { isAuthenticated, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[420px]">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-400 border-opacity-80"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  return <Outlet />;
};

export default AuthenticatedRoute;
