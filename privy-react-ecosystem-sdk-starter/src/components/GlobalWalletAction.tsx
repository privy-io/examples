export const GlobalWalletAction = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      className="px-2 py-2 gap-2 flex flex-row items-center hover:bg-gray-50 rounded-md w-[360px]"
      onClick={onClick}
    >
      {Icon}
      <div className="font-medium">{label}</div>
    </button>
  );
};
