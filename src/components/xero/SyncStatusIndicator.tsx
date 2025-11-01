import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface SyncStatusItem {
  label: string;
  status: 'idle' | 'syncing' | 'complete';
}

interface SyncStatusIndicatorProps {
  items: SyncStatusItem[];
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ items }) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          {item.status === 'syncing' && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          {item.status === 'complete' && (
            <Check className="h-4 w-4 text-green-600" />
          )}
          {item.status === 'idle' && (
            <div className="h-4 w-4 rounded-full border-2 border-border" />
          )}
          <span className={item.status === 'complete' ? 'text-muted-foreground line-through' : ''}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SyncStatusIndicator;
