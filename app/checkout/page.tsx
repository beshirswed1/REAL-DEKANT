"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/config";
import { signInAnonymously } from "firebase/auth";
import { FiCheck, FiChevronRight, FiDollarSign, FiMail, FiMapPin, FiPhone, FiShoppingBag, FiUser, FiInfo } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import { getOptimizedImage } from "@/lib/imgbb/config";

// ─── Turkish Cities List ──────────────────────────────────────────────────────
const TURKISH_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort((a, b) => a.localeCompare(b, "tr"));

// ─── Localized Translations Dictionary ────────────────────────────────────────
const LOCALES = {
  tr: {
    title: "Güvenli Ödeme",
    delivery: "Teslimat",
    payment: "Ödeme",
    confirmation: "Onay",
    deliveryInfo: "Teslimat Bilgileri",
    fullName: "Ad Soyad",
    phone: "Telefon",
    email: "E-posta",
    city: "İl",
    district: "İlçe",
    address: "Adres",
    useSaved: "Kayıtlı Adresimi Kullan",
    guestCheckout: "Misafir Olarak Devam Et",
    nextButton: "Ödeme Yöntemine Geç",
    backButton: "Geri",
    payCreditCard: "Kredi Kartı",
    payBank: "Banka Havalesi / EFT",
    payCod: "Kapıda Ödeme",
    cardHolder: "Kart Sahibi",
    cardNumber: "Kart Numarası",
    expiry: "Son Kullanma (AA/YY)",
    cvc: "CVC",
    iyzicoSecure: "iyzico ile Güvenli Ödeme",
    bankDetails: "Banka Hesap Bilgileri",
    bankName: "Banka Adı",
    iban: "IBAN",
    receiver: "Alıcı",
    reference: "Açıklama / Referans",
    codNote: "Siparişinizi teslim alırken kapıda nakit veya kredi kartı ile ödeyebilirsiniz.",
    codExtraFee: "Kapıda ödeme hizmet bedeli (+ ₺40.00) toplam tutara eklenir.",
    completeOrder: "Ödemeyi Yap ve Siparişi Tamamla",
    orderSummary: "Sipariş Özeti",
    subtotal: "Ara Toplam",
    discount: "İndirim",
    shipping: "Kargo Ücreti",
    free: "Ücretsiz",
    codFeeLabel: "Kapıda Ödeme Bedeli",
    total: "Toplam",
    successTitle: "Siparişiniz İçin Teşekkür Ederiz!",
    successSubtitle: "Siparişiniz başarıyla alındı ve onaylandı. E-posta adresinize bir onay gönderilmiştir.",
    orderNo: "Sipariş Numarası",
    itemsRecap: "Satın Alınan Ürünler",
    addressRecap: "Teslimat Adresi",
    goToOrders: "Siparişlerime Git",
    continueShopping: "Alışverişe Devam Et",
    requiredField: "Bu alan zorunludur.",
    invalidEmail: "Geçersiz e-posta adresi.",
    invalidPhone: "Geçersiz telefon numarası (en az 10 haneli).",
    processing: "İşleniyor...",
    selectSaved: "Kayıtlı Adresleriniz",
    closeBtn: "Kapat",
    smsVerification: "iyzico 3D Secure Doğrulama",
    smsSent: "Lütfen telefonunuza gönderilen 6 haneli doğrulama kodunu girin.",
    smsPlaceholder: "Doğrulama Kodu",
    smsVerifyBtn: "Doğrula ve Siparişi Tamamla",
    smsCodeError: "Doğrulama kodu geçersiz. Lütfen 123456 deneyin.",
    smsTimer: "Kalan Süre",
    emptyCartTitle: "Sepetiniz Boş",
    emptyCartDesc: "Ödeme yapabilmek için sepetinizde ürün bulunmalıdır.",
    payWhatsapp: "WhatsApp ile Sipariş",
    whatsappApology: "Çevrimiçi kredi kartı ödeme sistemimiz geçici olarak bakım aşamasındadır. Siparişinizi tamamlamak ve ödeme/kargo detaylarını netleştirmek için lütfen WhatsApp üzerinden devam edin.",
    whatsappBtn: "WhatsApp'tan Siparişi Tamamla",
    whatsappSuccessSubtitle: "Siparişiniz kaydedildi! Siparişinizi onaylamak ve detayları iletmek için lütfen aşağıdaki butona tıklayarak WhatsApp üzerinden bizimle iletişime geçin.",
  },
  en: {
    title: "Secure Checkout",
    delivery: "Delivery",
    payment: "Payment",
    confirmation: "Confirmation",
    deliveryInfo: "Delivery Information",
    fullName: "Full Name",
    phone: "Phone Number",
    email: "E-mail",
    city: "City",
    district: "District",
    address: "Address",
    useSaved: "Use My Saved Address",
    guestCheckout: "Continue as Guest",
    nextButton: "Proceed to Payment",
    backButton: "Back",
    payCreditCard: "Credit Card",
    payBank: "Bank Transfer",
    payCod: "Cash on Delivery",
    cardHolder: "Cardholder Name",
    cardNumber: "Card Number",
    expiry: "Expiry (MM/YY)",
    cvc: "CVC",
    iyzicoSecure: "Secure Payment via iyzico",
    bankDetails: "Bank Account Details",
    bankName: "Bank Name",
    iban: "IBAN",
    receiver: "Receiver",
    reference: "Description / Reference",
    codNote: "You can pay with cash or credit card at your doorstep upon delivery.",
    codExtraFee: "Cash on delivery service fee (+ ₺40.00) is added to the total.",
    completeOrder: "Complete Order & Pay",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping Fee",
    free: "Free",
    codFeeLabel: "COD Service Fee",
    total: "Total",
    successTitle: "Thank You for Your Order!",
    successSubtitle: "Your order has been received and confirmed. A confirmation has been sent to your email address.",
    orderNo: "Order Number",
    itemsRecap: "Ordered Items",
    addressRecap: "Delivery Address",
    goToOrders: "Go to My Orders",
    continueShopping: "Continue Shopping",
    requiredField: "This field is required.",
    invalidEmail: "Invalid e-mail address.",
    invalidPhone: "Invalid phone number (minimum 10 digits).",
    processing: "Processing...",
    selectSaved: "Your Saved Addresses",
    closeBtn: "Close",
    smsVerification: "iyzico 3D Secure Verification",
    smsSent: "Please enter the 6-digit verification code sent to your phone.",
    smsPlaceholder: "Verification Code",
    smsVerifyBtn: "Verify and Complete Order",
    smsCodeError: "Verification code is invalid. Please try 123456.",
    smsTimer: "Remaining Time",
    emptyCartTitle: "Your Cart is Empty",
    emptyCartDesc: "You must have items in your cart to proceed with checkout.",
    payWhatsapp: "Order via WhatsApp",
    whatsappApology: "Our online credit card payment gateway is currently under maintenance. Please proceed via WhatsApp to complete your order and confirm payment/shipping details.",
    whatsappBtn: "Complete Order via WhatsApp",
    whatsappSuccessSubtitle: "Order saved! To confirm your order and send details, please click the button below to contact us via WhatsApp.",
  },
  ar: {
    title: "الدفع الآمن",
    delivery: "التوصيل",
    payment: "الدفع",
    confirmation: "التأكيد",
    deliveryInfo: "معلومات التوصيل",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    city: "المدينة (في تركيا)",
    district: "المنطقة / الحي",
    address: "العنوان بالكامل",
    useSaved: "استخدام عنواني المحفوظ",
    guestCheckout: "المتابعة كزائر",
    nextButton: "الانتقال إلى خيار الدفع",
    backButton: "رجوع",
    payCreditCard: "بطاقة الائتمان",
    payBank: "تحويل بنكي / EFT",
    payCod: "الدفع عند الاستلام",
    cardHolder: "اسم صاحب البطاقة",
    cardNumber: "رقم البطاقة",
    expiry: "تاريخ الانتهاء (MM/YY)",
    cvc: "رمز الأمان (CVC)",
    iyzicoSecure: "دفع آمن بواسطة iyzico",
    bankDetails: "تفاصيل الحساب البنكي",
    bankName: "اسم البنك",
    iban: "رقم الآيبان (IBAN)",
    receiver: "المستلم",
    reference: "الوصف / المرجع",
    codNote: "يمكنك الدفع نقدًا أو بالبطاقة عند باب منزلك عند استلام الطلب.",
    codExtraFee: "تتم إضافة رسوم الدفع عند الاستلام (+ ₺40.00) إلى المجموع الكلي.",
    completeOrder: "تأكيد وإتمام الطلب",
    orderSummary: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    discount: "الخصم",
    shipping: "رسوم الشحن",
    free: "مجاني",
    codFeeLabel: "رسوم الدفع عند الاستلام",
    total: "المجموع الكلي",
    successTitle: "شكراً لطلبك!",
    successSubtitle: "تم استلام وتأكيد طلبك بنجاح. تم إرسال رسالة تأكيد إلى بريدك الإلكتروني.",
    orderNo: "رقم الطلب",
    itemsRecap: "المنتجات المطلوبة",
    addressRecap: "عنوان التوصيل",
    goToOrders: "الذهاب إلى طلباتي",
    continueShopping: "مواصلة التسوق",
    requiredField: "هذا الحقل مطلوب.",
    invalidEmail: "البريد الإلكتروني غير صالح.",
    invalidPhone: "رقم الهاتف غير صالح (10 أرقام على الأقل).",
    processing: "جاري المعالجة...",
    selectSaved: "عناوينك المحفوظة",
    closeBtn: "إغلاق",
    smsVerification: "تحقق iyzico 3D Secure الآمن",
    smsSent: "يرجى إدخال رمز التحقق المكون من 6 أرقام والمرسل إلى هاتفك.",
    smsPlaceholder: "رمز التحقق",
    smsVerifyBtn: "تحقق وإتمام الطلب",
    smsCodeError: "رمز التحقق غير صالح. يرجى تجربة 123456.",
    smsTimer: "الوقت المتبقي",
    emptyCartTitle: "سلتك فارغة",
    emptyCartDesc: "يجب أن تحتوي سلتك على منتجات لتتمكن من إتمام الدفع.",
    payWhatsapp: "الدفع وإتمام الطلب عبر واتساب",
    whatsappApology: "نعتذر منكم، بوابة الدفع الإلكتروني بالبطاقة الائتمانية قيد التحديث حالياً. يرجى إتمام الطلب وتأكيده عبر الواتساب لتأكيد خيارات الشحن والدفع.",
    whatsappBtn: "إتمام الطلب عبر واتساب",
    whatsappSuccessSubtitle: "تم تسجيل طلبك بنجاح! لتأكيد الطلب وإرسال التفاصيل، يرجى الضغط على الزر أدناه للتواصل معنا عبر واتساب.",
  },
};

