import axios from "axios";

const API_URL = 'http://localhost:3000/todos';

type NewTask = {
  title: string,
  description: string,
  completed: boolean,
}

const getTasks = () => {
  return axios.get(API_URL)
    .then((response) => response.data);
}

const createTask = (task: NewTask) => {
  return axios.post(API_URL, task)
    .then((response) => response.data);
};

const updateTask = (task: NewTask, id: Number) => {
  return axios.patch(`${API_URL}/${id}`, task)
    .then((response) => response.data);
};

const removeTask = (id: Number) => {
  return axios.delete(`${API_URL}/${id}`)
    .then((response) => response.data);
}

export { createTask, updateTask, removeTask, getTasks };
