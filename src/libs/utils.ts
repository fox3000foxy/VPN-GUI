// Utility functions for VPN GUI

export function treatPercentages(
  log: string,
): { percent: number; message: string } | null {
  if (!/\d{1,3}%/.test(log)) {
    return null;
  }
  const percentageRegex = /(\d{1,3})%/g;
  const percentages = [...log.matchAll(percentageRegex)];
  if (percentages.length === 0) return null;
  const lastPercentage = percentages[percentages.length - 1][0];
  const lastColonIdx = log.lastIndexOf(":");
  if (lastColonIdx === -1)
    return { percent: parseInt(lastPercentage), message: "" };
  const afterColon = log.slice(lastColonIdx + 1).trim();
  return {
    percent: parseInt(lastPercentage),
    message: afterColon,
  };
}

export async function getIp() {
  try {
    const res = await fetch("http://ip-api.com/json");
    const data = await res.json();
    return data.query || null;
  } catch (err) {
    console.error("Error while fetching IP:", err);
    return null;
  }
}
