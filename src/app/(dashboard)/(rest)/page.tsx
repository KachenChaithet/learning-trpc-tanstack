import SignOut from "@/components/SignOut";
import { requireAuth } from "@/lib/auth-utils";
import HomeContents from "../../components/home-contents";

export default async function Home() {
  await requireAuth()

  return (
    <>
      <HomeContents />
      <SignOut />
    </>
  );
}
