import { Metadata } from "next";
import Chat from "./Chat";

export const metadata: Metadata = {
  title: "Message",
};

export default function Page() {
  return <Chat />;
}
