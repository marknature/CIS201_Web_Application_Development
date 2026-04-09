# Skill Profiling and Intelligent Matching (FFIMS Module F4.4)

## Overview
The **Skill Profiling and Intelligent Matching** submodule is a critical component of the Fleet and Facilities Integrated Management System (FFIMS) designed to optimize workforce utilization at Africa University [1, 2]. Historically, the Fleet and Facilities Unit (FFU) has operated with "general hands" who have limited specialized training, making it difficult to align specific competencies with operational requirements like the new **zoning system** [3, 4]. This module transforms workforce management into a data-driven model by tracking employee competencies and using AI-powered algorithms to recommend the best worker for specific tasks, such as garden work, brush cutting, or specialized maintenance [3, 5, 6].

## Key Features
*   **Comprehensive Employee Profiles:** Maintains detailed digital records of skills, qualifications, vehicle experience, and license classes [7, 8].
*   **Skill Taxonomy & Competency Framework:** Implements a hierarchical classification system to organize skills into specific categories like general maintenance and specialized trades [7-9].
*   **AI-Powered Matching Algorithm:** Uses **cosine similarity** and **weighted scoring** to automatically suggest optimal employee assignments based on zone or task requirements [10, 11].
*   **Skill Gap Analysis:** Features a dashboard to identify deficiencies by comparing the current workforce's capabilities against the university's organizational needs [7, 8, 12, 13].
*   **Training & Certification Management:** Tracks internal and external training programs and provides automated alerts for expiring professional certifications [7, 8, 14, 15].
*   **Career Pathway Recommendations:** Employs machine learning to predict and recommend personalized career progression paths for employees based on acquired skills [7, 8, 12, 13].

## Technical Architecture
This submodule integrates with the broader FFIMS ecosystem using a modern full-stack approach:
*   **Frontend:** Developed with **React.js** and **Material-UI**, utilizing **D3.js** for advanced skill visualization and matrices [10, 11].
*   **Backend:** Powered by **Node.js** and **Express.js** handling RESTful API integrations with the zoning and appraisal modules [8, 10, 11].
*   **Database:** Built on **PostgreSQL** with **Sequelize ORM** to manage complex relational data between employees and skill sets [10, 11, 16].
*   **AI/ML Layer:** Uses **Python** with **scikit-learn** for matching logic and **TensorFlow** for recommendation systems [10, 11].

## Database Schema
The module relies on four primary relational tables:
1.  **Employees/Users:** Stores core identity, roles, and contact data [16].
2.  **Skill_Taxonomy:** Defines the hierarchy of maintenance and driving skills [17].
3.  **Employee_Skills:** A junction table mapping individual workers to proficiency levels [17].
4.  **Certifications:** Tracks qualifications and expiration dates for specialized training [17].

## UI/UX Standards
Following the FFIMS design system, this module emphasizes a **mobile-first** and **low-bandwidth friendly** interface [18]. Key screens include:
*   **Driver Skill Profile:** Cards that streamline the comparison of qualifications [19].
*   **Assignment Recommendation Screen:** A view for supervisors displaying required skills versus available drivers to simplify allocation under pressure [19].
*   **Shared UI Components:** All interfaces must use the standardized `Card.jsx`, `Table.jsx`, `Badge.jsx`, and `Button.jsx` from the core UI library to ensure consistency [20-22].

## Development Workflow (Git)
All contributors must adhere to the group's version control standards:
1.  **Pull Latest Changes:** Always run `git pull origin master` before starting work to avoid merge conflicts [23, 24].
2.  **Feature Branching:** Never work directly on the `main` branch; create a relevant branch using `git checkout -b feature-skill-matching` [25, 26].
3.  **Atomic Commits:** Stage changes with `git add .` and commit with detailed messages via `git commit -m "message"` [27, 28].
4.  **Pull Requests:** Push the branch to GitHub and create a **Pull Request** for team review and quality control before merging [29, 30].
