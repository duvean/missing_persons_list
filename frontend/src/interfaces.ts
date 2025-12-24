export interface Todo {
  id: number;
  text: string;
  done: boolean;
}
export const Todo = undefined;

export interface Group {
  id: number;
  name: string;
  todos: Todo[];
}
export const Group = undefined;

export interface Data {
  groups: Group[];
}
export const Data = undefined;

export interface WbItem {
    id: number;
    wbId: number;
    name: string;
    currentPrice: number;
    oldPrice: number;
    imageUrl: string;
    stock?: number;
}
export const WbItem = undefined;
