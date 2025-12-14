import "./App.css";
import TodoList from "./home/TodoList";
import { v4 as uuidv4 } from "uuid";
import { useState, useRef, useEffect } from "react";

type TodoType = {
  id: string;
  name: string;
  completed: boolean;
};

function App() {
  // 🔽 起動時に localStorage から読み込む
  const [todos, setTodos] = useState<TodoType[]>(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const todoNameRef = useRef<HTMLInputElement>(null);

  // 🔽 todos が変わるたびに localStorage に保存
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = () => {
    const name = todoNameRef.current?.value.trim();
if (!name) return;


    setTodos((prevTodos) => [
      ...prevTodos,
      {
        id: uuidv4(),
        name,
        completed: false,
      },
    ]);

    if (todoNameRef.current) {
      todoNameRef.current.value = "";
    }
  };

  const toggleTodo = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };

  const handleClear = () => {
    setTodos((prevTodos) =>
      prevTodos.filter((todo) => !todo.completed)
    );
  };

  return (
    <div>
      <TodoList todos={todos} toggleTodo={toggleTodo} />

      <input type="text" ref={todoNameRef} />
      <button onClick={handleAddTodo}>追加</button>
      <button onClick={handleClear}>完了済みを削除</button>

      <div>
        残りのTodo: {todos.filter((todo) => !todo.completed).length}
      </div>
    </div>
  );
}

export default App;
