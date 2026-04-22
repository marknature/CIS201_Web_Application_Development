# **Fleet and Facilities Integrated Management System (FFIMS)**

## **Project Overview**
The **Fleet & Facilities Integrated Management System (FFIMS)** is a modular, enterprise-grade web application developed for Africa University’s **Fleet and Facilities Unit (FFU)**. The system is designed to revolutionize operations by transitioning the unit from **manual, paper-based tracking** to a unified, automated digital environment. Its primary goal is to enhance operational efficiency, ensure **Zimbabwe Labor Act compliance**, and provide real-time visibility across all university logistical and maintenance activities.

---

## **Core System Modules**
The FFIMS ecosystem is divided into several specialized functional modules integrated through a shared infrastructure:

*   **Shift & Workforce Scheduling (F4):** Manages automated **5-in/5-out driver rotations**, digital leave workflows, and a **WebSocket-powered** real-time availability board.
*   **Fleet Management (A1):** Handles vehicle tracking, trip logging, fuel monitoring, and servicing schedules.
*   **Grounds & Facilities Monitoring (F1):** Tracks building status, room conditions, and overall facility health scoring.
*   **Maintenance Planning & Scheduling (A3):** Automates preventive maintenance plans, work orders, and overdue task tracking.
*   **Faults & Ticketing System (A4):** Provides digital logging for maintenance faults with priority assignment and status tracking.
*   **Procurement & Inventory (A5, A6):** Manages stock reorder levels, requisitions, RFQs, and supplier contracts.
*   **Overtime & Labor Compliance (F4.3):** Uses **fairness algorithms** to distribute extra work while strictly enforcing legal rest periods and hour thresholds.
*   **Skill Profiling & AI Matching (F4.4):** Employs **cosine similarity algorithms** to match worker competencies (e.g., brush cutting, specialized maintenance) to specific maintenance zones.

---

## **Technology Stack**
FFIMS utilizes a modern, full-stack architecture optimized for scalability and performance:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router)** | Server-side rendering, layout, and routing. |
| **UI Library** | **React 18 + Tailwind CSS** | Component rendering and responsive styling. |
| **Backend** | **Node.js + Express.js** | RESTful API design and core business logic. |
| **Database** | **PostgreSQL + Sequelize ORM** | Relational data persistence and schema management. |
| **State Mgmt** | **Zustand** | Global state for rosters, leave, and overtime. |
| **Real-Time** | **Socket.io / WebSockets** | Bidirectional communication for instant status updates. |
| **AI / ML** | **Python + scikit-learn** | Predictive analytics and skill-matching algorithms. |

---

## **UI/UX Design Framework**
The system adheres to a strict **Group P5 UI Design Framework** to ensure a consistent, professional experience across all modules:

*   **Design Philosophy:** **User-Centered Design (UCD)** with a focus on **Mobile-First** accessibility and **Low-Bandwidth** efficiency for Zimbabwean network conditions.
*   **Color Palette:** Primary Red (**#CC0000**), Dark Navy (**#1A1A1A**), and Content White (**#FFFFFF**).
*   **Shared Components:** All modules must import standardized elements from `src/components/ui/`, including **Cards, Badges, Tables, and Buttons**.
*   **Typography:** Utilizes the **Inter** font family for high legibility at all sizes.

---

## **Development Workflow (Git & Collaboration)**
To manage a project of this scale (76 students), the team follows professional version control standards:

1.  **Branching:** Developers must create separate **feature branches** (e.g., `git checkout -b feature-roster-logic`) and never work directly on the `main` branch.
2.  **Staging:** Changes are prepared using `git add .` after testing.
3.  **Committing:** Meaningful commit messages are required via `git commit -m "message"`.
4.  **Pull Requests:** Code is merged into the stable branch only after a **Pull Request (PR)** and peer review on GitHub.
5.  **Synchronization:** Team members must run `git pull origin master` frequently to avoid merge conflicts.

---

## **Installation and Setup**
1.  **Clone the repository:** `git clone [repository-url]`.
2.  **Install dependencies:** Navigate to the project folder and run `npm install`.
3.  **Environment Configuration:** Set up a `.env` file with **PostgreSQL credentials** and secret keys.
4.  **Database Migration:** Use Sequelize to sync tables.
5.  **Run Development Server:** `npm run dev` to start the Next.js/React environment.
