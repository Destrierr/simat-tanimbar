import { useState } from "react";

export function useAlert() {
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ show: false, type: "", message: "" });
    setTimeout(() => setAlert({ show: true, type, message }), 50);
  };

  const hideAlert = () => setAlert({ show: false, type: "", message: "" });

  return { alert, showAlert, hideAlert };
}
