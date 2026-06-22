import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 15% 20%, rgba(34,211,238,0.18), transparent 28%), radial-gradient(circle at 85% 0%, rgba(14,165,233,0.14), transparent 30%), linear-gradient(135deg, #020617 0%, #0f172a 48%, #111827 100%)",
          color: "white",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.02))",
          }}
        />

        {/* Glow orb top-right */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -160,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "#22d3ee22",
            filter: "blur(24px)",
          }}
        />

        {/* Glow orb bottom-left */}
        <div
          style={{
            position: "absolute",
            left: -80,
            bottom: -120,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "#22d3ee18",
            filter: "blur(20px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "72px 72px 56px",
            justifyContent: "space-between",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "74%",
              zIndex: 1,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {/* Eyebrow */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.28em",
                  fontSize: 24,
                  color: "#bae6fd",
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: "#22d3ee",
                    boxShadow: "0 0 28px #22d3ee",
                  }}
                />
                Agenzia servizi a Castellammare di Stabia
              </div>

              {/* Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 72,
                    lineHeight: 1.02,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    maxWidth: "95%",
                  }}
                >
                  Telefonia, energia, spedizioni e servizi digitali
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: "#cbd5e1",
                    fontSize: 30,
                    lineHeight: 1.35,
                    maxWidth: "92%",
                  }}
                >
                  Consulenza locale, assistenza operativa e soluzioni digitali in
                  un unico punto.
                </p>
              </div>
            </div>

            {/* Bottom pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 999,
                  border: "1px solid #22d3ee66",
                  background: "#22d3ee14",
                  padding: "12px 22px",
                  fontSize: 24,
                  color: "#e2e8f0",
                }}
              >
                Castellammare di Stabia
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "12px 22px",
                  fontSize: 24,
                  color: "#cbd5e1",
                }}
              >
                agenziaplinio.it
              </div>
            </div>
          </div>

          {/* Right column */}
          <div
            style={{
              display: "flex",
              width: 220,
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
                textAlign: "right",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  textTransform: "uppercase",
                  letterSpacing: "0.24em",
                  color: "#7dd3fc",
                  fontWeight: 700,
                }}
              >
                AG SERVIZI
              </span>
              <span style={{ fontSize: 18, color: "#94a3b8" }}>
                servizi, consulenza, digitale
              </span>
            </div>

            <div
              style={{
                display: "flex",
                width: 180,
                height: 180,
                borderRadius: 36,
                border: "1px solid #22d3ee55",
                background: "rgba(255,255,255,0.05)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 96,
                  height: 96,
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#020617",
                  fontSize: 42,
                  fontWeight: 900,
                }}
              >
                AG
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
