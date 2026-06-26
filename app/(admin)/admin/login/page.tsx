"use client";

import { useState } from "react";
import { signInWithEmail } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ title: string; cause: string; solution: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const parseFirebaseError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    const result = {
      title: "Giriş Başarısız",
      cause: "Beklenmeyen bir hata oluştu veya sunucuya ulaşılamıyor.",
      solution: "Lütfen bağlantınızı kontrol edip tekrar deneyin.",
    };

    if (message.includes("auth/invalid-credential") || message.includes("auth/user-not-found") || message.includes("auth/wrong-password")) {
      result.cause = "E-posta adresi veya şifre hatalı girildi.";
      result.solution = "Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
    } else if (message.includes("auth/too-many-requests")) {
      result.title = "Hesap Kilitlendi";
      result.cause = "Üst üste çok fazla hatalı giriş denemesi yapıldı.";
      result.solution = "Güvenlik nedeniyle hesabınız geçici olarak kilitlendi. Lütfen daha sonra tekrar deneyin.";
    } else if (message.includes("auth/network-request-failed")) {
      result.title = "Bağlantı Hatası";
      result.cause = "Sunucu ile iletişim kurulamadı.";
      result.solution = "İnternet bağlantınızı kontrol edip sayfayı yenileyin.";
    } else if (message.includes("Yönetici doğrulaması başarısız") || message.includes("Bu hesap yönetici değil")) {
      result.title = "Yetkisiz Erişim";
      result.cause = "Bu hesap yönetici yetkilerine sahip değil.";
      result.solution = "Lütfen yetkili bir yönetici hesabıyla giriş yapın.";
    }

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      await signInWithEmail(email, password);

      // 2. Get ID token
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) throw new Error("Token alınamadı");

      // 3. Verify admin claim server-side & set cookie
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Yönetici doğrulaması başarısız");
      }

      // 4. Redirect to admin dashboard (hard navigation to re-render layout)
      window.location.href = "/admin";
    } catch (err: unknown) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Logo */}
        <div className="admin-login-logo">
          <div className="admin-login-logo-text">REAL DEKANT</div>
          <div className="admin-login-logo-sub">Yönetim Paneli</div>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-login-error-card">
            <div className="error-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="error-content">
              <h4>{error.title}</h4>
              <p className="cause">{error.cause}</p>
              <p className="solution">{error.solution}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="admin-email">E-posta</label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@realdekant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">Şifre</label>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="admin-login-spinner" />
            ) : (
              "Giriş Yap"
            )}
          </button>

        </form>

        <p className="admin-login-footer">
          Sadece yetkili yöneticiler giriş yapabilir.
        </p>
      </div>

      <style jsx>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          background-image: 
            radial-gradient(ellipse at 20% 50%, rgba(212, 175, 55, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(212, 175, 55, 0.04) 0%, transparent 50%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 24px;
        }

        .admin-login-card {
          width: 100%;
          max-width: 400px;
          background: #111;
          border: 1px solid #222;
          border-radius: 16px;
          padding: 48px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .admin-login-logo {
          text-align: center;
          margin-bottom: 40px;
        }

        .admin-login-logo-text {
          font-size: 28px;
          font-weight: 700;
          color: #D4AF37;
          letter-spacing: 0.2em;
          font-family: 'Playfair Display', serif;
        }

        .admin-login-logo-sub {
          font-size: 12px;
          color: #888;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 8px;
        }

        .admin-login-error-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(220, 38, 38, 0.08);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: 12px;
          margin-bottom: 24px;
          animation: slideDown 0.3s ease-out forwards;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .error-icon {
          flex-shrink: 0;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 8px;
          border-radius: 50%;
          display: flex;
        }

        .error-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .error-content h4 {
          margin: 0;
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
        }

        .error-content p {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
        }

        .error-content .cause {
          color: #ddd;
        }

        .error-content .solution {
          color: #999;
          font-style: italic;
        }

        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .admin-login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-login-field label {
          font-size: 13px;
          font-weight: 500;
          color: #999;
          letter-spacing: 0.05em;
        }

        .admin-login-field input {
          padding: 12px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #eee;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .admin-login-field input:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .admin-login-field input::placeholder {
          color: #555;
        }

        .admin-login-btn {
          margin-top: 8px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #D4AF37 0%, #B8960C 100%);
          border: none;
          border-radius: 8px;
          color: #0a0a0a;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
        }

        .admin-login-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .admin-login-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .admin-login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-login-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(10, 10, 10, 0.3);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .admin-login-footer {
          text-align: center;
          font-size: 12px;
          color: #555;
          margin-top: 24px;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
