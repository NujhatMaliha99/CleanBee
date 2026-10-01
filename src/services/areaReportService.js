import { areaReportApi } from "./api";

const unwrapData = (response) => response?.data ?? response;

const buildFormData = (details) => {
  const formData = new FormData();

  Object.entries(details).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });

  return formData;
};

export const getMyAreaReports = async () => {
  const response = await areaReportApi.getAll();
  return unwrapData(response) || [];
};

export const createAreaReport = async (details) => {
  const payload = details.image ? buildFormData(details) : details;
  const response = await areaReportApi.create(payload);
  return unwrapData(response);
};
