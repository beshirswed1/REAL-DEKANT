"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import { FiEdit3, FiCheck, FiX, FiMail, FiCalendar, FiShield } from "react-icons/fi";

export default function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [joinDate, setJoinDate] = useState<string | null>(null);

  // Sync displayName when user changes
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  // Fetch join date from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const fetchJoinDate = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.createdAt?.toDate) {
            setJoinDate(data.createdAt.toDate().toLocaleDateString("tr-TR", {
              day: "numeric", month: "long", year: "numeric"
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching join date:", err);
      }
    };
    fetchJoinDate();
  }, [user?.uid]);

  const handleSaveName = async () => {
    if (!auth.currentUser || !user) return;
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setMessage({ type: "error", text: "Ad Soyad boş olamaz." });
      return;
    }
    if (trimmedName === user.displayName) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { displayName: trimmedName });
      
      // Update Firestore user document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { displayName: trimmedName });

      // Update Redux store
      dispatch(setUser({ ...user, displayName: trimmedName }));

      setMessage({ type: "success", text: "Adınız başarıyla güncellendi." });
      setIsEditing(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setMessage({ type: "error", text: err.message || "Bir hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || "");
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  if (!user) return null;

  const initials = (user.displayName || user.email || "U")
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-playfair font-bold text-charcoal mb-1">Profil Bilgileri</h2>
        <p className="text-sm text-gray-500">Kişisel bilgilerinizi buradan görüntüleyip düzenleyebilirsiniz.</p>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${
          message.type === "error" 
            ? "bg-red-50 text-red-600 border border-red-100" 
            : "bg-green-50 text-green-600 border border-green-100"
        }`}>
          {message.type === "success" ? <FiCheck size={16} /> : <FiX size={16} />}
          {message.text}
        </div>
      )}

      {/* Profile Avatar Card */}
      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center text-white text-2xl font-playfair font-bold shadow-md">
          {initials}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-playfair font-bold text-charcoal">
            {user.displayName || "İsimsiz Kullanıcı"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          {joinDate && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
              <FiCalendar size={12} />
              Üyelik: {joinDate}
            </p>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Display Name — Editable */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            Ad Soyad
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#C9A84C] hover:text-[#8B6914] transition-colors p-1 rounded"
                aria-label="Adı düzenle"
              >
                <FiEdit3 size={14} />
              </button>
            )}
          </label>
          
          {isEditing ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-[#C9A84C]/40 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] transition-all outline-none"
                placeholder="Adınızı ve soyadınızı girin"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <button
                onClick={handleSaveName}
                disabled={loading}
                className="p-3 bg-[#C9A84C] text-white rounded-lg hover:bg-[#8B6914] transition-colors disabled:opacity-50"
                aria-label="Kaydet"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheck size={18} />
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="İptal"
              >
                <FiX size={18} />
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-charcoal">
              {user.displayName || <span className="text-gray-400 italic">Henüz isim eklenmemiş</span>}
            </div>
          )}
        </div>

        {/* Email — Read Only */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FiMail size={14} className="text-gray-400" />
            E-posta Adresi
          </label>
          <input
            type="email"
            readOnly
            value={user.email || ""}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed outline-none"
          />
          <p className="text-xs text-gray-400 mt-1.5">E-posta adresi değiştirilemez.</p>
        </div>

        {/* Account Info */}
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
          <h4 className="text-sm font-semibold text-charcoal flex items-center gap-2">
            <FiShield size={14} className="text-[#C9A84C]" />
            Hesap Bilgileri
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <span className="text-gray-500">Hesap Türü</span>
              <span className="font-medium text-charcoal capitalize">{user.role === "admin" ? "Yönetici" : "Müşteri"}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <span className="text-gray-500">Durum</span>
              <span className="flex items-center gap-1.5 font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Aktif
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
