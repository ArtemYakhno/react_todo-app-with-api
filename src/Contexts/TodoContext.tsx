import { createContext } from 'react';
import { Todo } from '../types/Todo';

type TodoContextType = {
  onDeleteTodo: (id: number) => Promise<void>;
  onUpdateTodo: (
    id: number,
    data: Partial<Pick<Todo, 'title' | 'completed'>>,
  ) => Promise<void>;
};

export const TodoContext = createContext<TodoContextType>({
  onDeleteTodo: async () => {},
  onUpdateTodo: async () => {},
});
