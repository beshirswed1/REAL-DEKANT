"use client";

import { useState, useEffect } from "react";
import { FiX, FiMail, FiLock, FiUser } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAppDispatch, useAppSelector } from "@/store";
import { openLoginModal, closeLoginModal, selectIsLoginModalOpen } from "@/store/slices/uiSlice";
import { signInWithGoogle, signInWithEmail, registerWithEmail } from "@/lib/firebase/auth";
// import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function LoginModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsLoginModalOpen);
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("login=true")) {
      dispatch(openLoginModal());
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [dispatch]);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(closeLoginModal());
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setIsLogin(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
        // Note: Firebase auth automatically signs in after register
      }
      handleClose();
      router.push("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      handleClose();
      router.push("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google ile giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-playfair font-bold text-charcoal mb-2">
              {isLogin ? "Hoş Geldiniz" : "Hesap Oluşturun"}
            </h2>
            <p className="text-sm text-gray-500">
              {isLogin ? "Hesabınıza giriş yaparak devam edin." : "Aramıza katılın ve avantajlardan yararlanın."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-colors outline-none"
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta Adresi"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-colors outline-none"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifre"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-colors outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-charcoal text-white rounded-lg font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Bekleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>

          <div className="mt-6 mb-6 flex items-center justify-center space-x-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">veya</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 flex items-center justify-center gap-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FcGoogle className="w-5 h-5" />
            Google ile devam et
          </button>

          <div className="mt-8 text-center text-sm text-gray-500">
            {isLogin ? "Hesabınız yok mu?" : "Zaten bir hesabınız var mı?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-gold-primary font-medium hover:underline"
            >
              {isLogin ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
