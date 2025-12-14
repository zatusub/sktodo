import { AchieveButton } from './components/achieve/AchieveButton';
import './App.css'
import { TodoDetailDisplay } from './components/achieve/TodoDetailDisplay';
import { CrossButton } from './components/achieve/CrossButton';
// import { Main } from './components/home/main'; // This file does not exist

function App() {

  return (
    <>
      <AchieveButton />
      <TodoDetailDisplay />
      <CrossButton />
      {/* <Main /> */}
    </>
   
  )
}

export default App
