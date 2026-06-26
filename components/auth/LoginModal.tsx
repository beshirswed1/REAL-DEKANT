"use client";

import { useState, useEffect } from "react";
import { FiX, FiMail, FiLock, FiUser } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAppDispatch, useAppSelector } from "@/store";
import { openLoginModal, closeLoginModal, selectIsLoginModalOpen } from "@/store/slices/uiSlice";
import { signInWithGoogle, signInWithEmail, registerWithEmail, handleGoogleRedirectResult } from "@/lib/firebase/auth";
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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  // Handle Google redirect result (when popup was blocked and redirect was used)
  useEffect(() => {
    handleGoogleRedirectResult()
      .then((result) => {
        if (result?.user) {
          // Set cookie immediately to prevent middleware redirect race conditions
          document.cookie = `rd_auth=true; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
          router.push("/account");
        }
      })
      .catch(() => {
        // Silently ignore — user may not have come from a redirect
      });
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("login=true")) {
      dispatch(openLoginModal());
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [dispatch]);

  // Load lockout state from localStorage on mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem("failedLoginAttempts");
    const storedLockout = localStorage.getItem("loginLockoutUntil");
    
    if (storedAttempts) setFailedAttempts(parseInt(storedAttempts, 10));
    if (storedLockout) setLockoutUntil(parseInt(storedLockout, 10));
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(closeLoginModal());
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setIsLogin(true);
  };

  const handleFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    localStorage.setItem("failedLoginAttempts", newAttempts.toString());

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const unlockTime = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutUntil(unlockTime);
      localStorage.setItem("loginLockoutUntil", unlockTime.toString());
      setError("Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.");
    }
  };

  const resetLockout = () => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    localStorage.removeItem("failedLoginAttempts");
    localStorage.removeItem("loginLockoutUntil");
  };

  const validateInputs = () => {
    if (!isLogin && name.trim().length < 3) {
      setError("Ad Soyad en az 3 karakter olmalıdır.");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Geçerli bir e-posta adresi giriniz.");
      return false;
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return false;
    }

    if (!isLogin) {
      // Strong password requirement for registration
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumbers = /\d/.test(password);
      if (!hasUpperCase || !hasNumbers) {
        setError("Şifre en az bir büyük harf ve bir rakam içermelidir.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
      setError(`Çok fazla başarısız deneme. Lütfen ${remainingMinutes} dakika sonra tekrar deneyin.`);
      return;
    }

    if (lockoutUntil && Date.now() >= lockoutUntil) {
      resetLockout(); // Lockout expired
    }

    if (!validateInputs()) return;

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      // Set cookie immediately to prevent middleware redirect race conditions
      document.cookie = `rd_auth=true; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
      resetLockout();
      handleClose();
      router.push("/account");
    } catch (err: unknown) {
      if (isLogin) {
        handleFailedAttempt();
      }
      
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/too-many-requests') {
        setError("Çok fazla başarısız giriş denemesi. Hesap veya IP geçici olarak engellendi. Lütfen daha sonra tekrar deneyin.");
      } else if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        setError("E-posta veya şifre hatalı.");
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        setError("Bu e-posta adresi zaten kullanımda.");
      } else {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      // If result is returned, popup succeeded — redirect flow won't return here
      if (result) {
        // Set cookie immediately to prevent middleware redirect race conditions
        document.cookie = `rd_auth=true; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        handleClose();
        router.push("/account");
      }
      // If signInWithRedirect was called, the page will navigate away
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/popup-blocked") {
        // Redirect is happening, don't show error
        return;
      }
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

        <div className="p-5 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-playfair font-bold text-charcoal mb-2">
              {isLogin ? "Hoş Geldiniz" : "Hesap Oluşturun"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {isLogin ? "Hesabınıza giriş yaparak devam edin." : "Aramıza katılın ve avantajlardan yararlanın."}
            </p>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 bg-red-50 text-red-600 text-xs sm:text-sm rounded-lg border border-red-100">
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
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors outline-none text-sm"
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
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors outline-none text-sm"
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
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
              className="w-full py-2.5 sm:py-3 bg-charcoal text-white rounded-lg font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50 text-sm tracking-wider uppercase font-semibold"
            >
              {loading ? "Bekleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>

          <div className="mt-5 mb-5 flex items-center justify-center space-x-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">veya</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 sm:py-3 flex items-center justify-center gap-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
          >
            <FcGoogle className="w-5 h-5" />
            Google ile devam et
          </button>

          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
            {isLogin ? "Hesabınız yok mu?" : "Zaten bir hesabınız var mı?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-[#C9A84C] font-semibold hover:underline"
            >
              {isLogin ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
