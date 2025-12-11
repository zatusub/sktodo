import { AchieveButton } from './components/achieve/AchieveButton';
import './App.css'
import { useState, useEffect } from 'react';
import TaskJama from './task-jama/task-jama';

function App() {
  const [showTaskJama, setShowTaskJama] = useState(false);

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
