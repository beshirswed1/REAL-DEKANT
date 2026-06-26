/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from "@/lib/firebase-admin";
import ContactMessagesClient, { ContactMessage } from "@/components/admin/ContactMessagesClient";

export const dynamic = "force-dynamic";

function toDate(ts: any): Date {
  if (!ts) return new Date(0);
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts._seconds) return new Date(ts._seconds * 1000);
  return new Date(0);
}

export default async function AdminContactMessagesPage() {
  const snap = await adminDb.collection("contactMessages").orderBy("createdAt", "desc").limit(100).get();

  const messages: ContactMessage[] = snap.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "Bilinmiyor",
      subject: data.subject || "",
      message: data.message || "",
      status: data.status || "unread",
      createdAt: toDate(data.createdAt).toISOString(),
    };
  });

  // Sort descending by date in-memory just in case
  messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <ContactMessagesClient initialMessages={messages} />;
}
