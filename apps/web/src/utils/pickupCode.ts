export function generatePickupCode(): string {
  // Generate a random 6-digit number as a string
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}
