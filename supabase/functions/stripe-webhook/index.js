import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2023-10-16",
});

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle specific events
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      // Get customer and subscription details
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const userId = session.metadata.userId;

      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;

      // Determine plan type based on priceId
      const planType =
        priceId === Deno.env.get("STRIPE_PRICE_MONTHLY") ? "monthly" : "yearly";

      // Update user's subscription in database
      const { error } = await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        price_id: priceId,
        plan_type: planType,
        status: "active",
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      });

      if (error) {
        console.error("Error updating subscription:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
        });
      }

      // Update user's role to "publisher"
      await supabase
        .from("profiles")
        .update({ role: "publisher" })
        .eq("id", userId);

      break;

    case "customer.subscription.updated":
      // Handle subscription updates
      break;

    case "customer.subscription.deleted":
      // Handle subscription cancellations
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
