
import React from "react";

interface SidebarOverlayProps {
  open: boolean;
  onClick: () => void;
}

const SidebarOverlay: React.FC<SidebarOverlayProps> = ({ open, onClick }) => {
  if (!open) return null;
  
  return (
    <div
      className="fixed inset-0 z-20 bg-black/70 lg:hidden"
      onClick={onClick}
    />
  );
};

export default SidebarOverlay;
