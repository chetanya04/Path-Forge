import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth.js/login';
import Register from './pages/Auth.js/register';
import Home from './pages/profile';
import CareerSuggestion from './pages/careerSuggestion';
import Chat from './pages/Chat';
import JobTracker from './pages/jobTracker';
import SkillGap from './pages/skillGap';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
         <Route path="/career-suggestion" element={<CareerSuggestion />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/jobs" element={<JobTracker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;