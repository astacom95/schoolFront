
# Product Requirements Document (PRD)
## E‑School Platform (Laravel API + Next.js Frontend + Cloudflare Stream)

---

# 1. Executive Summary
The E‑School Platform is an online school management and e-learning system designed to support Managers, Teachers, and Students. It includes real-time live streaming for lessons (via Cloudflare Stream), management dashboards, academic content distribution, student evaluation, attendance tracking, fee management, and multimedia lesson delivery.

The platform uses:
- **Backend:** Laravel (API only)
- **Frontend:** Next.js (Teacher Portal, Student Portal, Manager Dashboard)
- **Video:** Cloudflare Stream (Live + VOD)
- **CDN:** Cloudflare CDN
- **DB:** MySQL

This PRD defines the functional, technical, business, and system-level requirements of the entire platform.

---

# 2. Goals & Non‑Goals

## 2.1 Goals
- Provide a complete online infrastructure for schools.
- Enable teachers to:
  - Create lessons
  - Live stream lessons
  - Upload VOD recordings
  - Track attendance
  - Assign tests & marks
- Enable students to:
  - Watch lessons (live or recorded)
  - View timetable, subjects, tests, marks
  - Download papers & worksheets
  - View class activities
- Enable managers to manage:
  - Teachers
  - Students
  - Subjects
  - Levels & Classes
  - Payments & Fees
  - School guidance entries
- Enable cloud-based delivery of video at scale.

## 2.2 Non‑Goals
- No parent portal in this version.
- No AI auto-grading (future feature).
- No offline video downloads.
- No multi-school support (single-tenant system).

---

# 3. User Personas

## 3.1 Manager
Responsible for full system control. Manages users, classes, subjects, teachers, students, payments, and guidance.

## 3.2 Teacher
Creates lessons, streams live, uploads tests, assigns marks, and monitors attendance.

## 3.3 Student
Accesses lessons, timetable, homework, tests, results, guidance, and class activities.

---

# 4. User Stories

## 4.1 Manager Stories
- Manage Teachers (CRUD)
- Manage Students (CRUD)
- Manage Subjects (CRUD)
- Manage Teachers Time Table (CRUD)
- Manage Levels (CRUD)
- Manage Classes (CRUD)
- Manage School Guidance (CRUD)
- Manage Fees (CRUD)
- View Payments (8 screens)
- Track Teachers (5 screens)
- View Results

## 4.2 Teacher Stories
- View Time Table (2 screens)
- Manage Lessons (CRUD)
- View Student Attendance (3 screens)
- Add Marks (2 screens)
- Manage Monthly Tests (CRUD)

## 4.3 Student Stories
- View Class Time Table
- View Subjects
- View Lessons
- Watch & interact with lessons and quizzes
- View/Download Papers
- View Monthly Tests
- Solve & Submit Monthly Tests
- View Class Activity
- View School Guidance
- View Results

---

# 5. High-Level System Architecture

## 5.1 Architecture Overview Diagram
**Frontend (Next.js) → Backend API (Laravel) → MySQL DB & Cloudflare Services**

Components:
- Next.js Client (Teacher, Student, Manager)
- Laravel API Server:
  - Authentication (JWT/Sanctum)
  - Users service
  - Lessons service
  - Streaming service (Cloudflare Stream)
  - Payments service
  - Tests & Marks service
- Cloudflare Stream:
  - Live streaming input
  - VOD conversion
  - Secure playback tokens
- Cloudflare CDN:
  - Global delivery of all assets

---

# 6. Functional Requirements — Modules Breakdown

---

# 6.1 Authentication & Authorization
- Users authenticate via **username + password**.
- Roles: `Manager`, `Teacher`, `Student`.
- Token-based authentication (Laravel Sanctum or JWT).
- Role-based permissions enforced at API level.

---

# 6.2 Manager Module

### 6.2.1 Manage Teachers
Screens (4):
- Add Teacher
- Edit Teacher
- Delete Teacher
- View Teacher list

### 6.2.2 Manage Students
Screens (4)
- Add Student
- Edit Student
- Delete Student
- View Student list

