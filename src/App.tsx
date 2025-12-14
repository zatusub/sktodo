import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskJama from './task-jama/task-jama';
import Calendar from './components/calendar/Calendar';
import { Auth } from './components/authorize/auth';
import HomePage from './home/HomePage';
import './App.css';

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
  };

  if (!userId) {
    return <Auth onLogin={handleLogin} />;
  }

  if (showTaskJama) {
    return (
      <>
        <TaskJama userId={userId} />
        <Calendar todos={todos} />
        <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 10000 }}>
             <button onClick={() => setShowTaskJama(false)}>戻る</button>
        </div>
      </>
    );
  }

  return (
    <HomePage
      userId={userId}
      onGoJama={() => setShowTaskJama(true)}
      onGoBilling={() => navigate('/money')}
      onGoBattle={() => alert('バトル画面はまだ未実装！')}
    />
  );
}

export default App;
