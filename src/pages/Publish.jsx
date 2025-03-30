import React, { useState, useEffect } from "react";
import { Check, AlertCircle, ChevronRight, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../authentication/authHooks";
import {
  createCheckoutSession,
  getActiveSubscription,
} from "../services/apiSubscription";
import { toast } from "react-hot-toast";

export default function Publish() {
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const navigate = useNavigate();

  // Define your Stripe price IDs (you'll get these from your Stripe dashboard)
  const STRIPE_PRICES = {
    monthly: "price_monthly_id_from_stripe",
    yearly: "price_yearly_id_from_stripe",
  };

  // Fetch current subscription on component mount
  useEffect(() => {
    if (user) {
      const fetchSubscription = async () => {
        try {
          const subscription = await getActiveSubscription(user.id);
          setCurrentSubscription(subscription);
        } catch (error) {
          console.error("Error fetching subscription:", error);
        }
      };

      fetchSubscription();
    }
  }, [user]);

  const handleSubscribe = async (planType) => {
    if (!user) {
      toast.error("Please log in to subscribe");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      // Create a checkout session
      const { url } = await createCheckoutSession({
        priceId: STRIPE_PRICES[planType],
        userId: user.id,
        successUrl: window.location.origin + "/dashboard?subscription=success",
        cancelUrl: window.location.origin + "/publish",
      });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("There was a problem setting up the checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const plans = {
    free: {
      name: "Free",
      price: "$0",
      billing: "",
      features: ["unlimited browsing", "Standard support"],
      limitations: ["No custom branding", "Limited visibility"],
    },
    monthly: {
      name: "Publisher",
      price: "$5.99",
      billing: "/month",
      features: [
        "Unlimited novels",
        "Unlimited chapters",
        "Advanced reader analytics",
        "Priority support",
        "Featured visibility",
        "Early access to new features",
      ],
    },
    yearly: {
      name: "Publisher Plus",
      price: "$59.99",
      billing: "/year",
      features: [
        "Unlimited novels",
        "Unlimited chapters",
        "Advanced reader analytics",
        "Priority support",
        "Custom novel branding",
        "Featured visibility",
        "Early access to new features",
        "2 months free compared to monthly",
        "Exclusive publisher community",
      ],
    },
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Become a Publisher</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Unlock your full creative potential with NovelNest publisher tools
          </p>
        </div>

        {/* Plan toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-lg border border-gray-600">
            <button
              onClick={() => setSelectedPlan("monthly")}
              className={`px-6 py-2 rounded-md ${
                selectedPlan === "monthly"
                  ? "bg-primary text-primary-content"
                  : ""
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan("yearly")}
              className={`px-6 py-2 rounded-md ${
                selectedPlan === "yearly"
                  ? "bg-primary text-primary-content"
                  : ""
              }`}
            >
              Yearly <span className="text-xs font-medium">Save 16%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free tier */}
          <div className="border border-gray-700 rounded-xl overflow-hidden hover:border-gray-500 transition-all">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{plans.free.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plans.free.price}</span>
                <span className="opacity-70">{plans.free.billing}</span>
              </div>
              <p className="mb-6">
                Perfect for casual writers just starting out.
              </p>
              <Link to="#" className="btn btn-outline w-full mb-6">
                Current Plan
              </Link>
              <div className="space-y-3">
                {plans.free.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check size={18} className="mr-2 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plans.free.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center opacity-60">
                    <AlertCircle size={18} className="mr-2 text-red-500" />
                    <span>{limitation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly tier */}
          <div className="border border-primary rounded-xl overflow-hidden relative transform hover:scale-105 transition-all shadow-lg">
            <div className="absolute top-0 right-0 bg-primary text-primary-content px-3 py-1 text-sm font-medium rounded-bl-lg">
              Popular
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{plans.monthly.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  {plans.monthly.price}
                </span>
                <span className="opacity-70">{plans.monthly.billing}</span>
              </div>
              <p className="mb-6">
                For dedicated authors building their audience.
              </p>
              <button
                className="btn btn-primary w-full mb-6"
                onClick={() => handleSubscribe("monthly")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upgrade Now"
                )}
              </button>
              <div className="space-y-3">
                {plans.monthly.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check size={18} className="mr-2 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yearly tier */}
          <div className="border border-gray-700 rounded-xl overflow-hidden hover:border-gray-500 transition-all">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{plans.yearly.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plans.yearly.price}</span>
                <span className="opacity-70">{plans.yearly.billing}</span>
              </div>
              <p className="mb-6">
                Our best value for serious novel publishers.
              </p>
              <button
                className="btn btn-outline w-full mb-6"
                onClick={() => handleSubscribe("yearly")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upgrade Now"
                )}
              </button>
              <div className="space-y-3">
                {plans.yearly.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check size={18} className="mr-2 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="collapse collapse-arrow border border-base-300 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Can I switch between plans?
              </div>
              <div className="collapse-content">
                <p>
                  Yes, you can upgrade, downgrade, or cancel your plan at any
                  time. Changes to your subscription will take effect on your
                  next billing cycle.
                </p>
              </div>
            </div>

            <div className="collapse collapse-arrow border border-base-300 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                What payment methods do you accept?
              </div>
              <div className="collapse-content">
                <p>
                  We accept all major credit cards including Visa, Mastercard,
                  and American Express. We also support PayPal payments.
                </p>
              </div>
            </div>

            <div className="collapse collapse-arrow border border-base-300 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Is there a free trial for the paid plans?
              </div>
              <div className="collapse-content">
                <p>
                  We offer a 7-day free trial for our Publisher plan. You won't
                  be charged until the trial period ends, and you can cancel
                  anytime.
                </p>
              </div>
            </div>

            <div className="collapse collapse-arrow border border-base-300 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                What happens to my content if I downgrade?
              </div>
              <div className="collapse-content">
                <p>
                  If you downgrade to the Free plan, you'll keep access to your
                  first novel with up to 5 chapters. Any additional content will
                  be saved but hidden until you upgrade again.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact section */}
        <div className="text-center mt-20">
          <h2 className="text-xl font-medium mb-2">Have more questions?</h2>
          <p className="mb-4">
            Our team is here to help you find the perfect plan for your needs.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center text-primary hover:text-primary-focus"
          >
            Contact us <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