### 6.2.3 Manage Subjects
Screens (4)
- Add Subject
- Edit Subject
- Delete Subject
- View Subjects

### 6.2.4 Manage Levels & Classes
Screens:
- Add/Edit/Delete Levels
- Add/Edit/Delete Classes

### 6.2.5 Manage Time Tables
Screens (4):
- Add Teacher Time Table
- Edit
- Delete
- View

### 6.2.6 Manage Fees
- Manage Class-based fees
- Assign fees per class

### 6.2.7 View Payments (8 Screens)
- Payment list
- Payment details
- Filter by student/class/level/method

### 6.2.8 Track Teachers
- Check attendance of teachers during lessons

### 6.2.9 View Results
- Student marks & performance

---

# 6.3 Teacher Module

### 6.3.1 View Time Table
- View personal schedule

### 6.3.2 Lessons Management
- Create Lesson (title, summary, quiz link, subject, video)
- Start Live Stream for lesson
- View Lesson Insights

### 6.3.3 Attendance
- View student attendance list
- Export attendance report

### 6.3.4 Marks Entry
- Add marks per student
- Edit marks
- View previous marks

### 6.3.5 Monthly Tests
- Create tests (Google Sheets link)
- Edit tests
- Delete tests
- View list

---

# 6.4 Student Module

### 6.4.1 View Time Table
- Shows daily/weekly schedule

### 6.4.2 View Subjects
- All enrolled subjects

### 6.4.3 Lesson Viewer
- Live video player
- VOD video player
- Summary
- Quiz
- Comments (optional future feature)

### 6.4.4 Papers Work
- Download worksheets

### 6.4.5 Monthly Tests
- Take tests
- Submit answers
- View results

### 6.4.6 Class Activity
- View multimedia activities

### 6.4.7 School Guidance
- Read guidance articles
- View images and videos

### 6.4.8 Results
- View marks per subject

---

# 7. Video Streaming Requirements

## 7.1 Live Streaming
- Teacher presses “Start Live”
- Laravel backend calls **Cloudflare Stream Live Input API**
- Returns:
  - Stream Key
  - RTMPS URL
- Next.js provides broadcasting UI 

## 7.2 Automatic VOD Recording
- Cloudflare records live stream
- Saves result as VOD asset
- Laravel receives webhook for video completion
- Video ID stored in `lessons_media.cf_vod_video_id`

## 7.3 Video Player Requirements
- Next.js must use Cloudflare Stream Player
- Should support:
  - Live = HLS/DASH
  - Recording = VOD
  - DRM-like token protection (signed URLs)

---

# 8. Database Schema (Corrected)

# Database Tables Specification (tables.md)

This document includes **all database tables** for the E‑School Platform, including the updated `lessons` + `lesson_media` structure.

---

# 1. users
```
id BIGINT PK
user_name STRING UNIQUE
password STRING
phone_number STRING
role ENUM['Manager','Teacher','Student']
email STRING NULLABLE
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- User hasOne Student
- User hasOne Teacher
- User hasOne Manager

---

# 2. students
```
id BIGINT PK
user_id FK → users.id
date_of_birth DATE
full_name STRING
country STRING
state STRING
city STRING
gender ENUM['Male','Female']
level_id FK → levels.id
class_id FK → classes.id
certificate_path STRING
personal_image_path STRING
guardian_name STRING
guardian_relationship STRING
student_phone_number STRING NULLABLE
guardian_phone_number STRING
guardian_email STRING NULLABLE
guardian_address STRING
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Student belongsTo User
- Student belongsTo Level
- Student belongsTo Class
- Student hasMany Attendance
- Student hasMany Payments
- Student hasMany Marks

---

# 3. teachers
```
id BIGINT PK
user_id FK → users.id
date_of_birth DATE
full_name STRING
certificate_path STRING
cv_path STRING
country STRING
state STRING
city STRING
gender ENUM['Male','Female']
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Teacher belongsTo User
- Teacher hasMany Specialization
- Teacher hasMany TeacherTimeTable
- Teacher hasMany TrackTeachers

---

# 4. managers
```
id BIGINT PK
user_id FK → users.id
date_of_birth DATE
full_name STRING
gender ENUM['Male','Female']
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Manager belongsTo User

