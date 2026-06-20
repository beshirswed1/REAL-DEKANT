"use client";

import React, { useState } from "react";

export interface ContactMessage {
  id: string;
  name: string;
  subject: string;
  message: string;
  status: "unread" | "read";
  createdAt: string;
}

interface ContactMessagesClientProps {
  initialMessages: ContactMessage[];
}

export default function ContactMessagesClient({ initialMessages }: ContactMessagesClientProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus === "read") return;
    setLoadingAction(id);
    try {
      const res = await fetch("/api/admin/contact-messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "markRead" }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, status: "read" } : msg))
        );
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    setLoadingAction(id);
    try {
      const res = await fetch("/api/admin/contact-messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete message", err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-charcoal">İletişim Mesajları</h1>
          <p className="text-sm text-charcoal/60 mt-1 font-montserrat">
            Kullanıcılardan gelen tüm iletişim mesajlarını buradan yönetebilirsiniz.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/10 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-10 text-center text-charcoal/50 font-montserrat text-sm">
            Henüz bir mesaj bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-montserrat text-sm">
              <thead className="bg-cream-light/50 border-b border-charcoal/10">
                <tr>
                  <th className="px-6 py-4 font-semibold text-charcoal/70">Durum</th>
                  <th className="px-6 py-4 font-semibold text-charcoal/70">Gönderen</th>
                  <th className="px-6 py-4 font-semibold text-charcoal/70">Konu</th>
                  <th className="px-6 py-4 font-semibold text-charcoal/70 min-w-[200px]">Mesaj</th>
                  <th className="px-6 py-4 font-semibold text-charcoal/70">Tarih</th>
                  <th className="px-6 py-4 font-semibold text-charcoal/70 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {messages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    className={`hover:bg-charcoal/[0.02] transition-colors ${msg.status === "unread" ? "bg-amber-50/30" : ""}`}
                  >
                    <td className="px-6 py-4">
                      {msg.status === "unread" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 tracking-wider uppercase">
                          Yeni
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 tracking-wider uppercase">
                          Okundu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-charcoal">{msg.name}</td>
                    <td className="px-6 py-4 text-charcoal/80">{msg.subject}</td>
                    <td className="px-6 py-4 text-charcoal/60">
                      <div className="max-w-md break-words whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-charcoal/60 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {msg.status === "unread" && (
                        <button
                          onClick={() => handleMarkAsRead(msg.id, msg.status)}
                          disabled={loadingAction === msg.id}
                          className="px-3 py-1.5 text-xs font-semibold text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Okundu İşaretle
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={loadingAction === msg.id}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
