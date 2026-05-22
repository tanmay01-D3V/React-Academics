import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTodo,
  clearCompleted,
  deleteTodo,
  selectVisibleTodos,
  setFilter,
  toggleTodo,
} from '../features/todos/todosSlice';

const filters = ['all', 'active', 'completed'];

export default function TodoLab() {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const todos = useSelector(selectVisibleTodos);
  const filter = useSelector((state) => state.todos.filter);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    dispatch(addTodo(text.trim()));
    setText('');
  };

  return (
    <section className="lab-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Slice 3</p>
          <h2>Todo list with selector filtering</h2>
        </div>
        <button className="secondary-button" type="button" onClick={() => dispatch(clearCompleted())}>
          Clear done
        </button>
      </div>

      <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
        <label className="field-label">
          New lab task
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Try: Build a notes slice"
          />
        </label>
        <button className="primary-button self-end" type="submit">
          Add todo
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filterName) => (
          <button
            className={`filter-button ${filter === filterName ? 'is-active' : ''}`}
            key={filterName}
            type="button"
            onClick={() => dispatch(setFilter(filterName))}
          >
            {filterName}
          </button>
        ))}
      </div>

      <ul className="mt-4 grid gap-2">
        {todos.map((todo) => (
          <li className="todo-row" key={todo.id}>
            <label>
              <input
                checked={todo.completed}
                type="checkbox"
                onChange={() => dispatch(toggleTodo(todo.id))}
              />
              <span className={todo.completed ? 'line-through opacity-60' : ''}>{todo.text}</span>
            </label>
            <button type="button" onClick={() => dispatch(deleteTodo(todo.id))}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
