
import { getRandomUsers } from "@/actions/user.action";
import WhoToFollowClient from "./WhoToFollowClient";

export default async function WhoToFollowServer() {
  const users = await getRandomUsers();
  return <WhoToFollowClient users={users} />;
}
