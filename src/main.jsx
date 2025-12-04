import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import SupabaseErrorBoundary from "./components/SupabaseErrorBoundary.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { router } from "./routes/router.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SupabaseErrorBoundary>
        <RouterProvider router={router} />
      </SupabaseErrorBoundary>
    </AuthProvider>
  </React.StrictMode>
);
