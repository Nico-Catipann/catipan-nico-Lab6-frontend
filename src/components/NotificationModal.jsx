function NotificationModal({ type = "success", title, message, onClose }) {
  return (
    <div className="notification-overlay">
      <div className="notification-modal">
        <div className={`notification-icon ${type}`}>
          {type === "success" ? "✓" : "!"}
        </div>

        <h2>{title}</h2>

        <p>{message}</p>

        <button
          className={
            type === "success"
              ? "notification-success-btn"
              : "notification-error-btn"
          }
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default NotificationModal;
