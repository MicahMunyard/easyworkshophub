
import { Clock, AlertCircle, CheckCircle2, XCircle, Wrench } from "lucide-react";

export const jobStatuses = {
  pending: { 
    label: "Pending", 
    icon: Clock, 
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
  },
  inProgress: { 
    label: "In Progress", 
    icon: AlertCircle, 
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
  },
  working: { 
    label: "Working", 
    icon: Wrench, 
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
  },
  completed: { 
    label: "Completed", 
    icon: CheckCircle2, 
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
  },
  cancelled: { 
    label: "Cancelled", 
    icon: XCircle, 
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
  }
};
