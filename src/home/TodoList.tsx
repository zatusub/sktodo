import Todo from "./Todo";

type TodoType = {
  id: string;
  name: string;
  completed: boolean;
};

type Props = {
  todos: TodoType[];
  toggleTodo: (id: string) => void;
};

function TodoList({ todos, toggleTodo }: Props) {
  return (
    <>
      {todos.map((todo) => (
        <Todo
          key={todo.id}
          todo={todo}
          toggleTodo={toggleTodo}
        />
      ))}
    </>
  );
}

export default TodoList;
