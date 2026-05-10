import { getAllVendors } from "../queries";
import VendorRegister from "./VendorRegister";

export default async function VendorsPage() {
  const allVendors = await getAllVendors();

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1000px]">
      <VendorRegister
        vendors={allVendors.map((v) => ({
          id: v.id,
          name: v.name,
          contactName: v.contactName,
          email: v.email,
          phone: v.phone,
          category: v.category,
          quotedAmount: v.quotedAmount,
          booked: v.booked,
          paid: v.paid,
          invoiceUrl: v.invoiceUrl,
          notes: v.notes,
        }))}
      />
    </div>
  );
}
