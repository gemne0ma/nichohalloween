import { getClassroomLots } from "./actions";
import ClassroomTracker from "./ClassroomTracker";
import AuctionShell from "../AuctionShell";

export default async function ClassroomsPage() {
  const classrooms = await getClassroomLots();

  return (
    <AuctionShell active="classrooms">
      <ClassroomTracker classrooms={classrooms} />
    </AuctionShell>
  );
}
