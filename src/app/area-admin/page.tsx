import AdminDashboardOverview from "@/components/admin-area/AdminDashboardOverview";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Area Admin | AG SERVIZI",
    description: "Pannello interno per gestire le richieste dell'area clienti AG SERVIZI.",
    path: "/area-admin",
  });
}

export default function AreaAdminPage() {
  return (
    <div className="space-y-6 pb-16">
      <AdminDashboardOverview />
    </div>
  );
}
