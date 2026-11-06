import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { AccountPreferences, LinkedWallet, UserProfile } from "@/components/depvest/types";

export const GUEST_PROFILE: UserProfile = {
  id: "local-guest",
  email: null,
  emailVerified: false,
  displayName: null,
  avatarUrl: null,
  createdAt: null,
  isAuthenticated: false,
  linkedWallets: [],
};

export const DEFAULT_PREFERENCES: AccountPreferences = { riskTolerance: "Balanced", emailNotifications: true };

/** Loads the signed-in user's saved profile, preferences and linked wallets. */
export async function loadAccount(user: User): Promise<{ profile: UserProfile; preferences: AccountPreferences }> {
  const [{ data: row }, { data: wallets }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("wallet_links").select("*").eq("user_id", user.id),
  ]);
  return {
    profile: {
      id: user.id,
      email: user.email ?? row?.email ?? null,
      emailVerified: Boolean(user.email_confirmed_at),
      displayName: row?.display_name ?? user.email?.split("@")[0] ?? null,
      avatarUrl: row?.avatar_url ?? null,
      createdAt: row?.created_at ?? user.created_at ?? null,
      isAuthenticated: true,
      linkedWallets: (wallets ?? []).map((w) => ({
        address: w.address,
        provider: w.provider as LinkedWallet["provider"],
        isPrimary: w.is_primary,
        verifiedAt: w.verified_at,
      })),
    },
    preferences: {
      riskTolerance: (row?.risk_tolerance as AccountPreferences["riskTolerance"]) ?? "Balanced",
      emailNotifications: row?.email_notifications ?? true,
    },
  };
}

export async function saveProfile(userId: string, displayName: string, prefs: AccountPreferences) {
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      risk_tolerance: prefs.riskTolerance,
      email_notifications: prefs.emailNotifications,
    })
    .eq("id", userId);
  if (error) throw new Error("Unable to save your profile. Please try again.");
}

export async function saveWalletLink(userId: string, address: string, provider: LinkedWallet["provider"]) {
  const { error } = await supabase
    .from("wallet_links")
    .upsert({ user_id: userId, address, provider, is_primary: true }, { onConflict: "user_id,address,provider" });
  if (error) throw new Error("Unable to save this wallet to your account.");
}
