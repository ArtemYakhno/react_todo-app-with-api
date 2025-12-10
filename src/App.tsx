/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UserWarning } from './UserWarning';
import * as todoApi from './api/todos';
import { TodoForm } from './Components/TodoForm';
import { TodoList } from './Components/TodoList';
import { TodoFooter } from './Components/TodoFooter';
import { Todo } from './types/Todo';
import { FilterTodo } from './types/FilterTodo';
import { filterTodo } from './Services/Todo';
import { ErrorNotification } from './Components/ErrorNotification';
import { AppError } from './types/Errors';
import { TodoContext } from './Contexts/TodoContext';
export const App: React.FC = () => {
  const [todosFromServer, setTodosFromServer] = useState<Todo[]>([]);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<FilterTodo>(FilterTodo.all);
  const [errorMessage, setErrorMessage] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerCloseId = useRef(0);

  const addErrorMessage = useCallback(
    (message: string, isServerError: boolean) => {
      setErrorMessage({ message, isServerError });
      timerCloseId.current = window.setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    },
    [],
  );

  const clearErrorMessage = useCallback(() => {
    window.clearTimeout(timerCloseId.current);
    timerCloseId.current = 0;
    setErrorMessage(null);
  }, []);

  const addLoadingId = (id: number) => {
    setLoadingIds(prev => [...prev, id]);
  };

  const removeLoadingId = (id: number) => {
    setLoadingIds(prev => prev.filter(loadingId => loadingId !== id));
  };

  const focusFormInput = () => {
    inputRef.current?.focus();
  };

  const getTodosFromServer = useCallback(async () => {
    try {
      setErrorMessage(null);
      setLoading(true);
      const response = await todoApi.getTodos();

      setTodosFromServer(
        response.map(todo => ({
          ...todo,
          nodeRef: createRef<HTMLDivElement>(),
        })),
      );
    } catch (error) {
      addErrorMessage('Unable to load todos', true);
    } finally {
      setLoading(false);
    }
  }, [addErrorMessage]);

  const addTodo = useCallback(
    async (title: string) => {
      const newTodo: Todo = {
        id: 0,
        userId: todoApi.USER_ID,
        title,
        completed: false,
      };

      setErrorMessage(null);
      setTempTodo(newTodo);

      try {
        const created = await todoApi.addTodo(newTodo);

        setTodosFromServer(prev => [...prev, created]);
      } catch {
        addErrorMessage('Unable to add a todo', true);
        throw new Error();
      } finally {
        setTempTodo(null);
        setTimeout(focusFormInput, 0);
      }
    },
    [addErrorMessage],
  );

  const deleteTodo = useCallback(
    async (id: number) => {
      addLoadingId(id);
      try {
        await todoApi.deleteTodo(id);

        setTodosFromServer(prev => prev.filter(todo => todo.id !== id));
        focusFormInput();
      } catch (error) {
        addErrorMessage('Unable to delete a todo', true);
        throw new Error();
      } finally {
        removeLoadingId(id);
      }
    },
    [addErrorMessage],
  );

  const updateTodo = useCallback(
    async (id: number, data: Partial<Pick<Todo, 'title' | 'completed'>>) => {
      addLoadingId(id);
      try {
        const updatedTodo = await todoApi.updateTodo(id, data);

        setTodosFromServer(prev =>
          prev.map(todo =>
            todo.id === id ? { ...todo, ...updatedTodo } : todo,
          ),
        );
      } catch (error) {
        addErrorMessage('Unable to update a todo', true);

        throw new Error();
      } finally {
        removeLoadingId(id);
      }
    },
    [addErrorMessage],
  );

  useEffect(() => {
    getTodosFromServer();
    inputRef.current?.focus();
  }, [getTodosFromServer]);

  const filteredTodos = useMemo(() => {
    if (todosFromServer.length === 0) {
      return [];
    }

    return filterTodo(todosFromServer, filter);
  }, [filter, todosFromServer]);

  const isTodoListVisible = filteredTodos.length > 0 && !loading;

  const isTodoFooterVisible = todosFromServer.length > 0 && !loading;

  if (!todoApi.USER_ID) {
    return <UserWarning />;
  }

  return (
    <TodoContext.Provider
      value={{ onDeleteTodo: deleteTodo, onUpdateTodo: updateTodo }}
    >
      <div className="todoapp">
        <h1 className="todoapp__title">todos</h1>

        <div className="todoapp__content">
          <TodoForm
            todos={todosFromServer}
            inputRef={inputRef}
            onSubmit={addTodo}
            onError={addErrorMessage}
          />
          {isTodoListVisible && (
            <TodoList
              todos={filteredTodos}
              tempTodo={tempTodo}
              loadingIds={loadingIds}
            />
          )}
          {isTodoFooterVisible && (
            <TodoFooter
              currentFilter={filter}
              todos={todosFromServer}
              onChangeFilter={setFilter}
            />
          )}
        </div>
        <ErrorNotification
          errorMessage={errorMessage?.message}
          onReset={clearErrorMessage}
        />
      </div>
    </TodoContext.Provider>
  );
};