interface Address {
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const locale: string = "tr";
  const t = LOCALES.tr;

  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, total: cartTotal, coupon, shippingFee, codServiceFee, clear, removeCoupon } = useCart();

  // Checkout Client State
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "bank_transfer" | "cod">("whatsapp");
  const [whatsappNumber, setWhatsappNumber] = useState("905000000000");
  const [orderRecap, setOrderRecapPreserved] = useState<{
    items: typeof items;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
  } | null>(null);

  // Fetch site settings to get WhatsApp number dynamically
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.contactWhatsapp) {
          const cleaned = data.contactWhatsapp.replace(/\s+/g, "").replace(/\+/g, "");
          setWhatsappNumber(cleaned);
        }
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Guards to prevent duplicate submissions
  const submittingRef = useRef(false);
  const orderSubmittedRef = useRef(false);

  // iyzico Checkout Form State (commented out to avoid eslint errors)
  // const [iyzicoHtml, setIyzicoHtml] = useState<string | null>(null);
  // const [loadingPaymentForm, setLoadingPaymentForm] = useState(false);

  // Calculate dynamic fees
  const codFee = paymentMethod === "cod" ? codServiceFee : 0;
  const finalDiscount = Math.max(0, subtotal - cartTotal + shippingFee);
  const finalTotal = Math.max(0, subtotal - finalDiscount + shippingFee + codFee);
  const codExtraFeeText = t.codExtraFee.replace("40.00", codServiceFee.toFixed(2));

  // Zod form validation for delivery
  const deliverySchema = z.object({
    name: z.string().min(3, t.requiredField),
    phone: z.string().min(10, t.invalidPhone),
    email: z.string().email(t.invalidEmail),
    city: z.string().min(1, t.requiredField),
    district: z.string().min(1, t.requiredField),
    address: z.string().min(5, t.requiredField),
  });

  type DeliveryFormData = z.infer<typeof deliverySchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      district: "",
      address: "",
    },
  });

  const watchData = watch();

  // Fetch saved user addresses from Firestore on auth change
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      const fetchAddresses = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data?.addresses && Array.isArray(data.addresses)) {
              setSavedAddresses(data.addresses);
              // Prepopulate with default address
              const defaultAddr = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0];
              if (defaultAddr) {
                setValue("name", defaultAddr.name || "");
                setValue("phone", defaultAddr.phone || "");
                setValue("email", user.email || "");
                setValue("city", defaultAddr.city || "");
                setValue("district", defaultAddr.district || "");
                setValue("address", defaultAddr.address || "");
              }
            }
          }
        } catch (err) {
          console.error("Error fetching saved addresses:", err);
        }
      };
      fetchAddresses();
    } else {
      setSavedAddresses([]);
    }
  }, [isAuthenticated, user?.uid, user?.email, setValue]);

  // Populate form with selected address
  const handleSelectAddress = (addr: Address) => {
    setValue("name", addr.name);
    setValue("phone", addr.phone);
    setValue("city", addr.city);
    setValue("district", addr.district);
    setValue("address", addr.address);
    setShowAddressSelector(false);
  };

  // Handle URL redirects from iyzico callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderIdParam = params.get("orderId");
    const errorParam = params.get("error");

    if (status === "success" && orderIdParam) {
      setOrderId(orderIdParam);
      clear();
      setStep(3);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "fail") {
      setServerError(errorParam || "Ödeme işlemi başarısız oldu.");
      setStep(2);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [clear]);

  // Background coupon validation on checkout mount
  useEffect(() => {
    if (coupon) {
      let isMounted = true;
      fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code, cartItems: items, locale }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && !data.valid) {
            removeCoupon();
            setServerError(data.message || "Kupon süresi doldu veya deaktif edildi.");
          }
        })
        .catch(() => {});
        
      return () => { isMounted = false; };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon?.code]);



  // Next and Back Wizard step controls
  const onDeliverySubmit = () => {
    setStep(2);
    setServerError(null);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };



  // Submit Order Creation to Server API
  const submitOrderCreation = async () => {
    // Prevent duplicate submissions using ref (synchronous check)
    if (submittingRef.current || orderSubmittedRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setServerError(null);

    // Preserve checkout summary information before clearing the cart
    const currentRecap = {
      items: [...items],
      subtotal,
      shippingFee,
      discount: finalDiscount,
      total: finalTotal,
    };
    setOrderRecapPreserved(currentRecap);

    const triggerWhatsappRedirect = (finalOrderId: string) => {
      const formattedItems = currentRecap.items
        .map((item) => `• ${item.brand} - ${item.perfumeName} (${item.size}) - ${item.qty} adet - ₺${item.price * item.qty}`)
        .join("\n");

      const message = `*Real Dekant - Yeni Sipariş* 🌸\n` +
        `--------------------------------------\n` +
        `*Sipariş Numarası:* ${finalOrderId}\n` +
        `*Müşteri Adı:* ${watchData.name}\n` +
        `*Telefon:* ${watchData.phone}\n` +
        `*Adres:* ${watchData.address}, ${watchData.district} / ${watchData.city}\n` +
        `--------------------------------------\n` +
        `*Ürünler:*\n` +
        `${formattedItems}\n` +
        `--------------------------------------\n` +
        `*Ara Toplam:* ₺${currentRecap.subtotal}\n` +
        (currentRecap.discount > 0 ? `*İndirim:* -₺${currentRecap.discount}\n` : "") +
        `*Kargo Ücreti:* ₺${currentRecap.shippingFee}\n` +
        (paymentMethod === "cod" ? `*Kapıda Ödeme Hizmet Bedeli:* ₺${codServiceFee}\n` : "") +
        `*Toplam Tutar:* ₺${currentRecap.total}\n` +
        `--------------------------------------\n` +
        `Siparişim hakkında bilgi almak ve ödememi tamamlamak istiyorum.`;

      const encoded = encodeURIComponent(message);
      const url = `https://wa.me/${whatsappNumber}?text=${encoded}`;
      try {
        window.open(url, "_blank");
      } catch (e) {
        console.warn("Popup blocked, user can click the button on Step 3.", e);
      }
    };

    try {
      const payload = {
        customer: watchData,
        items,
        subtotal,
        shippingFee,
        discount: finalDiscount,
        total: finalTotal,
        paymentMethod,
        couponCode: coupon?.code || null,
        userId: user?.uid || null,
        locale,
      };

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        orderSubmittedRef.current = true;
        setOrderId(data.orderId);
        clear(); // Clear local and redux cart
        setStep(3); // Go to step 3 (Confirmation)
        if (paymentMethod === "whatsapp") {
          triggerWhatsappRedirect(data.orderId);
        }
        return;
      }

      if (data.fallbackToClient) {
        console.log("Admin credentials missing on server. Falling back to client-side Firestore write.");
        
        let finalUserId = user?.uid || null;
        if (!finalUserId) {
          try {
            const anonCred = await signInAnonymously(auth);
            finalUserId = anonCred.user.uid;
          } catch (authErr) {
            console.error("Anonymous auth failed:", authErr);
            setServerError("Misafir girişi yapıلامادى. Lütfen tekrar deneyin veya üye girişi yapın.");
            setIsSubmitting(false);
            return;
          }
        }

        // Generate Order ID
        const date = new Date();
        const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
        const randPart = Math.random().toString(36).toUpperCase().slice(2, 6);
        const clientOrderId = `RD-${datePart}-${randPart}`;

        // 1. Create order document in /orders/{orderId}
        const orderRef = doc(db, "orders", clientOrderId);
        await setDoc(orderRef, {
          orderId: clientOrderId,
          userId: finalUserId,
          createdAt: serverTimestamp(),
          customer: {
            name: watchData.name,
            phone: watchData.phone,
            email: watchData.email,
            city: watchData.city,
            district: watchData.district,
            address: watchData.address,
          },
          items: items.map((item) => ({
            productId: item.productId,
            perfumeName: item.perfumeName,
            brand: item.brand,
            image: item.image,
            size: item.size,
            quantity: item.qty,
            unitPrice: item.price,
          })),
          subtotal,
          shippingFee,
          discount: finalDiscount,
          total: finalTotal,
          paymentMethod,
          paymentStatus: "pending",
          orderStatus: "pending",
          appliedCoupon: coupon?.code || null,
          trackingNumber: null,
          updatedAt: serverTimestamp(),
        });

        // 2. Increment coupon usageCount if coupon code is present
        if (coupon?.code) {
          try {
            const couponRef = doc(db, "coupons", coupon.code.toUpperCase());
            await updateDoc(couponRef, {
              usageCount: increment(1),
              updatedAt: serverTimestamp(),
            });
          } catch (couponErr) {
            console.warn("Coupon usage count update failed:", couponErr);
          }
        }

        // 3. Write mail document in /mail/{orderId} to trigger email extension
        const mailRef = doc(db, "mail", clientOrderId);
        await setDoc(mailRef, {
          to: watchData.email,
          message: {
            subject: `Siparişiniz Alındı - ${clientOrderId}`,
            html: `
              <div style="background-color: #FAF7F0; padding: 40px 20px; font-family: sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EDE5D0; padding: 30px;">
                  <h1 style="color: #D4AF37; font-family: serif; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-top: 0;">Real Dekant</h1>
                  <p>Sayın <strong>${watchData.name}</strong>,</p>
                  <p>Siparişiniz başarıyla alınmıştır. Sipariş numaranız: <strong style="color: #8B6914;">${clientOrderId}</strong></p>
                  <h3>Sipariş Detayı</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                      <tr style="background-color: #EDE5D0;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Ürün</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Boyut</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Adet</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Fiyat</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items
                        .map(
                          (item) => `
                        <tr>
                          <td style="padding: 8px; border: 1px solid #ddd;">${item.brand} - ${item.perfumeName}</td>
                          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.size}</td>
                          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.qty}</td>
                          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₺${item.price}</td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                  <div style="text-align: right; font-weight: bold; line-height: 1.6;">
                    <p>Ara Toplam: ₺${subtotal}</p>
                    ${finalDiscount > 0 ? `<p style="color: green;">İndirim: -₺${finalDiscount}</p>` : ""}
                    <p>Kargo Ücreti: ₺${shippingFee}</p>
                    ${paymentMethod === "cod" ? `<p>Kapıda Ödeme Hizmet Bedeli: ₺${codServiceFee}</p>` : ""}
                    <p style="font-size: 1.2em; color: #8B6914;">Toplam Tutar: ₺${finalTotal}</p>
                  </div>
                </div>
              </div>
            `,
          },
        });

        orderSubmittedRef.current = true;
        setOrderId(clientOrderId);
        clear();
        setStep(3);
        if (paymentMethod === "whatsapp") {
          triggerWhatsappRedirect(clientOrderId);
        }
        return;
      }

      setServerError(data.message || "Sipariş verilirken bir hata oluştu.");
    } catch (error) {
      console.error(error);
      setServerError("Sunucuyla bağlantı kurulamadı. Lütfen internetinizi kontrol edin.");
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  // Handle final checkout submission (for whatsapp, bank transfer & COD)
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || orderSubmittedRef.current) return;
    setServerError(null);
    submitOrderCreation();
  };

  // Cart Empty Check
  if (items.length === 0 && step !== 3) {
    return (
      <div className="bg-cream-light min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white border border-[#C9A84C]/25 p-8 text-center space-y-6 shadow-xl animate-fade-in">
          <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-full flex items-center justify-center text-[#C9A84C] mx-auto">
            <FiShoppingBag size={30} />
          </div>
          <h2 className="font-playfair text-2xl font-bold tracking-wide uppercase text-charcoal">
            {t.emptyCartTitle}
          </h2>
          <p className="font-montserrat text-sm text-charcoal/70">
            {t.emptyCartDesc}
          </p>
          <div className="h-0.5 w-12 bg-[#C9A84C]/45 mx-auto" />
          <Link href="/shop" className="btn-luxury-fill w-full inline-block text-center py-3.5">
            {t.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-light min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        {step !== 3 && (
          <div className="text-center mb-10 space-y-2">
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-wide uppercase text-charcoal">
              {t.title}
            </h1>
            <div className="h-0.5 w-12 bg-[#C9A84C]/45 mx-auto" />
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-between max-w-lg mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-charcoal/15 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-[2px] bg-[#C9A84C] transition-all duration-500 ease-in-out -translate-y-1/2 z-0"
            style={{
              width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
              left: "0%",
            }}
          />

          {/* Circle 1 */}
          <div className="flex flex-col items-center z-10 space-y-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-montserrat text-xs font-bold transition-all duration-500 border ${
                step > 1
                  ? "bg-[#C9A84C] border-[#C9A84C] text-black"
                  : step === 1
                  ? "bg-[#0D0D0D] border-[#0D0D0D] text-white ring-4 ring-[#C9A84C]/25"
                  : "bg-white border-charcoal/15 text-charcoal/50"
              }`}
            >
              {step > 1 ? <FiCheck size={16} /> : "1"}
            </div>
            <span className="font-montserrat text-[10px] tracking-wider font-bold uppercase text-charcoal">
              {t.delivery}
            </span>
          </div>

          {/* Circle 2 */}
          <div className="flex flex-col items-center z-10 space-y-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-montserrat text-xs font-bold transition-all duration-500 border ${
                step > 2
                  ? "bg-[#C9A84C] border-[#C9A84C] text-black"
                  : step === 2
                  ? "bg-[#0D0D0D] border-[#0D0D0D] text-white ring-4 ring-[#C9A84C]/25"
                  : "bg-white border-charcoal/15 text-charcoal/50"
              }`}
            >
              {step > 2 ? <FiCheck size={16} /> : "2"}
            </div>
            <span className="font-montserrat text-[10px] tracking-wider font-bold uppercase text-charcoal">
              {t.payment}
            </span>
          </div>

          {/* Circle 3 */}
          <div className="flex flex-col items-center z-10 space-y-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-montserrat text-xs font-bold transition-all duration-500 border ${
                step === 3
                  ? "bg-[#C9A84C] border-[#C9A84C] text-black ring-4 ring-[#C9A84C]/25"
                  : "bg-white border-charcoal/15 text-charcoal/50"
              }`}
            >
              3
            </div>
            <span className="font-montserrat text-[10px] tracking-wider font-bold uppercase text-charcoal">
              {t.confirmation}
            </span>
          </div>
        </div>

        {/* Server Errors */}
        {serverError && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 border-l-4 border-red-600 p-4 text-red-800 text-sm font-montserrat flex items-center gap-3">
            <FiInfo size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Content Box */}
        {step === 3 ? (
          /* ──────────────── STEP 3: CONFIRMATION ──────────────── */
          <div className="max-w-2xl mx-auto bg-white border border-[#C9A84C]/25 shadow-xl p-8 sm:p-12 text-center space-y-8 animate-fade-in">
            <div className="w-20 h-20 bg-[#C9A84C]/10 rounded-full flex items-center justify-center text-[#C9A84C] mx-auto scale-110 transition-transform duration-700">
              <FiCheck size={40} className="stroke-[3]" />
            </div>

            <div className="space-y-3">
              <h2 className="font-playfair text-3xl font-bold tracking-wide uppercase text-charcoal">
                {t.successTitle}
              </h2>
              <p className="font-montserrat text-sm text-charcoal/70 max-w-md mx-auto leading-relaxed font-medium">
                {paymentMethod === "whatsapp" ? t.whatsappSuccessSubtitle : t.successSubtitle}
              </p>
            </div>

            {paymentMethod === "whatsapp" && (
              <div className="bg-[#FAF7F0] border border-[#25D366]/25 p-6 rounded-sm space-y-4 max-w-md mx-auto my-6 shadow-sm animate-fade-in">
                <p className="font-montserrat text-xs text-charcoal/80 leading-relaxed font-semibold">
                  {locale === "ar"
                    ? "اضغط على الزر أدناه لتأكيد وإتمام الطلب عبر واتساب:"
                    : locale === "en"
                    ? "Click the button below to complete and confirm your order via WhatsApp:"
                    : "Siparişinizi tamamlamak ve onaylamak için lütfen aşağıdaki WhatsApp butonuna tıklayın:"}
                </p>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `*Real Dekant - Yeni Sipariş* 🌸\n` +
                      `--------------------------------------\n` +
                      `*Sipariş Numarası:* ${orderId}\n` +
                      `*Müşteri Adı:* ${watchData.name}\n` +
                      `*Telefon:* ${watchData.phone}\n` +
                      `*Adres:* ${watchData.address}, ${watchData.district} / ${watchData.city}\n` +
                      `--------------------------------------\n` +
                      `*Ürünler:*\n` +
                      (orderRecap?.items || items)
                        .map((item) => `• ${item.brand} - ${item.perfumeName} (${item.size}) - ${item.qty} adet - ₺${item.price * item.qty}`)
                        .join("\n") +
                      `\n--------------------------------------\n` +
                      `*Ara Toplam:* ₺${orderRecap?.subtotal || subtotal}\n` +
                      ((orderRecap?.discount || finalDiscount) > 0 ? `*İndirim:* -₺${orderRecap?.discount || finalDiscount}\n` : "") +
                      `*Kargo Ücreti:* ₺${orderRecap?.shippingFee || shippingFee}\n` +
                      `*Toplam Tutar:* ₺${orderRecap?.total || finalTotal}\n` +
                      `--------------------------------------\n` +
                      `Siparişim hakkında bilgi almak ve ödememi tamamlamak istiyorum.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-montserrat text-xs font-bold uppercase tracking-wider transition-colors rounded-sm shadow-md cursor-pointer"
                >
                  <FaWhatsapp size={18} />
                  <span>{t.whatsappBtn}</span>
                </a>
              </div>
            )}

            <div className="h-[1px] w-24 bg-[#C9A84C]/35 mx-auto" />

            {/* Prominent Gold Order Number */}
            <div className="bg-[#FAF7F0] border border-[#C9A84C]/15 py-6 px-8 rounded-sm inline-block">
              <span className="block font-montserrat text-[10px] tracking-widest text-charcoal/50 uppercase font-bold mb-1">
                {t.orderNo}
              </span>
              <span className="font-playfair text-2xl sm:text-3xl font-bold text-[#8B6914] tracking-wider">
                {orderId}
              </span>
            </div>

            {/* Address & Items Recap Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left rtl:text-right pt-6 border-t border-[#C9A84C]/15">
              {/* Address details */}
              <div className="space-y-3">
                <h4 className="font-playfair text-xs tracking-wider uppercase font-bold text-charcoal border-b border-[#C9A84C]/15 pb-2">
                  {t.addressRecap}
                </h4>
                <div className="font-montserrat text-xs text-charcoal/80 space-y-1 leading-relaxed">
                  <p className="font-bold text-charcoal">{watchData.name}</p>
                  <p>{watchData.address}</p>
                  <p>{watchData.district} / {watchData.city}</p>
                  <p className="flex items-center gap-1.5 mt-2 text-charcoal/60"><FiPhone size={12}/> {watchData.phone}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-playfair text-xs tracking-wider uppercase font-bold text-charcoal border-b border-[#C9A84C]/15 pb-2">
                  {t.itemsRecap}
                </h4>
                <div className="max-h-[160px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {(orderRecap?.items || items).map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-montserrat font-bold text-charcoal block leading-tight">
                          {item.brand} - {item.perfumeName}
                        </span>
                        <span className="font-montserrat text-[10px] text-charcoal/60">
                          {item.size} × {item.qty}
                        </span>
                      </div>
                      <span className="font-montserrat font-semibold text-charcoal whitespace-nowrap">
                        ₺{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
              {isAuthenticated ? (
                <Link href="/profile" className="btn-luxury-outline px-8 py-3.5">
                  {t.goToOrders}
                </Link>
              ) : (
                <Link href="/shop" className="btn-luxury-outline px-8 py-3.5">
                  {t.continueShopping}
                </Link>
              )}
              <Link href="/shop" className="btn-luxury-fill px-8 py-3.5">
                {t.continueShopping}
              </Link>
            </div>
          </div>

        ) : (
          /* ─── TWO COLUMN CHECKOUT LAYOUT ─── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-8 bg-white border border-[#C9A84C]/15 shadow-lg p-6 sm:p-8 rounded-sm">
              
              {step === 1 ? (
                /* ──────────────── STEP 1: DELIVERY FORM ──────────────── */
                <form onSubmit={handleSubmit(onDeliverySubmit)} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#C9A84C]/15 pb-4 mb-6">
                    <h2 className="font-playfair text-xl font-bold tracking-wide uppercase text-charcoal">
                      {t.deliveryInfo}
                    </h2>
                    
                    {/* Saved address pre-populate if logged-in */}
                    {isAuthenticated && savedAddresses.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowAddressSelector(!showAddressSelector)}
                          className="bg-[#C9A84C]/10 text-charcoal border border-[#C9A84C]/30 hover:bg-[#C9A84C]/20 text-[10px] tracking-wider uppercase font-bold px-3 py-1.5 transition-all"
                        >
                          {t.useSaved}
                        </button>
                        
                        {/* Address Selector Dropdown */}
                        {showAddressSelector && (
                          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#C9A84C]/25 shadow-xl z-30 p-2 space-y-1">
                            <p className="text-[9px] text-[#C9A84C] font-bold uppercase tracking-wider p-2 border-b border-[#C9A84C]/10">
                              {t.selectSaved}
                            </p>
                            <div className="max-h-48 overflow-y-auto">
                              {savedAddresses.map((addr, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSelectAddress(addr)}
                                  className="w-full text-left rtl:text-right p-2 text-xs font-montserrat hover:bg-cream/45 border-b border-[#C9A84C]/5 last:border-0"
                                >
                                  <span className="font-bold text-charcoal block">{addr.label}</span>
                                  <span className="text-charcoal/70 block text-[10px] truncate">{addr.address}</span>
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowAddressSelector(false)}
                              className="w-full text-center text-[9px] uppercase font-bold tracking-wider py-1.5 text-red-600 hover:text-red-800 border-t border-[#C9A84C]/10"
                            >
                              {t.closeBtn}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-[10px] tracking-widest font-bold text-charcoal/60 uppercase">
                        {t.fullName} *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"><FiUser size={14} /></span>
                        <input
                          id="name"
                          type="text"
                          {...register("name")}
                          className={`w-full bg-[#FAF7F0]/40 border ${
                            errors.name ? "border-red-500" : "border-charcoal/15 focus:border-[#C9A84C]"
                          } text-xs font-montserrat pl-9 pr-3 py-3.5 outline-none transition-colors`}
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-[10px] font-montserrat">{errors.name.message}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="block text-[10px] tracking-widest font-bold text-charcoal/60 uppercase">
                        {t.phone} *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"><FiPhone size={14} /></span>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="05XXXXXXXX"
                          {...register("phone")}
                          className={`w-full bg-[#FAF7F0]/40 border ${
                            errors.phone ? "border-red-500" : "border-charcoal/15 focus:border-[#C9A84C]"
                          } text-xs font-montserrat pl-9 pr-3 py-3.5 outline-none transition-colors`}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-[10px] font-montserrat">{errors.phone.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label htmlFor="email" className="block text-[10px] tracking-widest font-bold text-charcoal/60 uppercase">
                        {t.email} *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"><FiMail size={14} /></span>
                        <input
                          id="email"
                          type="email"
                          {...register("email")}
                          className={`w-full bg-[#FAF7F0]/40 border ${
                            errors.email ? "border-red-500" : "border-charcoal/15 focus:border-[#C9A84C]"
                          } text-xs font-montserrat pl-9 pr-3 py-3.5 outline-none transition-colors`}
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-[10px] font-montserrat">{errors.email.message}</p>}
                    </div>

                    {/* City Dropdown */}
                    <div className="space-y-1.5">
                      <label htmlFor="city" className="block text-[10px] tracking-widest font-bold text-charcoal/60 uppercase">
                        {t.city} *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"><FiMapPin size={14} /></span>
                        <select
                          id="city"
                          {...register("city")}
                          className={`w-full bg-[#FAF7F0]/40 border ${
                            errors.city ? "border-red-500" : "border-charcoal/15 focus:border-[#C9A84C]"
                          } text-xs font-montserrat pl-9 pr-3 py-3.5 outline-none transition-colors appearance-none`}
                        >
                          <option value="">İl Seçiniz</option>
                          {TURKISH_CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal/40">▼</span>
                      </div>
                      {errors.city && <p className="text-red-500 text-[10px] font-montserrat">{errors.city.message}</p>}
                    </div>

                    {/* District */}
                    <div className="space-y-1.5">
                      <label htmlFor="district" className="block text-[10px] tracking-widest font-bold text-charcoal/60 uppercase">
                        {t.district} *
                      </label>
                      <input
                        id="district"
                        type="text"
                        {...register("district")}
                        className={`w-full bg-[#FAF7F0]/40 border ${
                          errors.district ? "border-red-500" : "border-charcoal/15 focus:border-[#C9A84C]"
                        } text-xs font-montserrat px-3 py-3.5 outline-none transition-colors`}
                      />
                      {errors.district && <p className="text-red-500 text-[10px] font-montserrat">{errors.district.message}</p>}
                    </div>

                    {/* Address Textarea */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label htmlFor="address" className="block text-[10px] tracking-widest font-bold text-charcoal/60 uppercase">
                        {t.address} *
                      </label>
                      <textarea
                        id="address"
                        rows={4}
                        {...register("address")}
                        className={`w-full bg-[#FAF7F0]/40 border ${
                          errors.address ? "border-red-500" : "border-charcoal/15 focus:border-[#C9A84C]"
                        } text-xs font-montserrat px-3 py-3.5 outline-none transition-colors resize-none`}
                      />
                      {errors.address && <p className="text-red-500 text-[10px] font-montserrat">{errors.address.message}</p>}
                    </div>
                  </div>

                  {/* Wizard control - Next Button */}
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="btn-luxury-fill flex items-center gap-2 px-8 py-4">
                      <span>{t.nextButton}</span>
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                /* ──────────────── STEP 2: PAYMENT METHOD ──────────────── */
                <form onSubmit={handlePaymentSubmit} className="space-y-8">
                  <div className="border-b border-[#C9A84C]/15 pb-4">
                    <h2 className="font-playfair text-xl font-bold tracking-wide uppercase text-charcoal">
                      Ödeme Yöntemi Seçin
                    </h2>
                  </div>

                  {/* Three payment option selection cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* WhatsApp selection */}
                    <div
                      onClick={() => setPaymentMethod("whatsapp")}
                      className={`border p-4 rounded-sm cursor-pointer flex flex-col justify-between items-start h-32 transition-all duration-300 ${
                        paymentMethod === "whatsapp"
                          ? "border-[#25D366] bg-[#25D366]/5 ring-2 ring-[#25D366]/15"
                          : "border-charcoal/10 hover:border-[#C9A84C]/40"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[#25D366]"><FaWhatsapp size={20} /></span>
                        {paymentMethod === "whatsapp" && (
                          <span className="bg-[#25D366] text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px]"><FiCheck size={10} /></span>
                        )}
                      </div>
                      <div>
                        <span className="font-playfair text-sm font-bold text-charcoal block">
                          {t.payWhatsapp}
                        </span>
                        <span className="font-montserrat text-[9px] text-[#25D366] font-bold uppercase tracking-wider mt-1 block">
                          WhatsApp ile Sipariş
                        </span>
                      </div>
                    </div>

                    {/* Bank transfer selection */}
                    <div
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`border p-4 rounded-sm cursor-pointer flex flex-col justify-between items-start h-32 transition-all duration-300 ${
                        paymentMethod === "bank_transfer"
                          ? "border-[#C9A84C] bg-[#FAF7F0]/40 ring-2 ring-[#C9A84C]/15"
                          : "border-charcoal/10 hover:border-[#C9A84C]/40"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[#C9A84C]"><FiDollarSign size={20} /></span>
                        {paymentMethod === "bank_transfer" && (
                          <span className="bg-[#C9A84C] text-black w-4 h-4 rounded-full flex items-center justify-center text-[9px]"><FiCheck size={10} /></span>
                        )}
                      </div>
                      <div>
                        <span className="font-playfair text-sm font-bold text-charcoal block">
                          {t.payBank}
                        </span>
                        <span className="font-montserrat text-[9px] text-charcoal/50 uppercase mt-1 block">
                          Havale / EFT
                        </span>
                      </div>
                    </div>

                    {/* COD selection */}
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`border p-4 rounded-sm cursor-pointer flex flex-col justify-between items-start h-32 transition-all duration-300 ${
                        paymentMethod === "cod"
                          ? "border-[#C9A84C] bg-[#FAF7F0]/40 ring-2 ring-[#C9A84C]/15"
                          : "border-charcoal/10 hover:border-[#C9A84C]/40"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[#C9A84C]"><FiMapPin size={20} /></span>
                        {paymentMethod === "cod" && (
                          <span className="bg-[#C9A84C] text-black w-4 h-4 rounded-full flex items-center justify-center text-[9px]"><FiCheck size={10} /></span>
                        )}
                      </div>
                      <div>
                        <span className="font-playfair text-sm font-bold text-charcoal block">
                          {t.payCod}
                        </span>
                        <span className="font-montserrat text-[9px] text-red-600 font-bold uppercase mt-1 block">
                          + ₺{codServiceFee.toFixed(2)} Hizmet Bedeli
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Container */}
                  <div className="bg-[#FAF7F0]/40 border border-[#C9A84C]/10 p-6 rounded-sm">
                    
                    {paymentMethod === "whatsapp" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#C9A84C]/10">
                          <span className="font-montserrat text-[10px] tracking-widest text-[#C9A84C] uppercase font-bold">
                            {t.payWhatsapp}
                          </span>
                        </div>
                        <div className="p-4 bg-white border border-[#C9A84C]/10 space-y-2 font-montserrat text-xs text-charcoal/80 leading-relaxed flex items-start gap-3">
                          <span className="text-[#C9A84C] mt-0.5"><FiInfo size={16} /></span>
                          <p className="text-red-700 bg-red-50 p-3 border border-red-200/50 rounded-sm w-full font-semibold">
                            {t.whatsappApology}
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "bank_transfer" && (
                      /* ─── Banka Havalesi details ─── */
                      <div className="space-y-4">
                        <span className="font-montserrat text-[10px] tracking-widest text-[#C9A84C] uppercase font-bold block border-b border-[#C9A84C]/10 pb-2">
                          {t.bankDetails}
                        </span>
                        
                        <div className="space-y-3 font-montserrat text-xs text-charcoal/80 leading-relaxed bg-white p-4 border border-[#C9A84C]/10">
                          <div>
                            <span className="text-charcoal/50 block text-[9px] uppercase font-bold">{t.bankName}</span>
                            <span className="font-bold text-charcoal">Garanti BBVA</span>
                          </div>
                          <div>
                            <span className="text-charcoal/50 block text-[9px] uppercase font-bold">{t.receiver}</span>
                            <span className="font-semibold text-charcoal">Real Dekant Kozmetik Ticaret A.Ş.</span>
                          </div>
                          <div>
                            <span className="text-charcoal/50 block text-[9px] uppercase font-bold">{t.iban}</span>
                            <span className="font-mono font-bold text-charcoal text-[13px]">TR56 0006 2000 8888 1234 5678 90</span>
                          </div>
                          <div className="pt-2 border-t border-charcoal/5">
                            <span className="text-red-700 block text-[9px] uppercase font-bold">{t.reference}</span>
                            <span className="font-bold text-red-700 bg-red-50 px-2 py-1.5 rounded-sm inline-block mt-1">
                              Ödeme açıklama kısmına isminizi ve sipariş numaranızı yazınız.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "cod" && (
                      /* ─── Kapıda Ödeme details ─── */
                      <div className="space-y-2">
                        <span className="font-montserrat text-[10px] tracking-widest text-[#C9A84C] uppercase font-bold block border-b border-[#C9A84C]/10 pb-2">
                          {t.payCod}
                        </span>
                        <div className="p-4 bg-white border border-[#C9A84C]/10 space-y-2 font-montserrat text-xs text-charcoal/80 leading-relaxed">
                          <p>{t.codNote}</p>
                          <p className="text-[#8B6914] font-bold">{codExtraFeeText}</p>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Wizard Control Buttons */}
                  <div className="pt-4 flex justify-between items-center border-t border-[#C9A84C]/10">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn-luxury-outline px-6 py-3.5"
                    >
                      {t.backButton}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-luxury-fill flex items-center gap-2 px-8 py-4 text-[#0d0d0d]"
                    >
                      <span>{isSubmitting ? t.processing : t.completeOrder}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Right Column: Sticky Order Summary */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-white border border-[#C9A84C]/25 shadow-lg p-6 rounded-sm">
              <h3 className="font-playfair text-lg font-bold tracking-wider text-[#C9A84C] uppercase border-b border-[#C9A84C]/15 pb-4 mb-4">
                {t.orderSummary}
              </h3>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto space-y-4 pr-1 scrollbar-thin mb-4 border-b border-charcoal/5 pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex space-x-3 rtl:space-x-reverse items-center">
                    {/* Small image */}
                    <div className="relative w-12 h-12 bg-cream-dark/20 flex-shrink-0 border border-[#C9A84C]/10 overflow-hidden">
                      <Image
                        src={getOptimizedImage(item.image, "thumb")}
                        alt={item.perfumeName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    {/* Item Text details */}
                    <div className="flex-grow min-w-0">
                      <span className="block font-montserrat text-[9px] tracking-widest text-[#C9A84C] uppercase font-bold truncate">
                        {item.brand}
                      </span>
                      <h5 className="font-playfair text-xs font-bold text-charcoal truncate leading-tight">
                        {item.perfumeName}
                      </h5>
                      <span className="block font-montserrat text-[9px] text-charcoal/60 mt-0.5">
                        {item.size} × {item.qty}
                      </span>
                    </div>
                    {/* Price details */}
                    <div className="font-montserrat text-xs font-bold text-charcoal whitespace-nowrap">
                      ₺{item.price * item.qty}
                    </div>
                  </div>
                ))}
              </div>

              {/* Invoice breakdown details */}
              <div className="space-y-2.5 font-montserrat text-xs text-charcoal/80">
                
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span>₺{subtotal}</span>
                </div>

                {/* Discount */}
                {finalDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>{t.discount}</span>
                    <span>-₺{finalDiscount}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between">
                  <span>{t.shipping}</span>
                  <span>{shippingFee === 0 ? t.free : `₺${shippingFee}`}</span>
                </div>

                {/* COD Service Fee */}
                {paymentMethod === "cod" && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>{t.codFeeLabel}</span>
                    <span>+₺{codServiceFee}</span>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-[#C9A84C]/15 my-2" />

                {/* Grand Total */}
                <div className="flex justify-between items-baseline text-charcoal">
                  <span className="font-playfair text-base font-bold">{t.total}</span>
                  <span className="font-montserrat text-lg font-bold tracking-wider text-[#C9A84C]">
                    ₺{finalTotal}
                  </span>
                </div>
              </div>
            </aside>

          </div>
        )}

      </div>


    </div>
  );
}
