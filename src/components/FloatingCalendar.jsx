import { BsCalendar3 } from "react-icons/bs";

function FloatingCalendar() {
  return (
    <a
      href="https://calendar.app.google/zJDy2SHqMMjKko427"
      target="_blank"
      rel="noreferrer"
      className="floating-calendar"
      aria-label="Book a meeting with us"
    >
      <BsCalendar3 className="floating-icon" />
      <span className="floating-text">Book Meeting</span>
    </a>
  );
}

export default FloatingCalendar;
