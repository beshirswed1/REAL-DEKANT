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

  // Modal states
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

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
        // If currently viewing this message in details modal, update its status locally too
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => prev ? { ...prev, status: "read" } : null);
        }
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === "unread") {
      // Optimistically mark as read in local state
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m))
      );
      try {
        await fetch("/api/admin/contact-messages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: msg.id, action: "markRead" }),
        });
      } catch (err) {
        console.error("Failed to mark as read", err);
        // Revert local state on error
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "unread" } : m))
        );
      }
    }
  };

  const confirmDelete = (id: string) => {
    setMessageToDelete(id);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;
    const id = messageToDelete;
    setLoadingAction(id);
    setMessageToDelete(null); // Close warning modal
    try {
      const res = await fetch("/api/admin/contact-messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                      onClick={() => handleOpenMessage(msg)}
                      className={`hover:bg-charcoal/[0.02] transition-colors cursor-pointer ${msg.status === "unread" ? "bg-amber-50/30" : ""}`}
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
                        <div className="max-w-md break-words whitespace-pre-wrap line-clamp-2">
                          {msg.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-charcoal/60 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleString("tr-TR")}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                          onClick={() => confirmDelete(msg.id)}
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

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-charcoal/10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`p-5 hover:bg-charcoal/[0.01] transition-colors cursor-pointer space-y-3 ${
                    msg.status === "unread" ? "bg-amber-50/15" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal/40 font-mono">
                      {new Date(msg.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                    {msg.status === "unread" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                        Yeni
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-400 uppercase tracking-wider">
                        Okundu
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-charcoal text-sm">{msg.name}</div>
                    <div className="text-xs font-semibold text-charcoal/80">{msg.subject || "Konu Belirtilmemiş"}</div>
                    <div className="text-xs text-charcoal/50 line-clamp-2 break-words leading-relaxed">
                      {msg.message}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    {msg.status === "unread" && (
                      <button
                        onClick={() => handleMarkAsRead(msg.id, msg.status)}
                        disabled={loadingAction === msg.id}
                        className="px-3 py-1.5 text-xs font-semibold text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-lg transition-colors"
                      >
                        Okundu İşaretle
                      </button>
                    )}
                    <button
                      onClick={() => confirmDelete(msg.id)}
                      disabled={loadingAction === msg.id}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Message View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedMessage(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transform transition-all p-6 text-charcoal">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4 mb-4">
              <div>
                <span className="text-xs text-charcoal/40 font-mono">
                  {new Date(selectedMessage.createdAt).toLocaleString("tr-TR")}
                </span>
                <h3 className="text-lg font-bold font-playfair mt-1 text-charcoal">{selectedMessage.subject || "Konu Belirtilmemiş"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Gönderen</div>
                <div className="font-semibold text-charcoal text-sm mt-0.5">{selectedMessage.name}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Mesaj</div>
                <div className="text-charcoal/80 text-sm mt-1.5 whitespace-pre-wrap leading-relaxed max-h-[250px] overflow-y-auto pr-2">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-charcoal/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  confirmDelete(selectedMessage.id);
                }}
                className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                Sil
              </button>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-6 py-2 text-sm font-semibold bg-[#C9A84C] text-white hover:bg-[#b0903b] rounded-xl transition-colors shadow-lg shadow-[#C9A84C]/15"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Warning Confirm Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMessageToDelete(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden transform transition-all text-center p-6 text-charcoal">
            <div className="w-16 h-16 bg-red-150 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-playfair text-charcoal mb-2">Mesajı Sil</h3>
            <p className="text-charcoal/60 text-sm mb-6">
              Bu mesajı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-charcoal/10 font-semibold text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal transition-all"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
