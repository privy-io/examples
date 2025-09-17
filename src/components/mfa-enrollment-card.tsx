import { useMfaEnrollment } from "@privy-io/react-auth";
import { Badge } from "./ui/badge";

const MFAEnrollmentCard = () => {
  const { showMfaEnrollmentModal } = useMfaEnrollment();
  return (
    <div className={["card", "card-padding"].join(" ")}>
      <div className="row-between-start">
        <div>
          <h3 className="card-title">
            MFA Enrollment{" "}
            <Badge>
              <code>@/components/mfa-enrollment-card.tsx</code>
            </Badge>
          </h3>
          <p className={["mt-1", "text-sm", "muted"].join(" ")}>
            Enroll in MFA to enhance security. Privy support TOTP, SMS and
            Passkey MFA methods, once enrolled, you can use to perform sensitive
            wallet actions.
          </p>
        </div>
      </div>
      <button
        onClick={showMfaEnrollmentModal}
        className={["mt-4", "btn"].join(" ")}
      >
        Enroll in MFA
      </button>
    </div>
  );
};

export default MFAEnrollmentCard;
