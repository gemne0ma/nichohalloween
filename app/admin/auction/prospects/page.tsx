import { getAdminUsers } from "../../queries";
import { getAllProspects, getActivityByProspect } from "./queries";
import ProspectsRegister from "./ProspectsRegister";
import AuctionShell from "../AuctionShell";

export default async function ProspectsPage() {
  const [prospects, adminUsers, activityMap] = await Promise.all([
    getAllProspects(),
    getAdminUsers(),
    getActivityByProspect(),
  ]);

  // Map is not serialisable across the server/client boundary, so hand the
  // client a plain object keyed by prospect id.
  const activity = Object.fromEntries(activityMap);

  return (
    <AuctionShell active="outreach">
      <ProspectsRegister
        prospects={prospects}
        adminUsers={adminUsers}
        activity={activity}
      />
    </AuctionShell>
  );
}
