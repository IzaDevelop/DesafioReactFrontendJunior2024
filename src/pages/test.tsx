import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { CaretDown, X } from "@phosphor-icons/react";
import api from "../services/api";

interface Todo {
  id: number;
  title: string;
  isDone: boolean;
}

export function Test() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editTodoText, setEditTodoText] = useState("");
  const [hoveredTodoId, setHoveredTodoId] = useState<number | null>(null);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "active">("all");
  const [toggleAllCompleted, setToggleAllCompleted] = useState(false);

  useEffect(() => {
    api.get('/todos')
      .then(response => {
        setTodos(response.data);
        setFilteredTodos(response.data);
      })
      .catch(error => console.error("Error fetching todos:", error));
  }, []);

  // Add a new todo
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === "") return;

    const existingTodo = todos.find(todo => todo.title.toLowerCase() === newTodo.trim().toLowerCase());
    if (existingTodo) {
      setFilteredTodos([existingTodo]);
      return;
    }

    const newId = todos.length + 1;
    const newTodoItem: Todo = {
      id: newId,
      title: newTodo.trim(),
      isDone: false
    };
    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    applyFilter(updatedTodos);
    setNewTodo("");
  };

  // Start editing a todo
  const handleEditStart = (id: number, initialText: string) => {
    setEditingTodoId(id);
    setEditTodoText(initialText);
  };

  // Change the edited todo text
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTodoText(e.target.value);
  };

  // Save the edited todo
  const handleEditSave = (id: number) => {
    if (editTodoText.trim() === "") return;
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, title: editTodoText } : todo
    );
    setTodos(updatedTodos);
    applyFilter(updatedTodos);
    setEditingTodoId(null);
  };

  // Handle pressing Enter to save edited todo
  const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === 'Enter') {
      handleEditSave(id);
    }
  };

  // Changing status of a todo of Active to Completed (Check)
  const handleToggleCompletion = (id: number) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
    );
    setTodos(updatedTodos);
    applyFilter(updatedTodos);
  };

  // Delete a todo
  const handleDeleteTodo = (id: number) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    applyFilter(updatedTodos);
  };

  // Count the number of active (not completed) todos
  const countActiveTodos = () => {
    return todos.reduce((count, todo) => {
      return todo.isDone ? count : count + 1;
    }, 0);
  };

  // Change the filter
  const handleFilterChange = (newFilter: "all" | "completed" | "active") => {
    setFilter(newFilter);
    filterTodos(newFilter);
  };

  // Apply the current filter to the todos
  const applyFilter = (todosToFilter: Todo[]) => {
    filterTodos(filter, todosToFilter);
  };

  // Toggle all todos between completed and active
  const toggleAllTodos = () => {
    setToggleAllCompleted(!toggleAllCompleted);
  };

  useEffect(() => {
    // Update todos based on toggleAllCompleted state
    const updatedTodos = todos.map(todo => ({
      ...todo,
      isDone: toggleAllCompleted
    }));
    setTodos(updatedTodos);
    applyFilter(updatedTodos);
  }, [toggleAllCompleted]);

  // Filter todos based on the filter type
  const filterTodos = (filterToApply: "all" | "completed" | "active", todosToFilter: Todo[] = todos) => {
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

  // Clear completed todos
  const handleClearcompleted = () => {
    const remainingTodos = todos.filter(todo => !todo.isDone);
    setTodos(remainingTodos);
    applyFilter(remainingTodos);
  };

  return (
    <Layout>
      <article className="w-full">
        <form onSubmit={handleAddTodo} className="w-full">
          <div className="relative">
            <div className="absolute h-full flex items-center justify-center w-10">
              <button type="button" onClick={toggleAllTodos}>
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
                        onChange={() => handleToggleCompletion(todo.id)}
                        className="absolute left-3 rounded-full"
                      />
                      {editingTodoId === todo.id ? (
                        <input
                          type="text"
                          value={editTodoText}
                          onChange={handleEditChange}
                          onBlur={() => handleEditSave(todo.id)}
                          onKeyPress={(e) => handleEditKeyPress(e, todo.id)}
                          autoFocus
                          className="w-full h-full border border-red/50 focus:outline-none text-xl ps-14 p-3"
                        />
                      ) : (
                        <span
                          onDoubleClick={() => handleEditStart(todo.id, todo.title)}
                          style={{ textDecoration: todo.isDone ? "line-through" : "none" }}
                          className="w-full ps-14 p-3 text-xl"
                        >
                          {todo.title}
                        </span>
                      )}
                    </div>
                    {editingTodoId !== todo.id && (
                      <div className={hoveredTodoId === todo.id ? "visible flex justify-center pe-3" : "invisible flex justify-center"}>
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
            <div className='flex flex-col items-center'>
              <div className='w-[calc(100%-5px)] h-1.5 bg-white border-x border-b border-neutral-300 drop-shadow'></div>
              <div className='w-[calc(100%-10px)] h-1.5 bg-white border-x border-b border-neutral-300 drop-shadow'></div>
            </div>
          </>
        )}
      </article>
    </Layout>
  );
}
