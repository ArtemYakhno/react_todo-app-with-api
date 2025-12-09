/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useContext, useState, useEffect, useRef } from 'react';
import { TodoContext } from '../Contexts/TodoContext';
import { Todo } from '../types/Todo';
import classNames from 'classnames';

type Props = {
  todo: Todo;
  selectedTodoId?: number | null;
  isLoading?: boolean;
  onSelect?: (todoId: number | null) => void;
};

const TodoItemComponent: React.FC<Props> = ({
  todo,
  selectedTodoId,
  isLoading = false,
  onSelect = () => {},
}) => {
  const { onDeleteTodo, onUpdateTodo } = useContext(TodoContext);
  const [query, setQuery] = useState(todo.title);
  const [isSubmited, setIsSubmited] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedTodoId === todo.id) {
      inputRef.current?.focus();
    }
  }, [selectedTodoId, todo.id]);

  const handleUpdateTodo = async (todoId: number) => {
    const trimmed = query.trim();

    if (trimmed === todo.title) {
      onSelect(null);

      return;
    }

    if (!trimmed) {
      try {
        await onDeleteTodo(todoId);
        onSelect(null);
      } catch {}

      return;
    }

    try {
      setIsSubmited(true);
      await onUpdateTodo(todoId, { title: trimmed });
      onSelect(null);
    } catch {
    } finally {
      setIsSubmited(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleUpdateTodo(todo.id);
  };

  const handleBlur = () => {
    if (isSubmited) {
      return;
    }

    handleUpdateTodo(todo.id);
  };

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setQuery(todo.title);
      onSelect(null);
    }
  };

  const inputId = `todo-${todo.id}`;

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: todo.completed })}
    >
      <label htmlFor={inputId} className="todo__status-label">
        <input
          id={inputId}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => onUpdateTodo(todo.id, { completed: !todo.completed })}
          disabled={isLoading}
        />
      </label>

      {selectedTodoId !== todo.id ? (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => onSelect?.(todo.id)}
          >
            {todo.title}
          </span>

          <button
            type="button"
            data-cy="TodoDelete"
            className="todo__remove"
            onClick={() => onDeleteTodo(todo.id)}
            disabled={isLoading}
          >
            ×
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onBlur={handleBlur}
            onKeyUp={handleKeyUp}
            disabled={isSubmited}
          />
        </form>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', { 'is-active': isLoading })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};

TodoItemComponent.displayName = 'TodoItemComponent';

export const TodoItem = React.memo(TodoItemComponent);
