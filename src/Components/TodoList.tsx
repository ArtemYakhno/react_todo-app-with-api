import React, { useState } from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

type Props = {
  todos: Todo[];
  tempTodo: Todo | null;
  loadingIds: number[];
};

const TodoListComponent: React.FC<Props> = ({
  todos,
  tempTodo,
  loadingIds,
}) => {
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);

  return (
    <section className="todoapp__main" data-cy="TodoList">
      <TransitionGroup component={null}>
        {todos.map(todo => {
          const isLoading = loadingIds.includes(todo.id);

          return (
            <CSSTransition
              key={`todo-${todo.id}`}
              timeout={300}
              classNames="item"
              appear={true}
            >
              <TodoItem
                todo={todo}
                selectedTodoId={selectedTodoId}
                isLoading={isLoading}
                onSelect={setSelectedTodoId}
              />
            </CSSTransition>
          );
        })}

        {tempTodo && (
          <CSSTransition key="temp" timeout={300} classNames="temp-item">
            <TodoItem todo={tempTodo} isLoading={true} />
          </CSSTransition>
        )}
      </TransitionGroup>
    </section>
  );
};

export const TodoList = React.memo(TodoListComponent);
