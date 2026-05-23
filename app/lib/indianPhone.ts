export const indianMobilePattern = "[+]91 [6-9][0-9]{4} [0-9]{5}";
export const indianMobileExample = "+91 80541 86836";
const indianMobileExpression = /^[6-9][0-9]{9}$/;

function getNationalNumberDigits(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  return digits;
}

export function formatIndianPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "");
  const hasCountryCode =
    value.trimStart().startsWith("+91") ||
    (digits.length > 10 && digits.startsWith("91"));
  const hasTrunkPrefix = digits.length > 10 && digits.startsWith("0");
  const nationalNumber = (
    hasCountryCode
      ? digits.slice(2)
      : hasTrunkPrefix
        ? digits.slice(1)
        : digits
  ).slice(0, 10);

  if (!nationalNumber) {
    return value.includes("+") ? "+91 " : "";
  }

  const firstGroup = nationalNumber.slice(0, 5);
  const secondGroup = nationalNumber.slice(5);

  return `+91 ${firstGroup}${secondGroup ? ` ${secondGroup}` : ""}`;
}

export function normalizeIndianPhone(value: string) {
  const nationalNumber = getNationalNumberDigits(value);

  if (!indianMobileExpression.test(nationalNumber)) {
    return null;
  }

  return `+91 ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`;
}

export function getIndianPhoneValidationMessage(value: string) {
  if (!value.trim()) {
    return "Please enter your mobile number.";
  }

  if (value.trim().startsWith("+") && !value.trim().startsWith("+91")) {
    return "Please use the +91 country code for an Indian mobile number.";
  }

  const nationalNumber = getNationalNumberDigits(value);

  if (nationalNumber.length !== 10) {
    return `Enter a valid 10-digit Indian mobile number, for example ${indianMobileExample}.`;
  }

  if (!/^[6-9]/.test(nationalNumber)) {
    return "Indian mobile numbers must start with 6, 7, 8, or 9.";
  }

  return null;
}
