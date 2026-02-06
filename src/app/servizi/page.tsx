import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import ServiceCategory from "@/components/ServiceCategory";
import { serviceCategories } from "@/lib/site-data";

export const metadata = {
  title: "Servizi",
};

export default function ServiziPage() {
  return (
    <div className="space-y-16 pb-24 pt-10">
      <Container>
        <SectionHeading
          eyebrow="Servizi"
          title="Soluzioni complete per privati e aziende"
          description="Ogni categoria è gestita con consulenza dedicata, attivazioni rapide e assistenza continua."
        />
      </Container>

      <Container className="space-y-10">
        {serviceCategories.map((category) => (
          <ServiceCategory key={category.id} category={category} />
        ))}
      </Container>
    </div>
  );
}
