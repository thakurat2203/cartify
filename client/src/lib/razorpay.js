const RAZORPAY_CHECKOUT_SCRIPT_ID = "razorpay-checkout-js";
const RAZORPAY_CHECKOUT_SCRIPT_SRC =
  "https://checkout.razorpay.com/v1/checkout.js";

export const loadRazorpayCheckout = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  const existingScript = document.getElementById(
    RAZORPAY_CHECKOUT_SCRIPT_ID,
  );

  if (existingScript) {
    return new Promise((resolve) => {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = RAZORPAY_CHECKOUT_SCRIPT_ID;
    script.src = RAZORPAY_CHECKOUT_SCRIPT_SRC;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};
