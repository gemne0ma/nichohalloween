import { getAllAuctionItems } from "../queries";
import AuctionRegister from "./AuctionRegister";
import AuctionShell from "./AuctionShell";

export default async function AuctionPage() {
  const allItems = await getAllAuctionItems();

  return (
    <AuctionShell active="items">
      <AuctionRegister
        items={allItems.map((item) => ({
          id: item.id,
          itemName: item.itemName,
          classroom: item.classroom,
          donor: item.donor,
          estimatedValue: item.estimatedValue,
          photoUrl: item.photoUrl,
          status: item.status,
          platformListingUrl: item.platformListingUrl,
          notes: item.notes,
        }))}
      />
    </AuctionShell>
  );
}
