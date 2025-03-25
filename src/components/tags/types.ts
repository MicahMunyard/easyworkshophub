
export interface CustomerTag {
  id: string;
  name: string;
  color?: string;
}

export interface CustomerTagsProps {
  customerId: string; // Changed from number to string
  onTagsUpdated?: () => void;
}
