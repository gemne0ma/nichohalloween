import { redirect } from "next/navigation";

// The Items tab is gone. Business outreach is where donations are tracked
// now, so /admin/auction lands there. The URL is kept so the sidebar entry,
// bookmarks and the matchPrefix active state all still work.
export default function AuctionPage() {
  redirect("/admin/auction/prospects");
}
