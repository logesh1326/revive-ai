# 🛒 REVIVEAI — AI-Powered Smart Grocery Agent

> Intelligent grocery e-commerce platform with handwritten list OCR, Contextual Bandit Reinforcement Learning recommendation engine, real SMS phone authentication, and ultra-fast checkout.

---

## 🌟 Key Features

1. **📝 Intelligent AI Grocery-List Agent**:
   - Upload handwritten grocery lists, printed notes, or photos.
   - Vision OCR powered by Google Gemini Vision LLM & dynamic handwriting engine.
   - NLP normalization: handles spelling typos (`potatos` → potato, `almnd milk` → almond milk), pluralization, quantities (`eggs (2)` → 2 eggs), and compound items.
   - Product catalog matching with confidence badges (`✓ Matched`, `? Please confirm`, `⚠ Need clarification`).
   - 6-stage animated purple AI processing visualization.

2. **🧠 Contextual Bandit Reinforcement Learning (RL)**:
   - Bounded $\epsilon$-Greedy policy ($\epsilon=0.10$: 90% exploitation / 10% exploration).
   - Multi-factor recommendation scoring:
     $$\text{Score} = 0.30 \cdot \text{Semantic} + 0.20 \cdot \text{History} + 0.15 \cdot \text{Brand} + 0.10 \cdot \text{Price} + 0.10 \cdot \text{Rating} + 0.10 \cdot \text{Availability} + 0.05 \cdot \text{Discount} + \text{BanditBias}$$
   - Continuous reward backpropagation: `VIEW` (+0.5), `ADD` (+1.0), `PURCHASE` (+2.0), `REMOVE` (-1.0), `REPLACE` (-2.0).
   - Customer AI Preferences view & Developer AI Insights telemetry dashboard.

3. **📱 Real SMS Phone Authentication & Onboarding**:
   - Twilio Verify V2 API & Fast2SMS integration for live SMS OTP delivery.
   - E.164 phone formatting (`+91XXXXXXXXXX`), rate-limiting protection, 5-minute expiry.
   - Consumer onboarding flow: `/login` → `/verify-phone` → `/profile-setup` → `/address-setup` → `/home`.

4. **⚡ Complete E-Commerce Store**:
   - Category navigation, search, voice search, AI recipe assistant.
   - Smart savings substitutions, Razorpay payments, UPI QR, and live order tracking.

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:4000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_jwt_secret

# AI Vision LLM (Optional for live Gemini Vision)
GEMINI_API_KEY=your_gemini_api_key

# Real SMS OTP Provider (Twilio Verify)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid

# Fast2SMS (Optional alternative for India)
FAST2SMS_API_KEY=

# Payments (Razorpay)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Database (PostgreSQL - in-memory fallback enabled if blank)
DATABASE_URL=
```

---

## 🌐 Vercel Deployment

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) → **Add New Project**.
3. Import your GitHub repository.
4. Set **Root Directory** to `frontend` (or deploy root with standard static build).
5. Add your environment variables in Vercel settings and deploy!
