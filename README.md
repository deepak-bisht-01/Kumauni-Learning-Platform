# Kumauni Siksha - Kumaoni Language Learning Platform

Kumauni Siksha is a comprehensive language learning platform designed to help users learn Kumaoni, a language spoken in the Kumaon region of Uttarakhand, India. The platform offers interactive lessons, quizzes, stories, and translation services to make language learning engaging and effective.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Setup and Installation](#setup-and-installation)
6. [Database Setup](#database-setup)
7. [Running the Application](#running-the-application)
8. [API Endpoints](#api-endpoints)
9. [Components](#components)
10. [Contributing](#contributing)

## Project Overview

Kumauni Siksha aims to preserve and promote the Kumaoni language through a modern, interactive learning platform. The application provides a structured learning path with different difficulty levels (Beginner to Expert) and various learning modules including vocabulary building, sentence construction, and cultural stories.

## Features
- User Authentication (Registration & Login)
- Dashboard with User Profile
- Learning Modules with Levels and Lessons
- Daily Quizzes
- Story Viewer
- **Kumaoni Translator with Voice Output**
- Accent Analyzer

## Technology Stack

### Frontend
- React.js
- React Router
- Lucide React (Icons)
- CSS3 with modern styling techniques

### Backend
- Node.js
- Express.js
- Supabase (Database and Authentication)

### Database
- PostgreSQL (via Supabase)

### Translation Service
- Python
- Flask
- Translation libraries

## Project Structure

```
kumauni-siksha/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── add-sample-stories.sql
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Auth/
│       │   ├── Dashboard/
│       │   ├── Learning/
│       │   ├── Quiz/
│       │   ├── Stories/
│       │   └── Translator/
│       ├── services/
│       └── App.js
├── translator/
│   └── server.py
├── SUPABASE_SETUP.md
└── README.md
```

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.7 or higher)
- Supabase account
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
```

### Backend Setup
```bash
cd backend
npm install
```

### Translation Service Setup
```bash
cd translator
pip install -r requirements.txt
```

**Note:** The translation service now includes Google Text-to-Speech functionality for voice output of translated text.

## Database Setup

1. Create a Supabase project at [supabase.io](https://supabase.io)
2. Run the SQL scripts in `SUPABASE_SETUP.md` to set up the database schema
3. Create a `backend/.env` file with your Supabase credentials (see `SUPABASE_SETUP.md` for details)

## Running the Application

### Start Backend Server
```bash
cd backend
npm start
```

### Start Frontend Application
```bash
cd frontend
npm start
```

### Start Translation Service
```bash
cd translator
python server.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Dashboard
- `GET /api/dashboard/overview` - Get user dashboard data

### Learning
- `GET /api/learning/levels` - Get all learning levels
- `GET /api/learning/levels/:levelId` - Get content for a specific level
- `GET /api/learning/levels/:levelId/lessons/:lessonId` - Get a specific lesson
- `POST /api/learning/lessons/:lessonId/complete` - Mark lesson as complete

### Quiz
- `GET /api/quiz/daily` - Get daily quiz
- `POST /api/quiz/daily/submit` - Submit daily quiz answers

### Stories
- `GET /api/stories` - Get all stories
- `GET /api/stories/:storyId` - Get a specific story
- `POST /api/stories/:storyId/progress` - Update story progress
- `POST /api/stories/:storyId/favorite` - Toggle story favorite
- `POST /api/stories/:storyId/complete` - Mark story as complete

### Translation Service
- `POST /translate` - Translate text from English to Kumaoni
- `POST /text-to-speech` - Convert text to speech (voice output)
- `POST /analyze-accent` - Analyze Kumaoni accent in audio

## Components

### Auth
- `LoginRegister.jsx` - Handles user authentication

### Dashboard
- `Dashboard.jsx` - Main user dashboard with progress tracking

### Learning
- `Learning.jsx` - Main learning interface
- `LevelView.jsx` - Displays content for a specific level
- `LessonView.jsx` - Shows individual lessons
- `ModuleView.jsx` - Displays learning modules
- `ModuleOptions.jsx` - Shows module options for a level
- `ModuleItemView.jsx` - Displays individual module items
- `SubmoduleView.jsx` - Shows submodule content

### Quiz
- `DailyQuiz.jsx` - Daily quiz interface

### Stories
- `Stories.jsx` - List of all stories
- `StoryView.jsx` - Individual story view

### Translator
- `Translator.jsx` - Translation service interface

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is for educational purposes and does not have a specific license.