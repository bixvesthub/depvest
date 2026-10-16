export function createReferralCode(wallet: string) {
  const seed = `depvest:${wallet}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  }
  return `DV-${(hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-6)}`;
}

export function qualifiesReferral(registrationSucceeded: boolean, accountActivated: boolean) {
  return registrationSucceeded && accountActivated;
}
