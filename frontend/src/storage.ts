import { Data } from "./interfaces";

export const loadData = (): Data => {
  const data = localStorage.getItem("todoData");
  return data ? JSON.parse(data) : { groups: [] };
};

export const saveData = (data: Data) => {
  localStorage.setItem("todoData", JSON.stringify(data));
};
