import React from "react";
import { BsCalendar3 } from "react-icons/bs";
import "../style.css";

function FloatingCalendar() {
  return (
    <a
      href="https://calendar.app.google/zJDy2SHqMMjKko427"
      target="_blank"
      rel="noreferrer"
      className="floating-calendar"
      aria-label="Book a meeting with us"
    >
      <BsCalendar3 className="calendar-icon" />
      <span className="calendar-text">Book Meeting</span>
    </a>
  );
}

export default FloatingCalendar;
