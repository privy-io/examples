import { ReactNode } from "react";

interface SectionProps {
  name: string;
  description: string;
  filepath: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function Section({
  name,
  description,
  filepath,
  actions,
  children,
}: SectionProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <p className="text-xs text-gray-500 font-mono mt-2">{filepath}</p>
        </div>
        {actions && (
          <div className="flex gap-2 flex-shrink-0 ml-4">{actions}</div>
        )}
      </div>
      {children && (
        <div className="border-t border-gray-200 pt-4">{children}</div>
      )}
    </div>
  );
}
