import { Navigate, Outlet, useSearchParams } from "react-router-dom";

const UserIdProtectedRoute = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  return userId ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default UserIdProtectedRoute;
