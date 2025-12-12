import { AchieveButton } from './components/achieve/AchieveButton';
import './App.css'
import { useState, useEffect } from 'react';
import TaskJama from './task-jama/task-jama';
import Calendar from './components/calendar/Calendar';

function App() {
  const [showTaskJama, setShowTaskJama] = useState(false);
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

  if (showTaskJama) {
    return (
      <>
        <TaskJama />
        <Calendar todos={todos} />
      </>
    );
  }

  return (
    <>
      <AchieveButton />
      <div style={{ position: 'fixed', top: 12, right: 12 }}>
        <button onClick={() => setShowTaskJama(true)}>友達のタスクを邪魔しよう</button>
      </div>
    </>
  )
}

export default App
