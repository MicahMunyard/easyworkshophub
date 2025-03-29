
import React from "react";
import { Link } from "react-router-dom";

const NavLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <img
        src="/lovable-uploads/d86411b9-8db3-4586-9b40-33e6c1f1bccf.png"
        alt="BASE Logo"
        className="h-10 w-auto"
        width={120}
        height={40}
      />
    </Link>
  );
};

export default NavLogo;
