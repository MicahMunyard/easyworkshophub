
export interface CustomerTag {
  id: string;
  name: string;
  color?: string;
}

export interface CustomerTagsProps {
  customerId: string;
  onTagsUpdated?: () => void;
}
