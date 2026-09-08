export function formatQuintalsFromKilograms(value: bigint | string): string {
  const weightKg = typeof value === "bigint" ? value : BigInt(value);
  const whole = weightKg / 100n;
  const remainder = weightKg % 100n;

  return remainder === 0n
    ? `${whole.toLocaleString("en-IN")} Qt`
    : `${whole}.${remainder.toString().padStart(2, "0")} Qt`;
}
