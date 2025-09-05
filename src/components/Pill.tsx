export const Pill = ({
  text,
  color,
  bg,
}: {
  text: string;
  color: string;
  bg: string;
}) => {
  return (
    <div
      className="text-xs py-0.5 px-2 h-fit rounded-md"
      style={{
        color: color,
        backgroundColor: bg,
      }}
    >
      {text}
    </div>
  );
};
