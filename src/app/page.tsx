import { Suspense } from "react";
import ChatPage from "./ChatPage";

export default function HomePage() {
  return (
    <Suspense fallback={<div>กำลังโหลด Web Chat...</div>}>
      <ChatPage />
    </Suspense>
  );
}
