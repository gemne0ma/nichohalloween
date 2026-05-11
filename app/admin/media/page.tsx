import { getMediaLibrary } from "@/app/admin/queries";
import MediaLibrary from "./MediaLibrary";

export default async function MediaPage() {
  const items = await getMediaLibrary();
  const publicUrlPrefix = process.env.R2_PUBLIC_URL || "";

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <MediaLibrary items={items} publicUrlPrefix={publicUrlPrefix} />
    </div>
  );
}
