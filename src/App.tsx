import { AchieveButton } from './components/achieve/AchieveButton';
import './App.css'
import { TodoDetailDisplay } from './components/achieve/TodoDetailDisplay';
import { CrossButton } from './components/achieve/CrossButton';
import { useState, useEffect } from 'react';
import TaskJama from './task-jama/task-jama';
import Calendar from './components/calendar/Calendar';
import { Auth } from './components/authorize/auth';
import { useNavigate } from 'react-router-dom';
function App() {
  const [showTaskJama, setShowTaskJama] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const todos = [
    { content: "プロジェクト提出", deadline: "2025-12-15" },
    { content: "会議準備", deadline: "2025-12-20" },
    { content: "レポート作成", deadline: "2025-12-15" }
  ];

  useEffect(() => {
    if (showTaskJama) {
      document.body.classList.add('full-bleed');
    } else {
      document.body.classList.remove('full-bleed');
    }
    return () => document.body.classList.remove('full-bleed');
  }, [showTaskJama]);

  // Handle Login
  const handleLogin = (id: string) => {
    setUserId(id);
    localStorage.setItem('sktodo_user_id', id);
  };

  if (!userId) {
    return <Auth onLogin={handleLogin} />;
  }

  if (showTaskJama) {
    return (
      <>
        <TaskJama userId={userId} />
        <Calendar todos={todos} />
      </>
    );
  }

  return (
    <>
      <AchieveButton />
      <TodoDetailDisplay />
      <CrossButton />
      <div style={{ position: 'fixed', top: 12, right: 12, display: 'flex', gap: '8px' }}>
        <button onClick={() => navigate('/matching')} style={{ backgroundColor: '#ff4444', color: 'white' }}>対戦をする</button>
        <button onClick={() => setShowTaskJama(true)}>友達のタスクを邪魔しよう</button>
      </div>
    </>
   
  )
}

export default App
