
export const AUSTRALIAN_STATES = [
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NSW", label: "New South Wales" },
  { value: "NT", label: "Northern Territory" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "VIC", label: "Victoria" },
  { value: "WA", label: "Western Australia" }
] as const;

// Years for dropdown (current year down to 1950)
export const YEARS = Array.from(
  { length: new Date().getFullYear() - 1949 }, 
  (_, i) => (new Date().getFullYear() - i).toString()
);

