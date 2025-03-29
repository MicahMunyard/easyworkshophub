
import React from "react";
import { Link } from "react-router-dom";

const NavLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center justify-center w-full">
      <img
        src="/lovable-uploads/f43be453-735e-4166-99a5-8800aff53fdd.png"
        alt="BASE Logo"
        className="h-8 w-auto"
        width={100}
        height={32}
      />
    </Link>
  );
};

export default NavLogo;
