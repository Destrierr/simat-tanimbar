import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import "./index.css";
import "./components/library.css";
import { LoadingProvider } from "./context/LoadingContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* GLOBAL PROVIDER */}
      <LoadingProvider>
        <AppRouter />
      </LoadingProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);