
import { useState } from "react";

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  return {
    isOpen,
    toggleMenu,
    setIsOpen
  };
}
