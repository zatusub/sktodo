type TodoType = {
  id: string;
  name: string;
  completed: boolean;
};

type Props = {
  todo: TodoType;
  toggleTodo: (id: string) => void;
};

function Todo({ todo, toggleTodo }: Props) {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id)}
        />
        {todo.name}
      </label>
    </div>
  );
}

export default Todo;
