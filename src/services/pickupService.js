import { pickupApi } from "./api";

const unwrapData = (response) => response?.data ?? response;

const buildPickupFormData = (details) => {
  const formData = new FormData();

  Object.entries(details).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });

  return formData;
};

export const createPickup = async (details) => {
  const payload = details.image ? buildPickupFormData(details) : details;
  const response = await pickupApi.create(payload);
  return unwrapData(response);
};

export const getMyPickups = async () => {
  const response = await pickupApi.getAll();
  return unwrapData(response) || [];
};

export const getPickupDetails = async (id) => {
  const response = await pickupApi.getOne(id);
  return unwrapData(response);
};

export const cancelPickup = async (id) => {
  const response = await pickupApi.cancel(id);
  return unwrapData(response);
};
