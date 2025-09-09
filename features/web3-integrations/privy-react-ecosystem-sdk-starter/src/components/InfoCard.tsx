export const InfoCard = ({
  icon: Icon,
  href,
  title,
  description,
}: {
  icon: React.ReactNode;
  href: string;
  title: string;
  description: string;
}) => {
  return (
    <a
      className="flex p-6 flex-col border border-[#cbcde1] rounded-xl gap-8 w-[304px] h-[194px] hover:bg-gray-50"
      href={href}
    >
      <div>{Icon}</div>
      <div className="flex flex-col gap-3">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-[#64658b] text-sm font-normal">{description}</div>
      </div>
    </a>
  );
};
