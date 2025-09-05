import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.css";
import LoginButton from './LoginButton';

interface NavItemProps {
  href: string;
  children: string | JSX.Element;
  openInNewTab?: boolean;
}

const Navbar = () => {

  function NavItem({ href, openInNewTab, children }: NavItemProps): JSX.Element {
    return (
      <Link passHref href={href} target={openInNewTab ? "_blank" : undefined} rel={openInNewTab ? "noreferrer" : undefined}>
        <p
          className={`uppercase tracking-widest font-[500] text-base hover:text-black text-white p-2`}
        >
          {children}
        </p>
      </Link>
    );
  }

  return (
    <>
      <nav className={`${styles.navbar} w-full flex flex-wrap items-center sm:justify-between justify-center`} >
        <NavItem href="http://burble.it/" openInNewTab><Image width={100} height={40} src="/images/burble-logo.png" alt="icon" /></NavItem>  
        <LoginButton />
      </nav>
    </>

  );
};

export default Navbar;