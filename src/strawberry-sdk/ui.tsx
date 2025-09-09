import Image from "next/image";
import { useStrawberrySdk } from ".";
import { LoaderIcon } from "lucide-react";

export const LoginWithStrawberry = () => {
  const { login } = useStrawberrySdk();
  return (
    <button
      className="h-11 px-6 py-2 bg-[#110f2a] hover:bg-[#211f36] rounded-[10px] justify-center items-center gap-2 inline-flex w-fit"
      onClick={login}
    >
      <Image
        src="/strawberry.png"
        alt="Strawberry Logo"
        width={20}
        height={20}
      />
      <div className="text-white text-base font-medium font-['Inter'] leading-normal">
        Log in with Strawberry Fields
      </div>
    </button>
  );
};

export const ConnectionLoading = () => {
  return (
    <div className="h-11 px-6 py-2 bg-[#110f2a] hover:bg-[#211f36] rounded-[10px] justify-center items-center gap-2 inline-flex w-fit cursor-not-allowed relative">
      {/* These fields are there to simply button width */}
      <Image
        src="/strawberry.png"
        alt="Strawberry Logo"
        width={20}
        height={20}
        className="invisible"
      />{" "}
      <div className="text-white text-base font-medium font-['Inter'] leading-normal invisible">
        Log in with Strawberry Fields
      </div>
      <LoaderIcon size={20} className="text-white absolute animate-spin" />
    </div>
  );
};
