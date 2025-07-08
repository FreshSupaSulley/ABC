import { Navigate, Outlet, useLocation } from "react-router-dom"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import MainLayout from "./pages/MainLayout";
import NotFound from "./pages/NotFound";
import EditSchema from "./pages/pe/EditSchema";
import Home from "./pages/Home";
import Schema from "./pages/pe/Schema";
import Login from "./pages/Login";
import EditProduct from "./pages/pe/EditProduct";
import Product from "./pages/pe/Product";
import Build from "./pages/Build";
import { useEffect, useRef, useState } from "react";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

const router = createBrowserRouter([
  // Public
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "build/:schemaId", element: <Build /> },
      { path: "/login", element: <Login /> },
      { path: "/logout", element: <Logout /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  // Admin
  {
    path: "pe",
    element: <AdminRoute />,
    children: [
      // Product
      { path: "product", element: <Product /> },
      { path: "product/:productId", element: <EditProduct /> },
      // Schema
      { path: "schema", element: <Schema /> },
      { path: "schema/:schemaId", element: <EditSchema /> },
    ],
  },
]);

export default function App() {
  return (
    <RouterProvider router={router}>
      <Transitioner />
    </RouterProvider>
  )
}

const Transitioner: React.FC = () => {
  const location = useLocation();
  const prevLocation = useRef(location.pathname);
  const [direction, setDirection] = useState('right');

  useEffect(() => {
    if (location.pathname !== prevLocation.current) {
      // Simple example logic:
      // If new path is alphabetically greater, swipe left, else swipe right
      setDirection(location.pathname > prevLocation.current ? 'left' : 'right');
      prevLocation.current = location.pathname;
    }
  }, [location.pathname]);

  return <Outlet />
}
