import { AchieveButton } from './components/achieve/AchieveButton';
import './App.css'
import { TodoDetailDisplay } from './components/achieve/TodoDetailDisplay';
import { CrossButton } from './components/achieve/CrossButton';
import { useState, useEffect } from 'react';
import TaskJama from './task-jama/task-jama';
import Calendar from './components/calendar/Calendar';
import { Auth } from './components/authorize/auth';
function App() {
  const [showTaskJama, setShowTaskJama] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
      <div style={{ position: 'fixed', top: 12, right: 12 }}>
        <button onClick={() => setShowTaskJama(true)}>友達のタスクを邪魔しよう</button>
      </div>
    </>
   
  )
}

export default App
