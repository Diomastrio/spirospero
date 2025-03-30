import supabase from "./supabaseClient";

export async function createCheckoutSession({
  priceId,
  userId,
  successUrl,
  cancelUrl,
}) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      {
        body: {
          priceId,
          userId,
          successUrl: successUrl || window.location.origin + "/dashboard",
          cancelUrl: cancelUrl || window.location.origin + "/publish",
        },
      }
    );

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function getActiveSubscription(userId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data || null;
}
