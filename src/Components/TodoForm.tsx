import React, { useContext, useEffect, useState } from 'react';
import { Todo } from '../types/Todo';
import { filterTodo } from '../Services/Todo';
import classNames from 'classnames';
import { FilterTodo } from '../types/FilterTodo';
import { TodoContext } from '../Contexts/TodoContext';

type Props = {
  todos: Todo[];
  inputRef?: React.RefObject<HTMLInputElement>;
  onSubmit: (title: string) => Promise<void>;
  onError: (message: string, isServerError: boolean) => void;
};

const TodoFormComponent: React.FC<Props> = ({
  todos,
  onSubmit,
  onError,
  inputRef,
}) => {
  const [query, setQuery] = useState('');
  const [isSubmited, setIsSubmited] = useState(false);
  const [isStartUpdate, setIsStartUpdate] = useState(false);
  const { onUpdateTodo: onCompleteTodo } = useContext(TodoContext);

  const completedTodos = React.useMemo(
    () => filterTodo(todos, FilterTodo.completed),
    [todos],
  );

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef, isSubmited]);

  const resetForm = () => {
    setQuery('');
  };

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normailedQuery = query.trim();

    if (!normailedQuery) {
      onError('Title should not be empty', false);

      return;
    }

    try {
      setIsSubmited(true);
      await onSubmit(normailedQuery);
      resetForm();
    } catch {
    } finally {
      setIsSubmited(false);
      inputRef?.current?.focus();
    }
  };

  const completeAll = async () => {
    const action = completedTodos.length !== todos.length;
    const todosToUpdate = todos.filter(todo => todo.completed !== action);

    if (todosToUpdate.length === 0) {
      return;
    }

    setIsStartUpdate(true);

    const promises = todosToUpdate.map(todo =>
      onCompleteTodo(todo.id, { completed: action }),
    );

    try {
      await Promise.all(promises);
    } finally {
      setIsStartUpdate(false);
    }
  };

  return (
    <header className="todoapp__header">
      {todos.length > 0 && (
        <button
          type="button"
          onClick={completeAll}
          disabled={isStartUpdate}
          className={classNames('todoapp__toggle-all', {
            active: todos.length === completedTodos.length,
          })}
          data-cy="ToggleAllButton"
        />
      )}

      <form onSubmit={handleSubmit}>
        <input
          onChange={event => handleChangeInput(event)}
          ref={inputRef}
          value={query}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          disabled={isSubmited}
        />
      </form>
    </header>
  );
};

export const TodoForm = React.memo(TodoFormComponent);
