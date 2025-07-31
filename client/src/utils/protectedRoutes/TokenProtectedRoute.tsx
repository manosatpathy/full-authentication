import { Navigate, Outlet, useSearchParams } from "react-router-dom";

const TokenProtectedRoute = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  return token ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default TokenProtectedRoute;
