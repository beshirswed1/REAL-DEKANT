"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from "react-icons/fi";

interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  detailedAddress: string;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultIndex, setDefaultIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setAddresses(data.savedAddresses || []);
        setDefaultIndex(data.defaultAddressIndex ?? -1);
      }
    } catch (error) {
      console.error("Error fetching addresses", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchAddresses();
  }, [user, fetchAddresses]);



  const saveToFirestore = async (newAddresses: Address[], newDefaultIndex: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        savedAddresses: newAddresses,
        defaultAddressIndex: newDefaultIndex,
      });
      setAddresses(newAddresses);
      setDefaultIndex(newDefaultIndex);
    } catch (error) {
      console.error("Error updating addresses", error);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      setTitle(address.title);
      setFullName(address.fullName);
      setPhone(address.phone);
      setCity(address.city);
      setDistrict(address.district);
      setDetailedAddress(address.detailedAddress);
    } else {
      setEditingId(null);
      setTitle("");
      setFullName("");
      setPhone("");
      setCity("");
      setDistrict("");
      setDetailedAddress("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: Address = {
      id: editingId || Date.now().toString(),
      title, fullName, phone, city, district, detailedAddress
    };

    const newAddresses = [...addresses];
    let newDefaultIdx = defaultIndex;

    if (editingId) {
      const idx = newAddresses.findIndex(a => a.id === editingId);
      if (idx !== -1) {
        newAddresses[idx] = newAddress;
      }
    } else {
      newAddresses.push(newAddress);
      if (newAddresses.length === 1) {
        newDefaultIdx = 0; // First address is default
      }
    }

    await saveToFirestore(newAddresses, newDefaultIdx);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    
    const idx = addresses.findIndex(a => a.id === id);
    if (idx === -1) return;

    const newAddresses = addresses.filter((a) => a.id !== id);
    let newDefaultIdx = defaultIndex;
    
    if (defaultIndex === idx) {
      newDefaultIdx = newAddresses.length > 0 ? 0 : -1;
    } else if (defaultIndex > idx) {
      newDefaultIdx -= 1;
    }

    await saveToFirestore(newAddresses, newDefaultIdx);
  };

  const handleSetDefault = async (idx: number) => {
    await saveToFirestore(addresses, idx);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-1">Adreslerim</h2>
          <p className="text-sm text-gray-500">Teslimat ve fatura adreslerinizi buradan yönetebilirsiniz.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors"
        >
          <FiPlus />
          <span>Yeni Adres Ekle</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
            <FiMapPin className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-charcoal mb-1">Kayıtlı Adresiniz Yok</h3>
          <p className="text-gray-500 text-sm mb-4">Siparişlerinizi daha hızlı tamamlamak için adres ekleyin.</p>
          <button 
            onClick={() => handleOpenModal()}
            className="text-gold-primary font-medium hover:underline"
          >
            Hemen Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address, idx) => {
            const isDefault = idx === defaultIndex;
            return (
              <div key={address.id} className={`p-5 rounded-xl border relative transition-colors ${
                isDefault ? "border-gold-primary bg-gold-primary/5" : "border-gray-200 bg-white hover:border-gold-primary/50"
              }`}>
                {isDefault && (
                  <span className="absolute top-4 right-4 text-xs font-medium bg-gold-primary text-white px-2 py-1 rounded">
                    Varsayılan
                  </span>
                )}
                <div className="mb-3">
                  <h3 className="font-semibold text-charcoal flex items-center gap-2">
                    {address.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium mt-1">{address.fullName}</p>
                </div>
                
                <div className="text-sm text-gray-500 space-y-1 mb-6 line-clamp-3 h-16">
                  <p>{address.detailedAddress}</p>
                  <p>{address.district} / {address.city}</p>
                  <p>{address.phone}</p>
                </div>

                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100">
                  {!isDefault && (
                    <button 
                      onClick={() => handleSetDefault(idx)}
                      className="text-sm font-medium text-gold-primary hover:text-charcoal transition-colors"
                    >
                      Varsayılan Yap
                    </button>
                  )}
                  <div className="flex-1"></div>
                  <button 
                    onClick={() => handleOpenModal(address)}
                    className="p-2 text-gray-400 hover:text-charcoal transition-colors"
                    aria-label="Düzenle"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Sil"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-charcoal font-playfair">
                {editingId ? "Adresi Düzenle" : "Yeni Adres Ekle"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres Başlığı (Ev, İş vb.)</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gold-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                  <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gold-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gold-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
                    <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gold-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                    <input required type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gold-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
                  <textarea required rows={3} value={detailedAddress} onChange={e => setDetailedAddress(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gold-primary outline-none resize-none"></textarea>
                </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-charcoal bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors">İptal</button>
                <button type="submit" className="flex-1 py-3 text-white bg-charcoal rounded-lg font-medium hover:bg-charcoal/90 transition-colors">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
