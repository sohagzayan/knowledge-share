"use server";

import { getUserHelpRequests } from "@/app/data/user/get-user-help-requests";
import { HelpRequestsList } from "./_components/HelpRequestsList";

export default async function MyHelpRequestsPage() {
  const helpRequests = await getUserHelpRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Help Requests</h1>
        <p className="text-muted-foreground">
          View the status and responses to your help requests
        </p>
      </div>

      <HelpRequestsList initialRequests={helpRequests} />
    </div>
  );
}
