import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import "../style.css";

function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.link/ov814n"
      target="_blank"
      rel="noreferrer"
      className="floating-whatsapp"
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="whatsapp-icon" />
      <span className="whatsapp-text">Contact Now</span>
    </a>
  );
}

export default FloatingWhatsApp;