---

# 5. levels
```
id BIGINT PK
name STRING
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Level hasMany Classes
- Level hasMany Subjects
- Level hasMany Lessons
- Level hasMany PapersWork
- Level hasMany ClassActivity
- Level hasMany MonthlyTests
- Level hasMany TeacherTimeTable
- Level hasMany TrackTeachers
- Level hasMany Students
- Level hasMany Marks
- Level hasMany Attendance

---

# 6. classes
```
id BIGINT PK
name STRING
level_id FK → levels.id
number_of_subjects INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Class belongsTo Level
- Class hasMany Students
- Class hasMany Subjects
- Class hasMany Lessons
- Class hasMany PapersWork
- Class hasMany ClassActivity
- Class hasMany MonthlyTests
- Class hasMany TeacherTimeTable
- Class hasMany TrackTeachers
- Class hasMany Marks
- Class hasMany Attendance

---

# 7. subjects
```
id BIGINT PK
name STRING
level_id FK → levels.id
class_id FK → classes.id
total_lessons INTEGER
total_degree INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Subject belongsTo Level
- Subject belongsTo Class
- Subject hasMany Lessons
- Subject hasMany MonthlyTests
- Subject hasMany PapersWork
- Subject hasMany Marks
- Subject hasMany Attendance
- Subject hasMany TeacherTimeTable
- Subject hasMany TrackTeachers
- Subject hasMany Specialization

---

# 8. specializations
```
id BIGINT PK
teacher_id FK → teachers.id
level_id FK → levels.id
class_id FK → classes.id
subject_id FK → subjects.id
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Specialization belongsTo Teacher
- Specialization belongsTo Level
- Specialization belongsTo Class
- Specialization belongsTo Subject

---

# 9. lessons
```
id BIGINT PK
title STRING
summary TEXT
level_id FK → levels.id
class_id FK → classes.id
subject_id FK → subjects.id
primary_media_id FK → lesson_media.id NULLABLE
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Lesson hasMany LessonMedia
- Lesson belongsTo Subject
- Lesson belongsTo Level
- Lesson belongsTo Class
- Lesson hasOne Quiz

---

# 10. lesson_media
```
id BIGINT PK
lesson_id FK → lessons.id

provider ENUM['cloudflare','external','none'] DEFAULT 'cloudflare'
media_type ENUM['live','vod','uploaded']

source_url STRING NULLABLE

cf_live_input_id STRING NULLABLE
cf_live_playback_id STRING NULLABLE
live_status ENUM['not_started','scheduled','live','ended'] NULLABLE
live_scheduled_at DATETIME NULLABLE
live_started_at DATETIME NULLABLE
live_ended_at DATETIME NULLABLE

cf_vod_video_id STRING NULLABLE
cf_vod_playback_id STRING NULLABLE
thumbnail_url STRING NULLABLE
duration_seconds INTEGER NULLABLE

is_active BOOLEAN DEFAULT TRUE

created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 11. quizzes
```
id BIGINT PK
lesson_id FK → lessons.id
quiz_url STRING
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Quiz belongsTo Lesson

---

# 12. monthly_tests
```
id BIGINT PK
subject_id FK → subjects.id
level_id FK → levels.id
class_id FK → classes.id
test_url STRING
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- MonthlyTest belongsTo Subject
- MonthlyTest belongsTo Level
- MonthlyTest belongsTo Class

---

# 13. papers_work
```
id BIGINT PK
paper_path STRING
level_id FK → levels.id
class_id FK → classes.id
subject_id FK → subjects.id
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- PapersWork belongsTo Level
- PapersWork belongsTo Class
- PapersWork belongsTo Subject

---

# 14. attendance
```
id BIGINT PK
student_id FK → students.id
subject_id FK → subjects.id
level_id FK → levels.id
class_id FK → classes.id
attendance_count INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Attendance belongsTo Student
- Attendance belongsTo Subject
- Attendance belongsTo Class
- Attendance belongsTo Level

---

