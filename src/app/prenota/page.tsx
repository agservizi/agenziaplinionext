import Container from "@/components/Container";

export default function PrenotaPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Prenotazioni disattivate
          </p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Il servizio di prenotazione online non è disponibile.
          </h1>
          <p className="text-base text-slate-300 md:text-lg">
            Contattaci per fissare un appuntamento: ti risponderemo rapidamente.
          </p>
        </Container>
      </section>
    </div>
  );
}
