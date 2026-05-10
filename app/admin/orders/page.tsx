import { getAllOrders } from "../queries";
import OrdersList from "./OrdersList";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const search = params.q || "";
  const allOrders = await getAllOrders(search);

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1000px]">
      <OrdersList
        orders={allOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          purchaserName: o.purchaserName,
          purchaserEmail: o.purchaserEmail,
          bundleType: o.bundleType,
          tokensPurchased: o.tokensPurchased,
          amountPaid: o.amountPaid,
          createdAt: o.createdAt.toISOString(),
        }))}
        currentSearch={search}
      />
    </div>
  );
}
