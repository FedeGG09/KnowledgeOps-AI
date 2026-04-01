import { createBrowserRouter } from "react-router-dom";
import Home from "./screens/Home/Home";
import Header from "./components/Header/Header";
import Upload from "./screens/Upload/Upload";
import Chat from "./screens/Chat/Chat";
import LogIn from "./screens/LogIn/LogIn";
import ForgotPassword from "./screens/ForgotPassword/ForgotPassword";

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VerifyUser from "./screens/SignUp/VerifyUser";
import ChangePassword from "./screens/ForgotPassword/ChangePassword";

// Componente de Ruta Privada
function PrivateRoute({ children }: any) {
  const user = useSelector((state: any) => state.user);

  return user && user.token ? children : <Navigate to="/login" />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Header />,
    children: [
      { path: "", element: <Home /> },
      {
        path: "upload",
        element: (
          <PrivateRoute>
            <Upload />
          </PrivateRoute>
        ),
      },
      {
        path: "chat",
        element: (
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "login",
    element: <LogIn />,
  },

  {
    path: "signup",
    element: <LogIn />, //for safety
  },
  {
    path: "signup/verify-user",
    element: <VerifyUser />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "forgot-password/change-password",
    element: <ChangePassword />,
  },
]);
