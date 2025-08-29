import { Outlet } from "react-router-dom";
import Header from "./../components/Header";
const MainLayout = () => {
  return (
    <div className="container mx-auto px-7">
      <Header />
      <div className="pt-16 min-h-[calc(100vh-67px)]">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
