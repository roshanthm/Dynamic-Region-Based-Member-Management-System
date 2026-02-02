# Dynamic Region-Based Member Management System

A modern, DBMS-driven web application designed to store, manage, and analyze member information across dynamically created hierarchical regions (State → District → Ward → Village or any custom structure).

This project demonstrates strong **Database Management System concepts**, **role-based security**, and a **professional enterprise dashboard UI**.

---

##  Features

### ✅ Dynamic Region Hierarchy
- Create unlimited region levels (State, District, Ward, Village, Department, etc.)
- Parent–child region structure using self-referencing foreign keys
- Region tree + searchable table view

### ✅ Member Management (CRUD)
- Add, update, delete members
- Assign members to regions
- Instant search by name/phone
- Region-based filtering

### ✅ Role-Based Access Control (RBAC)
Secure login system with roles:

| Role | Permissions |
|------|------------|
| **ADMIN** | Full control (regions, members, users, analytics) |
| **STAFF** | Add/update members only in assigned region |
| **SUPERVISOR** | View analytics + reports (read-only access) |

### ✅ Analytics & Reports
- Region-wise member distribution
- Highest populated region
- Growth trends and statistics
- Export reports (PDF/Excel)

### ✅ Activity Logging (Audit Trail)
Tracks every INSERT / UPDATE / DELETE action:
- Who made the change
- What action was performed
- Timestamped logs

---

##  Database Schema (DBMS Core)

### Tables Included
- **regions**
- **members**
- **users**
- **activity_logs**

### DBMS Concepts Implemented
- Primary & Foreign Keys  
- Self-referencing foreign key hierarchy  
- Normalization (3NF)  
- SQL JOIN + GROUP BY analytics  
- Secure authentication + RBAC enforcement  
- Audit logging  


---

##  Tech Stack

### Frontend
- React + Vite
- Tailwind CSS (Glassmorphism UI)
- Charts (Recharts)

### Backend
- FastAPI (Python)
- JWT Authentication
- REST API

### Database
- MySQL / PostgreSQL
- Relational schema with constraints

---

##  Installation & Run

### 1️ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

```
👤 Author

Roshan Thomas
Full Stack Developer | DBMS & Web Application Enthusiast



