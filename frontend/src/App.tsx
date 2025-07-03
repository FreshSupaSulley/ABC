import { Navigate, Outlet } from "react-router-dom"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./pages/MainLayout";
import NotFound from "./pages/NotFound";
import EditSchema from "./pages/pe/EditSchema";
import Register from "./pages/Register";
import PEHome from "./pages/pe/Home";
import Home from "./pages/Home";
import Login from "./pages/Login";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "admin",
        element: <ProtectedRoute><Outlet /></ProtectedRoute>,
        children: [
          { index: true, element: <PEHome /> },
          { path: "schema/:schemaId", element: <EditSchema /> },
        ],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "/register", element: <RegisterAndLogout /> },
  { path: "*", element: <NotFound /> },
]);

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}
