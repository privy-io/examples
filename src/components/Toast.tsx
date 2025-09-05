import clsx from "clsx";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { type ReactNode } from "react";
import { Toaster, toast as sonner, type ExternalToast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

const icons = {
  success: <CircleCheck className="shrink-0 text-[#16A34A]" />,
  error: <TriangleAlert className="shrink-0 text-[#DC2626]" />,
  info: <Info className="shrink-0 text-[#4F46E5]" />,
  warning: <TriangleAlert className="shrink-0 text-[#B45309]" />,
};

export function AppToaster() {
  return (
    <Toaster
      cn={clsx}
      position="top-center"
      icons={icons}
      className="w-full max-w-sm"
      toastOptions={{
        duration: 2000,
        className: "gap-3 py-2 h-auto w-auto",
        descriptionClassName: "text-ia-sm font-medium text-ia-text pr-3",
        classNames: {
          success: "border-[#22C55E] bg-[#DCFCE7]",
          error: "border-[#EF4444] bg-[#FEE2E2]",
          info: "border-[#818CF8] bg-[#e0e7ff]",
          warning: "border-[] bg-[]",
          closeButton:
            "left-auto right-1 border-0 !bg-transparent text-icon-disabled group-hover:text-icon transition-all top-1/2 -translate-y-1/2 [&>svg]:w-4 [&>svg]:h-4",
        },
      }}
      closeButton
    />
  );
}

function Toast({
  children,
  type,
  onClick,
}: {
  children?: ReactNode;
  type: ToastType;
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-3" onClick={onClick}>
      {icons[type]}
      <div className="pr-3 text-ia-sm font-medium text-ia-text">{children}</div>
    </div>
  );
}

/**
 * Pushes a dismissable toast to the screen. Wraps sonner's toast function so we can dismiss the toast when clicked.
 */
function pushDismissableToast(
  type: ToastType,
  message: ReactNode,
  options?: ExternalToast
) {
  let toastId: string | number | undefined = undefined;

  function onClick() {
    sonner.dismiss(toastId);
  }

  toastId = sonner[type](
    <Toast type={type} onClick={onClick}>
      {message}
    </Toast>,
    { ...options, className: clsx("cursor-pointer group", options?.className) }
  );

  return toastId;
}

export const toast = {
  success: pushDismissableToast.bind(null, "success"),
  error: pushDismissableToast.bind(null, "error"),
  info: pushDismissableToast.bind(null, "info"),
  warning: pushDismissableToast.bind(null, "warning"),
};
