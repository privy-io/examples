type Props = {
  href?: string;
  children: React.ReactNode;
};

export const Alert = ({ href, children }: Props) => {
  return (
    <a href={href} target="_blank" rel="noreferrer" color="#FF8271">
      {children}
    </a>
  );
};
