import { headers } from "next/headers";
import HomeContents from "./components/home-contents";
import { auth } from "../lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return <div>Not authenticated</div>
  }
  return (
    <>
      <HomeContents />
    </>
  );
}
