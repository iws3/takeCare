# TakeCare AI - The Intelligent Clinical Bridge 🏥🤖

> **Transforming the limited doctor-patient window into a continuous, data-driven health partnership.**

TakeCare AI is a cutting-edge clinical intelligence platform designed to serve as a **perpetual medical middleman**. Recognizing that patients often have only a single, brief opportunity to discuss their health with a professional, TakeCare AI fills the gap by synthesizing vitals, medical records, and AI-driven clinical insights into a persistent, accessible "Digital Health Twin."

---

## 🌟 The Vision: Closing the Clinical Gap

In the traditional healthcare model, the "Clinical Window" is extremely narrow. Between appointments, critical patient data is often lost, symptoms are forgotten, and context is fragmented. This results in patients feeling unheard and doctors working with incomplete information.

**TakeCare AI** acts as an **AI Clinical Liaison** that:
1.  **Captures the Continuum**: Collects everything from physical lab scans to real-time wearable telemetry.
2.  **The Voice Agent Middleman**: Our sophisticated voice AI doesn't just "talk"; it acts as a surrogate medical assistant. It has total recall of your vital signs, medical history, and past doctor consultations.
3.  **Optimizes Every Second**: Prepares the patient with a summarized, clinically-accurate report for their doctor, ensuring that the "single chance" to sit with a physician is utilized with 100% efficiency.

---

## 🚀 Core Technology Pillars

### 🎙️ Speech Recognition & Synthesis (The Voice Agent)
The TakeCare **Voice Agent** is the emotional and intellectual heart of the experience.
-   **Contextual Recall**: Unlike generic GPTs, this agent is fed your real-time vital signs and historical records through a high-fidelity RAG pipeline.
-   **Clinical Bridge**: The agent can simulate a doctor's consultation, helping you prepare questions, understand your lab results, and manage your health between visits.
-   **Real-Time Processing**: Powered by Vapi and Vocode architecture for sub-second latency, providing a human-like conversational experience.

### 👁️ Computer Vision (Document Ingestion)
The platform features a "Medical-Grade" Computer Vision pipeline.
-   **Automated Ingestion**: Patients can "Snap a Record" using their phone camera. Our CV engine performs advanced OCR (Optical Character Recognition) to extract structured clinical data from messy, physical lab results.
-   **Pattern Matching**: The system identifies key biomarkers (e.g., Blood Glucose, Heart Rate, CBC counts) and automatically maps them to your health timeline.

### 🧠 Natural Language Processing (Clinical NLP)
Using the latest Large Language Models (Gemini 1.5 Pro), TakeCare performs:
-   **Clinical Synthesis**: Merges disparate data points (e.g., a "high heart rate" from a smartwatch with "fever" from a lab result) to suggest a holistic analysis.
-   **Intelligent Summarization**: Converts 50+ pages of medical records into a 1-page "Clinical Cheat Sheet" for your next doctor's visit.

### ⚡ Real-Time Synergy & Connectivity
-   **WebSockets & Real-Time Alerts**: Integrated real-time notifications for critical health triggers (e.g., a sudden vital sign anomaly).
-   **WhatsApp & Universal Messaging**: Fully integrated WhatsApp hooks allow the AI to push reminders, receive photo records, and send "Digital Prescriptions" directly to your favorite messaging app.

---

## 🛠️ Key Technical Features

### 👤 Patient Data Sovereignty & Isolation
Built with **security-first** architecture:
-   **Multi-Account Data Guard**: Ensures that when a user creates a personalization, they ONLY see their own data. We use a strict `clerkId` hashing and `localStorage` session validation to prevent cross-account data leakage.
-   **Prototype Data Isolation**: Even in our current prototype stage, we enforce rigorous session-bound requests to the MongoDB/PostgreSQL backends.

### 🗑️ The "Clinical Danger Zone" (Full Wipe)
Respecting the **Right to be Forgotten**, TakeCare AI includes a secure data purge suite:
-   **Cascading Deletes**: One click permanently removes your entire clinical history—records, analysis, and personal settings—from all database clusters.
-   **Redirection**: Automatically redirects the user to the starting page after a secure wipe, ensuring no ghost data remains in the browser.

### 🎨 State-of-the-Art Mobile Experience
Designed for health-on-the-go:
-   **Mobile-First Architecture**: Every view—from the Lab Matrix to the Voice Dashboard—is 100% fluid and touch-optimized.
-   **Visual Excellence**: A premium design system using **Bricolage Grotesque** and **Outfit** typography, vibrant Glassmorphism effects, and custom Framer Motion animations.

---

## 🏗️ Architecture & Stack

-   **Frontend**: Next.js 15 (App Router), Tailwind CSS 4.0, Framer Motion, Lucide React.
-   **Database Layer**: Prisma ORM with PostgreSQL (Supabase) + MongoDB for flexible clinical JSON storage.
-   **AI Intelligence**: 
    -   **Gemini 1.5 Pro**: Complex reasoning and summary generation.
    -   **Vapi API**: Real-time voice orchestration.
-   **Clinical Reporting**: `jsPDF` and `html2canvas` for generating high-fidelity, printable health reports.

---

## 📊 The Roadmap
-   [ ] **IoT Live Streams**: Real-time blood pressure and glucose monitor pairing.
-   [ ] **Predictive Crisis Alerts**: Using AI to forecast potential health risks 48 hours in advance.
-   [ ] **Doctor-Facing Portal**: Allowing physicians to securely "claim" a patient's AI-synced record during a visit.

---

## 💻 Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/iws3/takeCare.git
    cd takecare/frontend
    ```
2.  **Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Setup `.env` with `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, `PRISMA_DATABASE_URL`, and `GEMINI_API_KEY`.
4.  **Run Dev**:
    ```bash
    npm run dev
    ```

---
*TakeCare AI: Because your health doesn't stop when you leave the doctor's office.*
