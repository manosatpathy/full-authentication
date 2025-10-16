import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgetPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyOTP from "./pages/auth/VerifyOtp";
import PageNotFound from "./pages/PageNotFound";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AuthenticatedRoute from "./utils/protectedRoutes/AuthenticatedRoute";
import Verify from "./pages/auth/Verify";
import { AppContextProvider } from "./context/AppContext";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <AppContextProvider>
          <MainLayout />
        </AppContextProvider>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },

        {
          path: "/auth",
          element: <AuthLayout />,
          children: [
            {
              path: "register",
              element: <Register />,
            },
            {
              path: "verify/:token",
              element: <Verify />,
            },
            {
              path: "login",
              element: <Login />,
            },
            {
              path: "forget-password",
              element: <ForgetPassword />,
            },
            {
              path: "reset-password/:token",
              element: <ResetPassword />,
            },
            {
              path: "verify-otp",
              element: <VerifyOTP />,
            },
          ],
        },

        {
          element: <AuthenticatedRoute />,
          children: [
            {
              path: "admin",
              element: <AdminDashboard />,
            },
            {
              path: "user-profile",
              element: <Profile />,
            },
            {
              path: "admin-profile",
              element: <Profile />,
            },
          ],
        },

        {
          path: "*",
          element: <PageNotFound />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
