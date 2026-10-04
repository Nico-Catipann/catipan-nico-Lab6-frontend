import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Products from "./pages/Products";
import NotificationModal from "./components/NotificationModal";

import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token")),
  );

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const currentPath = window.location.pathname;

    const token = localStorage.getItem("access_token");

    // Someone manually tried to access
    // /api/products without logging in
    if (currentPath === "/api/products" && !token) {
      setNotification({
        type: "error",
        title: "Access Denied",
        message: "You must log in before accessing the products page.",
      });
    }
  }, []);

  const closeNotification = () => {
    setNotification(null);

    // Return to normal frontend URL
    window.history.replaceState({}, "", "/");
  };

  if (!loggedIn) {
    return (
      <>
        <Login onLogin={() => setLoggedIn(true)} />

        {notification && (
          <NotificationModal
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={closeNotification}
          />
        )}
      </>
    );
  }

  return <Products onLogout={() => setLoggedIn(false)} />;
}

export default App;
