
import { useState } from "react";

export const useCustomerTabs = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return {
    activeTab,
    setActiveTab
  };
};
