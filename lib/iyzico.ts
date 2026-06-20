// lib/iyzico.ts
// @ts-expect-error iyzipay has no official type definitions
import Iyzipay from "iyzipay";

const iyzico = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || "sandbox-y3J4yXgS1h23jH84g9k6Hj3j4",
  secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-84h2j3g4k5j6h7g8f9d0s9a8",
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzico.com"
});

export default iyzico;
