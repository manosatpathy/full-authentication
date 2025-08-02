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
import AdminDashboard from "./pages/Dashboard";
import AuthenticatedRoute from "./utils/protectedRoutes/AuthenticatedRoute";
import TokenProtectedRoute from "./utils/protectedRoutes/TokenProtectedRoute";
import UserIdProtectedRoute from "./utils/protectedRoutes/UserIdProtectedRoute";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <MainLayout />
        </>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
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
          path: "/auth",
          element: <AuthLayout />,
          children: [
            {
              path: "login",
              element: <Login />,
            },
            {
              path: "register",
              element: <Register />,
            },
            {
              path: "forget-password",
              element: <ForgetPassword />,
            },
            {
              element: <TokenProtectedRoute />,
              children: [
                {
                  path: "reset-password",
                  element: <ResetPassword />,
                },
              ],
            },
            {
              element: <UserIdProtectedRoute />,
              children: [
                {
                  path: "verify-otp",
                  element: <VerifyOTP />,
                },
              ],
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
