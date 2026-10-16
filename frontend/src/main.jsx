import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import "./index.css";
import "./components/library.css";
import { LoadingProvider } from "./context/LoadingContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* GLOBAL PROVIDER */}
    <LoadingProvider>
      <AppRouter />
    </LoadingProvider>
  </React.StrictMode>,
);
