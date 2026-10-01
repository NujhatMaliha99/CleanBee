import { volunteerApi } from "./api";

const unwrapData = (response) => response?.data ?? response;

export const updateVolunteerMode = async (enabled) => {
  const response = await volunteerApi.updateMode(enabled);
  return response.user;
};

export const updateVolunteerAvailability = async (availability) => {
  const response = await volunteerApi.updateAvailability(availability);
  return response.user;
};

export const getAvailableTasks = async () => {
  const response = await volunteerApi.getAvailableTasks();
  return unwrapData(response) || [];
};

export const getMyTasks = async () => {
  const response = await volunteerApi.getMyTasks();
  return unwrapData(response) || [];
};

export const getTaskDetails = async (id) => {
  const response = await volunteerApi.getOne(id);
  return unwrapData(response);
};

export const claimTask = async (id) => {
  const response = await volunteerApi.claimTask(id);
  return unwrapData(response);
};

export const startTask = async (id) => {
  const response = await volunteerApi.startTask(id);
  return unwrapData(response);
};

export const completeTask = async (id) => {
  const response = await volunteerApi.completeTask(id);
  return unwrapData(response);
};
