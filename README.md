
---

# 📊 Scalable Streaming CSV Export System

A robust, real-time CSV export service built with **Node.js**, **TypeScript**, **PostgreSQL**, and **Redis**. This system is designed to handle large datasets efficiently using database cursors and provides live feedback to the user via WebSockets.

## 🚀 Key Features

* **Memory-Efficient Streaming:** Uses **PostgreSQL Cursors** to fetch data in small batches, preventing memory overflows even with millions of rows.
* **Real-time Progress (Requirement 7):** Integrated with **Socket.io** and **Redis Pub/Sub** to provide live percentage updates, row counts, and ETA to the frontend.
* **Export Cancellation (Requirement 10):** Users can stop an ongoing export instantly. The backend catches the cancellation signal via Redis and terminates the database cursor and resource usage immediately.
* **Resilient Architecture (Requirement 11):** Comprehensive error handling for database connection drops or Redis failures, ensuring the system remains stable.
* **Fully Containerized:** Uses **Docker Compose** to orchestrate the Node.js App, PostgreSQL, and Redis for a "one-command" setup.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express, TypeScript
* **Database:** PostgreSQL (with `pg-cursor` for streaming)
* **Cache/Messaging:** Redis (Pub/Sub for event-driven updates)
* **Real-time:** Socket.io (WebSockets)
* **Infrastructure:** Docker & Docker Compose

---

## 📦 Getting Started

### 1. Prerequisites

Ensure you have the following installed:

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Git](https://git-scm.com/)

### 2. Installation & Setup

Clone the repository and navigate to the project root:

```bash
git clone https://github.com/saiyasaswi-685/streaming-csv-export
cd streaming-csv-export

```

### 3. Environment Configuration

Create a `.env` file from the provided template:

```bash
cp .env.example .env

```

### 4. Run the Application

Start the entire stack using Docker Compose:

```bash
docker-compose up --build

```

The services will be available at:

* **Dashboard:** `http://localhost:8080`
* **Postgres:** `localhost:5432`
* **Redis:** `localhost:6379`

---

## 🧪 Testing the Requirements

1. **Start Export:** Click the "Start Export" button on the dashboard. Observe the real-time progress bar and ETA.
2. **Cancel Export:** While the export is running, click the **"Cancel"** button. Verify that the status updates to "Cancelled" and the backend stops processing.
3. **Completion:** Allow an export to finish to see the "Download CSV" button appear.

---

## 📁 Project Structure

```text
.
├── src/
│   ├── controllers/    # API Route handlers
│   ├── services/       # Business logic (Streaming & Redis logic)
│   ├── app.ts          # Express configuration & Static file serving
│   └── index.ts        # Server entry point & Socket initialization
├── index.html          # Frontend Dashboard
├── docker-compose.yml  # Multi-container orchestration
├── Dockerfile          # App containerization
├── .env.example        # Environment variable template
└── .gitignore          # Git exclusion rules

```

---

### **Final Checklist before you Submit:**

1. **`.env.example`** exists? ✅
2. **`.gitignore`** (hiding node_modules) exists? ✅
3. **`index.html`** is in the root folder? ✅
4. **`app.ts`** is serving the static index file? ✅

