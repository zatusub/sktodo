import { AchieveButton } from './components/achieve/AchieveButton';
import './App.css'
import { TodoDetailDisplay } from './components/achieve/TodoDetailDisplay';
import { CrossButton } from './components/achieve/CrossButton.tsx';
function App() {

  return (
    <>
      <AchieveButton />
      <TodoDetailDisplay />
      <CrossButton />
    </>
   
  )
}

export default App
