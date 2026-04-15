import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "todo-app.items";
const FILTERS = {
  all: "all",
  active: "active",
  completed: "completed",
};

const App = () => {
  const [taskText, setTaskText] = useState("");
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });
  const [filter, setFilter] = useState(FILTERS.all);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    switch (filter) {
      case FILTERS.active:
        return items.filter((item) => !item.completed);
      case FILTERS.completed:
        return items.filter((item) => item.completed);
      default:
        return items;
    }
  }, [items, filter]);

  const remainingCount = items.filter((item) => !item.completed).length;
  const completedCount = items.filter((item) => item.completed).length;

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedText = taskText.trim();
    if (!trimmedText) {
      setError("Please enter a task.");
      return;
    }

    const normalizedText = trimmedText.toLowerCase();
    const isDuplicate = items.some(
      (item) => item.text.toLowerCase() === normalizedText,
    );

    if (isDuplicate) {
      setError("This task already exists.");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: trimmedText,
        completed: false,
      },
    ]);
    setTaskText("");
    setError("");
  };

  const toggleCompleted = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setItems((prev) => prev.filter((item) => !item.completed));
  };

  return (
    <div className="app-shell">
      <div className="todo-card">
        <header className="todo-header">
          <div>
            <p className="eyebrow">Todo App</p>
            <h1>Stay productive</h1>
          </div>
          <p className="summary">
            Add tasks, mark them done, and keep your list in sync with local
            storage.
          </p>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <label htmlFor="task-input" className="sr-only">
            Add a new task
          </label>
          <input
            id="task-input"
            type="text"
            value={taskText}
            onChange={(event) => {
              setTaskText(event.target.value);
              if (error) setError("");
            }}
            placeholder="Add a new task"
            className="task-input"
          />
          <button type="submit" className="primary-button">
            Add
          </button>
        </form>
        {error && <div className="form-error">{error}</div>}

        <section className="todo-main">
          <div className="todo-meta">
            <span>
              {remainingCount} task{remainingCount === 1 ? "" : "s"} left
            </span>
            <div className="filters">
              {Object.values(FILTERS).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    filter === value ? "filter-button active" : "filter-button"
                  }
                  onClick={() => setFilter(value)}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              {items.length === 0
                ? "Your todo list is empty. Add a task to get started."
                : "No tasks match this filter."}
            </div>
          ) : (
            <ul className="todo-list">
              {filteredItems.map((item) => (
                <li key={item.id} className="todo-item">
                  <label
                    className={
                      item.completed ? "todo-label completed" : "todo-label"
                    }
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleCompleted(item.id)}
                    />
                    <span>{item.text}</span>
                  </label>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteItem(item.id)}
                    aria-label={`Delete ${item.text}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {completedCount > 0 && (
            <div className="todo-actions">
              <span>{completedCount} completed</span>
              <button
                type="button"
                className="secondary-button"
                onClick={clearCompleted}
              >
                Clear completed
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;