# 15. teacher_time_table
```
id BIGINT PK
day STRING
start_time TIME
end_time TIME
level_id FK → levels.id
class_id FK → classes.id
subject_id FK → subjects.id
teacher_id FK → teachers.id
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- TeacherTimeTable belongsTo Teacher
- TeacherTimeTable belongsTo Level
- TeacherTimeTable belongsTo Class
- TeacherTimeTable belongsTo Subject

---

# 16. track_teachers
```
id BIGINT PK
lesson_id FK → lessons.id
teacher_id FK → teachers.id
level_id FK → levels.id
class_id FK → classes.id
subject_id FK → subjects.id
day STRING
start_time TIME
end_time TIME
attend BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- TrackTeacher belongsTo Teacher
- TrackTeacher belongsTo Lesson
- TrackTeacher belongsTo Level
- TrackTeacher belongsTo Class
- TrackTeacher belongsTo Subject

---

# 17. fees
```
id BIGINT PK
class_id FK → classes.id
total_fee DOUBLE
minimum_fee DOUBLE
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Fee belongsTo Class
- Class hasOne Fee

---

# 18. payments
```
id BIGINT PK
student_id FK → students.id
payment_method ENUM['visa','cash']
amount DOUBLE
transaction_uid STRING UNIQUE
level_id FK → levels.id NULLABLE
class_id FK → classes.id NULLABLE
guardian_name STRING
guardian_phone_number STRING
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Payment belongsTo Student
- Payment belongsTo Level
- Payment belongsTo Class

---

# 19. class_activities
```
id BIGINT PK
activity_name STRING
image_path STRING NULLABLE
video_path STRING NULLABLE
level_id FK → levels.id
class_id FK → classes.id
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- ClassActivity belongsTo Level
- ClassActivity belongsTo Class

---

# 20. student_guidance
```
id BIGINT PK
guidance TEXT
image_path STRING NULLABLE
video_path STRING NULLABLE
level_id FK → levels.id NULLABLE
class_id FK → classes.id NULLABLE
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- StudentGuidance belongsTo Level (optional)
- StudentGuidance belongsTo Class (optional)

---

# 21. marks
```
id BIGINT PK
student_id FK → students.id
subject_id FK → subjects.id
level_id FK → levels.id
class_id FK → classes.id
degree INTEGER
total_degree INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

Relationships:
- Mark belongsTo Student
- Mark belongsTo Subject
- Mark belongsTo Class
- Mark belongsTo Level



---

# 9. API Endpoints (High-Level Overview)

## 9.1 Auth
- `POST /auth/login`
- `POST /auth/logout`

## 9.2 Users
- `GET /users`
- `POST /users`
- etc.

## 9.3 Lessons & Live Streaming
- `POST /lessons`
- `GET /lessons/:id`
- `POST /lessons/:id/start-live`
- `POST /cloudflare/webhook`

## 9.4 Tests
- Monthly tests CRUD
- Quizzes

## 9.5 Attendance
- POST attendance per lesson view
- GET attendance report

## 9.6 Payments
- CRUD payments

## 9.7 Teacher Time Table
- CRUD

---

# 10. UI/UX Requirements

## 10.1 Manager Dashboard
- Analytics cards
- Quick actions
- Graphs

## 10.2 Teacher Dashboard
- Live streaming panel
- Lessons list
- Students performance chart

## 10.3 Student Dashboard
- Upcoming lessons
- Continue watching
- Quick access to tests

---

# 11. Non‑Functional Requirements (NFR)

### 11.1 Performance
- 1,000 concurrent students must stream without buffering

### 11.2 Security
- JWT tokens
- Role-based access
- Signed Cloudflare playback tokens

### 11.3 Scalability
- Horizontal scaling via Cloudflare + server clusters

### 11.4 Maintainability
- Clean modular Laravel services
- Reusable Next.js components

### 11.5 Availability
- 99.9% uptime target

---

# 12. Acceptance Criteria

- All user stories implemented
- Live streaming fully functional
- VOD saved automatically
- Students can watch live & recorded videos
- Managers can manage every entity
- Payments module functional
- All modules tested E2E
- API documented (Swagger/OpenAPI)

---

# END OF PRD
