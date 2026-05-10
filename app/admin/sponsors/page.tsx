import { getAllSponsors } from "../queries";
import SponsorRegister from "./SponsorRegister";

export default async function SponsorsPage() {
  const allSponsors = await getAllSponsors();

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1000px]">
      <SponsorRegister
        sponsors={allSponsors.map((s) => ({
          id: s.id,
          businessName: s.businessName,
          contact: s.contact,
          email: s.email,
          tier: s.tier,
          committedAmount: s.committedAmount,
          paidAmount: s.paidAmount ?? 0,
          logoUrl: s.logoUrl,
          thanked: s.thanked,
          notes: s.notes,
        }))}
      />
    </div>
  );
}
