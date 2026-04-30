import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";
import { getOAuthBrokerUrl } from "@/lib/app-url";

type OAuthProvider = "google" | "apple" | "microsoft" | "lovable";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const signInWithCloudOAuth = async (provider: OAuthProvider, opts?: SignInOptions) => {
  const result = await createLovableAuth({ oauthBrokerUrl: getOAuthBrokerUrl() }).signInWithOAuth(provider, opts);

  if (result.error || result.redirected) return result;

  try {
    await supabase.auth.setSession(result.tokens);
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  return result;
};