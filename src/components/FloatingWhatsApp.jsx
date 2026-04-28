import { FaWhatsapp } from "react-icons/fa";

function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.link/ov814n"
      target="_blank"
      rel="noreferrer"
      className="floating-whatsapp"
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="floating-icon" />
      <span className="floating-text">Contact Now</span>
    </a>
  );
}

export default FloatingWhatsApp;
