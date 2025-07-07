import { Navigate, Outlet } from "react-router-dom"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./pages/MainLayout";
import NotFound from "./pages/NotFound";
import EditSchema from "./pages/pe/EditSchema";
import Home from "./pages/Home";
import Schema from "./pages/pe/Schema";
import Login from "./pages/Login";

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
      {
        path: "pe",
        element: <ProtectedRoute><Outlet /></ProtectedRoute>,
        children: [
          { path: "schema", element: <Schema /> },
          { path: "schema/:schemaId", element: <EditSchema /> },
        ],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "*", element: <NotFound /> },
]);

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}
