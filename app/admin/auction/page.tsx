import { getAllAuctionItems } from "../queries";
import AuctionRegister from "./AuctionRegister";

export default async function AuctionPage() {
  const allItems = await getAllAuctionItems();

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1000px]">
      <AuctionRegister
        items={allItems.map((item) => ({
          id: item.id,
          itemName: item.itemName,
          classroom: item.classroom,
          donor: item.donor,
          estimatedValue: item.estimatedValue,
          status: item.status,
          platformListingUrl: item.platformListingUrl,
          notes: item.notes,
        }))}
      />
    </div>
  );
}
