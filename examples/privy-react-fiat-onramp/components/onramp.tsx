import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";

type OnRampModalProps = {
  onrampUrl: string | null;
  onClose: () => void;
};

export default function OnrampModal({ onrampUrl, onClose }: OnRampModalProps) {
  const onContinue = () => {
    // This should never happen, as the modal is only open when onrampUrl is defined
    if (!onrampUrl) return;

    // Open the onramp URL in a new tab and clear React state
    window.open(onrampUrl, "_blank");
    onClose();
  };

  return (
    // Only show modal if onrampUrl is defined
    <Transition.Root show={!!onrampUrl} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative my-8 w-5/6 transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-2 text-left shadow-xl transition-all md:w-5/12">
                <div>
                  <div className="text-center sm:mt-3">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      <p className="pb-2 text-sm font-semibold text-gray-400">
                        Fund your wallet with
                      </p>
                      <Image
                        src="/images/moonpay.svg"
                        height={50}
                        width={200}
                        alt="Moonpay Logo"
                      />
                    </Dialog.Title>
                  </div>
                </div>
                <div className="mt-6 w-full">
                  <div className="w-full px-4 pb-2 text-center">
                    <p className="mb-3">
                      This app partners with{" "}
                      <a
                        className="font-semibold text-indigo-600"
                        href="https://www.moonpay.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Moonpay
                      </a>{" "}
                      to help you fund your wallet.
                    </p>
                    <p className="mb-3">
                      Moonpay allows you to securely purchase crypto using your
                      credit card, debit card, bank account, Apple/Google Pay,
                      and more.
                    </p>
                    <p className="mb-3">
                      Click{" "}
                      <span className="font-semibold text-indigo-600">
                        Continue
                      </span>{" "}
                      to open Moonpay in a new tab.
                    </p>
                  </div>
                  <div className="flex w-full gap-x-2 px-4 pb-2">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-500 shadow-sm outline outline-1 outline-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={onContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
