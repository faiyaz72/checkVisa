export async function fetchSupportedOriginCodes(): Promise<string[]> {
  const temporarySupportedOriginCodes: string[] = [
    "BD",
    "PK",
    "LK",
    "IN",
    "CA",
  ];
  return temporarySupportedOriginCodes;
}
