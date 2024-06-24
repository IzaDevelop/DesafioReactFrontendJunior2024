import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { CaretDown, X } from "@phosphor-icons/react";
import api from "../services/api";

interface Todo {
  id: number;
  title: string;
  isDone: boolean;
}

export function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "active">("all");
  const [hoveredTodoId, setHoveredTodoId] = useState<number | null>(null);
  const [allCompleted, setAllCompleted] = useState(false);

  useEffect(() => {
    // Fetch todos from API
    api.get('/todos')
      .then(response => {
        setTodos(response.data);
        setFilteredTodos(response.data);
      })
      .catch(error => console.error("Error fetching todos:", error));
  }, []);

  // Add or search a todo
  const handleAddOrSearchTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === "") return;

    const trimmedNewTodo = newTodo.trim().toLowerCase();
    const existingTodo = todos.find(todo => todo.title.toLowerCase() === trimmedNewTodo);

    if (existingTodo) {
      // Filter to show only the existing todo
      setFilteredTodos([existingTodo]);
    } else {
      // Add new todo
      const newId = todos.length + 1;
      const newTodoItem: Todo = {
        id: newId,
        title: newTodo.trim(),
        isDone: false
      };
      const updatedTodos = [...todos, newTodoItem];
      setTodos(updatedTodos);
      applyFilter(filter, updatedTodos);
    }

    setNewTodo("");
  };

  // Start editing a todo
  const handleEditStart = (todo: Todo) => {
    setEditingTodo(todo);
  };

  // Save the edited todo
  const handleEditSave = () => {
    if (!editingTodo || editingTodo.title.trim() === "") return;

    const updatedTodos = todos.map(todo =>
      todo.id === editingTodo.id ? { ...todo, title: editingTodo.title } : todo
    );
    setTodos(updatedTodos);
    applyFilter(filter, updatedTodos);
    setEditingTodo(null);
  };

  // Toggle the completion status of a todo
  const handleToggleStatus = (id: number) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
    );
    setTodos(updatedTodos);
    applyFilter(filter, updatedTodos);
  };

  // Delete a todo
  const handleDeleteTodo = (id: number) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    applyFilter(filter, updatedTodos); // Apply filter after deletion
  };

  // Count the number of active todos
  const countActiveTodos = () => {
    return todos.reduce((count, todo) => {
      return todo.isDone ? count : count + 1;
    }, 0);
  };

  // Apply the current filter to the todos
  const applyFilter = (filterToApply: "all" | "completed" | "active", todosToFilter: Todo[]) => {
    switch (filterToApply) {
      case "completed":
        setFilteredTodos(todosToFilter.filter(todo => todo.isDone));
        break;
      case "active":
        setFilteredTodos(todosToFilter.filter(todo => !todo.isDone));
        break;
      default:
        setFilteredTodos(todosToFilter);
        break;
    }
  };

  // Change the filter
  const handleFilterChange = (newFilter: "all" | "completed" | "active") => {
    setFilter(newFilter);
    applyFilter(newFilter, todos);
  };

  // Mark all as completed or active
  const handleToggleAllTodos = () => {
    const updatedTodos = todos.map(todo => ({
      ...todo,
      isDone: !allCompleted
    }));
    setTodos(updatedTodos);
    setAllCompleted(!allCompleted);
    applyFilter(filter, updatedTodos);
  };

  // Clear completed todos
  const handleClearcompleted = () => {
    const remainingTodos = todos.filter(todo => !todo.isDone);
    setTodos(remainingTodos);
    applyFilter(filter, remainingTodos);
  };

  return (
    <Layout>
      <article className="w-full">
        <form onSubmit={handleAddOrSearchTodo} className="w-full">
          <div className="relative">
            <div className="absolute h-full flex items-center justify-center w-10">
              <button type="button" onClick={handleToggleAllTodos}>
                <CaretDown
                  size={20}
                  weight="bold"
                  className="text-zinc-400 hover:text-zinc-600"
                />
              </button>
            </div>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className={`ps-10 py-5 w-full text-xl md:text-2xl placeholder-italic placeholder-opacity-50 placeholder-font-light border-neutral-300  ${todos.length > 0 ? "border-x border-t" : "border"}`}
            />
          </div>
        </form>

        {todos.length > 0 && (
          <>
            <section className="bg-white">
              <ul className="border border-neutral-300">
                {filteredTodos.map(todo => (
                  <li
                    key={todo.id}
                    className={`flex justify-between items-center border-b border-neutral-200 last:border-none ${todo.isDone ? "text-neutral-400" : ""}`}
                    onMouseEnter={() => setHoveredTodoId(todo.id)}
                    onMouseLeave={() => setHoveredTodoId(null)}
                  >
                    <div className="flex items-center w-full relative">
                      <input
                        type="checkbox"
                        checked={todo.isDone}
                        onChange={() => handleToggleStatus(todo.id)}
                        className="absolute left-3 rounded-full"
                      />
                      {editingTodo?.id === todo.id ? (
                        <input
                          type="text"
                          value={editingTodo.title}
                          onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                          onBlur={handleEditSave}
                          onKeyPress={(e) => e.key === 'Enter' && handleEditSave()}
                          autoFocus
                          className="w-full h-full border border-red/50 focus:outline-none text-xl ps-14 p-3"
                        />
                      ) : (
                        <span
                          onDoubleClick={() => handleEditStart(todo)}
                          style={{ textDecoration: todo.isDone ? "line-through" : "none" }}
                          className="w-full ps-14 p-3 text-xl"
                        >
                          {todo.title}
                        </span>
                      )}
                    </div>
                    {hoveredTodoId === todo.id && !editingTodo && (  // Ocultar X quando editando
                      <div className="flex justify-center pe-3">
                        <button onClick={() => handleDeleteTodo(todo.id)}>
                          <X size={20} weight="bold" className="text-zinc-400 hover:text-red/50" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <div className={`w-full flex flex-wrap justify-center md:justify-between gap-5 p-3 border-neutral-300 ${todos.length > 0 ? "border-x border-b" : "border"}`}>
                <p>{countActiveTodos()} item(s) left!</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleFilterChange("all")}
                    className={`w-10 rounded border ${filter === "all" ? "border-red/50" : "border-transparent"} hover:border-red/50`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange("active")}
                    className={`w-14 rounded border ${filter === "active" ? "border-red/50" : "border-transparent"} hover:border-red/50`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleFilterChange("completed")}
                    className={`w-24 rounded border ${filter === "completed" ? "border-red/50" : "border-transparent"} hover:border-red/50`}
                  >
                    Completed
                  </button>
                </div>
                <button
                  onClick={handleClearcompleted}
                  className="hover:underline"
                >
                  Clear completed
                </button>
              </div>
            </section>
            <div className="flex flex-col items-center">
              <div className="w-[calc(100%-5px)] h-1.5 bg-white border-x border-b border-neutral-300 drop-shadow"></div>
              <div className="w-[calc(100%-10px)] h-1.5 bg-white border-x border-b border-neutral-300 drop-shadow"></div>
            </div>
          </>
        )}
      </article>
    </Layout>
  );
}