import { Navigate, Outlet, useLocation } from "react-router-dom"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import NotFound from "./pages/NotFound";
import EditPattern from "./pages/pe/EditPattern";
import Pattern from "./pages/pe/Pattern";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EditProduct from "./pages/pe/EditProduct";
import Product from "./pages/pe/Product";
import Build from "./pages/Build";
import ProductProperty from "./components/ProductProperty";
import { ProtectedRoute } from "./components/ProtectedRoute";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "build/:patternId", element: <Build /> },
      { path: "login", element: <Login /> },
      { path: "logout", element: <Logout /> },
      {
        path: "pe",
        element: <ProtectedRoute />,
        children: [
          { path: "pattern", element: <Pattern /> },
          { path: "pattern/:patternId", element: <EditPattern /> },
          { path: "product", element: <Product /> },
          { path: "product/:productId", element: <EditProduct /> },
          // Product props
          { path: "product/manufacturer", element: <ProductProperty title="Manufacturer" description="The manufacturer of a product." example="Cisco" path="manufacturer"  /> },
          { path: "product/device-role", element: <ProductProperty title="Device Role" description="Optional roles that can be assigned to products that indicate their purpose in the network, if any." example="Router" path="device-role" /> },
          { path: "product/classification", element: <ProductProperty title="Classification" description="The high-level categorization of the product." example="Hardware" path="classification" /> },
        ],
      },
      { path: "*", element: <NotFound /> }, // Single NotFound catch-all
    ],
  },
]);

export default function App() {
  return (
    <RouterProvider router={router}>
      <Outlet />
    </RouterProvider>
  )
}
