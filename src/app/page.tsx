import SignOut from "@/components/SignOut";
import HomeContents from "./components/home-contents";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";

export default async function Home() {
  await requireAuth()

  return (
    <>
      <HomeContents />
      <SignOut />
    </>
  );
}
