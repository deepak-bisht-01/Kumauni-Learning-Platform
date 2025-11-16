// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/Home/HomePage";
import LoginRegister from "./components/Auth/LoginRegister";
import Dashboard from "./components/Dashboard/Dashboard";
import Translator from "./components/Translator/Translator"; 
import Stories from "./components/Stories/Stories";
import StoryView from "./components/Stories/StoryView";
import Learning from "./components/Learning/Learning";
import LevelView from "./components/Learning/LevelView";
import LessonView from "./components/Learning/LessonView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/register" element={<LoginRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/translator" element={<Translator />} />
         <Route path="/stories" element={<Stories />} />
         <Route path="/stories/:storyId" element={<StoryView />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/learning/:levelId" element={<LevelView />} />
        <Route path="/learning/:levelId/:lessonId" element={<LessonView />} />
      </Routes>
    </Router>
  );
}

export default App;
