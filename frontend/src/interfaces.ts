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
    article: number;
    name: string;
    currentPrice: number;
    oldPrice: number;
    targetPrice: number;
    lastNotifiedPrice: number | null;
    imageUrl: string;
    stock?: number;
}
export const WbItem = undefined;
