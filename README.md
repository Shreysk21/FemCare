# FemCare — Women's Health & Wellness Application

An AI-enhanced holistic health and wellness web application designed for cycle tracking, symptom logging, personalized wellness insights, and healthcare provider integration.

---

## 📁 Project Structure

```text
HCI_project/
├── frontend/                 # Client application (React + Vite + Tailwind CSS)
│   ├── public/               # Static assets & icons
│   ├── src/                  # React source code
│   │   ├── assets/           # Media & illustration assets
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # State management (AppContext)
│   │   ├── data/             # Mock datasets & initial states
│   │   ├── lib/              # API and Supabase clients
│   │   └── views/            # Dashboard & module views
│   ├── index.html            # HTML entry point
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite configuration & API proxy
│
├── backend/                  # Server application (FastAPI + Python)
│   ├── routes/               # API route modules (cycles, profile, moods, etc.)
│   ├── database.py           # SQLAlchemy ORM models & database setup
│   ├── main.py               # FastAPI application entry point
│   ├── requirements.txt      # Python dependencies
│   ├── schemas.py            # Pydantic validation schemas
│   ├── seed.py               # Database seed scripts
│   └── .env.example          # Sample environment variables
│
├── supabase/                 # Supabase configuration & migrations
│   └── schema.sql            # Database schema definitions
│
├── package.json              # Monorepo root scripts
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### 1. Frontend Setup (React + Vite)

You can run the frontend directly from the project root:

```bash
npm run dev
```

Or navigate to the `frontend/` folder:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at: **http://localhost:5173**

---

### 2. Backend Setup (FastAPI + Python)

Install python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Run the backend from the project root:

```bash
npm run dev:backend
# or
npm run server
```

Or from the `backend/` directory:

```bash
cd backend
uvicorn main:app --port 8000 --reload
```

The backend API will run at: **http://localhost:8000**
- Interactive Swagger API docs: **http://localhost:8000/docs**
- Health check: **http://localhost:8000/api/health**

---

## 🛠 Available Root Scripts

From the root directory:
- `npm run dev`: Starts the Vite frontend dev server
- `npm run dev:backend` / `npm run server`: Starts the FastAPI backend server
- `npm run build`: Builds the production bundle in `frontend/dist`
- `npm run cap:build`: Builds frontend and synchronizes with Android project
- `npm run cap:open`: Opens Android project in Android Studio
- `npm run lint`: Runs code linting for the frontend

---

## 📱 Android Native App (Capacitor + Android Studio)

FemCare is configured as a native Android application using **Capacitor**:

- **App Name**: FemCare
- **Application ID**: `com.femcare.app`
- **Native Android Directory**: `frontend/android/`

### 1. Build & Sync Web Assets to Android
```bash
npm run cap:build
```

### 2. Open in Android Studio
```bash
npm run cap:open
# or open Android Studio -> Open Folder -> select 'frontend/android'
```

### 3. Generate Android APK in Android Studio
1. In Android Studio, wait for Gradle sync to complete.
2. In the top menu, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Once completed, click **locate** in the notification popup. The installable `.apk` file will be generated at:
   `frontend/android/app/build/outputs/apk/debug/app-debug.apk`
4. Connect an Android phone via USB (with USB Debugging enabled) or use an Android Emulator, then click **Run 'app'** (green play button ▶️) to install and launch directly on the device!

