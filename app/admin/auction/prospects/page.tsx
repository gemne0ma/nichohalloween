import { getAdminUsers } from "../../queries";
import { getAllProspects } from "./queries";
import ProspectsRegister from "./ProspectsRegister";
import AuctionShell from "../AuctionShell";

export default async function ProspectsPage() {
  const [prospects, adminUsers] = await Promise.all([
    getAllProspects(),
    getAdminUsers(),
  ]);

  return (
    <AuctionShell active="outreach">
      <ProspectsRegister prospects={prospects} adminUsers={adminUsers} />
    </AuctionShell>
  );
}
