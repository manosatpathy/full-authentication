import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="py-24 flex justify-center items-center">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
