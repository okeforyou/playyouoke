import React from 'react';
import { Cast, Cast as CastIcon, X } from 'lucide-react';
import { useCast } from '../context/CastContext';

export const CastButton = () => {
  const { isAvailable, isConnected, connect, disconnect, receiverName } = useCast();

  if (!isAvailable) {
    return null; // Don't show if Cast SDK not ready or no devices
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 transition-all">
        <CastIcon size={16} className="text-primary animate-pulse" />
        <span className="text-xs font-medium text-primary hidden sm:inline truncate max-w-[100px]">
          {receiverName}
        </span>
        <button
          onClick={disconnect}
          className="hover:bg-primary/20 rounded-full p-1 transition-colors"
          title="Disconnect"
        >
          <X size={14} className="text-primary" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect()}
      className="btn btn-ghost btn-sm gap-2 text-gray-600 hover:text-primary hover:bg-primary/10"
      title="Cast to TV"
    >
      <Cast size={20} />
      <span className="hidden sm:inline">Cast</span>
    </button>
  );
};
