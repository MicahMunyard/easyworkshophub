
import React from "react";
import { Link } from "react-router-dom";
import workshopBaseLogo from "@/assets/workshopbase-logo.svg";

const NavLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <img
        src={workshopBaseLogo}
        alt="WorkshopBase Logo"
        className="h-10 w-auto"
        width={120}
        height={40}
      />
    </Link>
  );
};

export default NavLogo;
