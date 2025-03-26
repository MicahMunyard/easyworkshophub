
import React from "react";
import { Link } from "react-router-dom";

const NavLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src="/lovable-uploads/toliccs-logo.png"
        alt="Toliccs Logo"
        className="w-8 h-8"
        width={32}
        height={32}
      />
      <span className="font-bold text-xl hidden sm:inline-block">
        Toliccs
      </span>
    </Link>
  );
};

export default NavLogo;
