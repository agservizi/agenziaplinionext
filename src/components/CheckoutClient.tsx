"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StoreProduct } from "@/lib/store-products";

const CART_PRODUCT_KEY = "ag:selectedCheckoutProduct";
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const bookingApiBase = (process.env.NEXT_PUBLIC_BOOKING_API_BASE || "").replace(/\/$/, "");

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

type CheckoutClientProps = {
  products: StoreProduct[];
};

type StripeCheckoutFormProps = {
  clientSecret: string;
  product: StoreProduct;
  customerEmail: string;
};

function StripeCheckoutForm({ clientSecret, product, customerEmail }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    setProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await stripe.confirmCardPayment(clientSecret, {
      receipt_email: customerEmail,
      payment_method: {
        card,
        billing_details: {
          email: customerEmail,
        },
      },
    });

    setProcessing(false);

    if (result.error) {
      setErrorMessage(result.error.message || "Pagamento non riuscito. Riprova.");
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      setSuccessMessage(`Pagamento completato con successo per ${product.name}.`);
      return;
    }

    setErrorMessage("Pagamento non completato. Controlla lo stato e riprova.");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: "16px",
                color: "#0f172a",
              },
            },
          }}
        />
      </div>

      {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}
      {successMessage ? <p className="text-sm font-medium text-emerald-600">{successMessage}</p> : null}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {processing ? "Elaborazione..." : `Paga ${product.priceLabel}`}
      </button>
    </form>
  );
}

export default function CheckoutClient({ products }: CheckoutClientProps) {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product") ?? "";
  const [clientSecret, setClientSecret] = useState("");
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [products, productId],
  );

  useEffect(() => {
    if (!selectedProduct) return;
    window.localStorage.setItem(CART_PRODUCT_KEY, selectedProduct.id);
    window.dispatchEvent(new Event("ag-cart-product-updated"));
  }, [selectedProduct]);

  useEffect(() => {
    setClientSecret("");
    setRequestError("");
  }, [productId]);

  const startPayment = async () => {
    if (!selectedProduct) {
      setRequestError("Seleziona un prodotto dallo store prima di procedere.");
      return;
    }

    const normalizedEmail = customerEmail.trim();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setRequestError("Inserisci una email valida per la consegna digitale.");
      return;
    }

    setLoadingIntent(true);
    setRequestError("");

    try {
      const endpoint = `${bookingApiBase}/api/payments/create-intent`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id, customerEmail: normalizedEmail }),
      });

      const payload = (await response.json()) as { clientSecret?: string; message?: string };
      if (!response.ok || !payload.clientSecret) {
        throw new Error(payload.message || "Impossibile inizializzare il pagamento.");
      }

      setClientSecret(payload.clientSecret);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Errore inizializzazione pagamento.");
    } finally {
      setLoadingIntent(false);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="lux-card rounded-2xl p-6">
        <p className="text-sm text-slate-600">
          Seleziona un prodotto dallo store per avviare il checkout interno.
        </p>
      </div>
    );
  }

  if (!stripePublicKey) {
    return (
      <div className="lux-card rounded-2xl p-6">
        <p className="text-sm text-slate-600">
          Configura <strong>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</strong> per abilitare il checkout carta interno.
        </p>
      </div>
    );
  }

  if (!stripePromise) {
    return null;
  }

  return (
    <div className="space-y-4">
      {selectedProduct ? (
        <div className="lux-card rounded-2xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            Prodotto selezionato
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{selectedProduct.name}</h2>
          <p className="mt-2 text-sm text-slate-600">{selectedProduct.description}</p>
          <p className="mt-4 text-base font-semibold text-slate-900">{selectedProduct.priceLabel}</p>
        </div>
      ) : null}

      <div className="lux-card rounded-2xl p-6">
        <p className="text-sm text-slate-600">
          Pagamento carta interno su agenziaplinio.it. Nessun embed e nessun redirect esterno nel checkout.
        </p>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email per consegna digitale</span>
          <input
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="nome@dominio.it"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
            autoComplete="email"
          />
        </label>

        {!clientSecret ? (
          <button
            type="button"
            onClick={startPayment}
            disabled={loadingIntent}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingIntent ? "Inizializzazione..." : "Procedi al pagamento"}
          </button>
        ) : (
          <div className="mt-5">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCheckoutForm
                clientSecret={clientSecret}
                product={selectedProduct}
                customerEmail={customerEmail.trim()}
              />
            </Elements>
          </div>
        )}

        {requestError ? <p className="mt-3 text-sm font-medium text-red-600">{requestError}</p> : null}
      </div>
    </div>
  );
}
