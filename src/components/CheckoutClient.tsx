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
  fallbackCheckoutUrl: string;
};

type StripeCheckoutFormProps = {
  clientSecret: string;
  product: StoreProduct;
};

function StripeCheckoutForm({ clientSecret, product }: StripeCheckoutFormProps) {
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
      payment_method: {
        card,
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

export default function CheckoutClient({ products, fallbackCheckoutUrl }: CheckoutClientProps) {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product") ?? "";
  const [clientSecret, setClientSecret] = useState("");
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [requestError, setRequestError] = useState("");

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

    setLoadingIntent(true);
    setRequestError("");

    try {
      const endpoint = `${bookingApiBase}/api/payments/create-intent`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id }),
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

  const checkoutUrl = selectedProduct?.payhipCheckoutUrl || fallbackCheckoutUrl;

  if (!selectedProduct && !checkoutUrl) {
    return (
      <div className="lux-card rounded-2xl p-6">
        <p className="text-sm text-slate-600">
          Nessun checkout disponibile. Verifica la configurazione prodotti Payhip.
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
        {!selectedProduct ? (
          <p className="text-sm text-slate-600">
            Seleziona un prodotto dallo store per procedere al pagamento interno.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Pagamento carta interno su agenziaplinio.it. Nessun embed e nessun redirect Payhip nel flusso checkout.
            </p>

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
                  <StripeCheckoutForm clientSecret={clientSecret} product={selectedProduct} />
                </Elements>
              </div>
            )}

            {requestError ? <p className="mt-3 text-sm font-medium text-red-600">{requestError}</p> : null}
          </>
        )}
      </div>
    </div>
  );
}
