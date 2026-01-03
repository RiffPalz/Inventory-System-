import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL + "/api/notifications";

export const fetchNotifications = async (token) => {
  const res = await axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const fetchUnreadCount = async (token) => {
  const res = await axios.get(`${API}/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.unread;
};

export const markAsRead = async (id, token) => {
  await axios.patch(
    `${API}/${id}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const markAllAsRead = async (token) => {
  await axios.patch(
    `${API}/read-all`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
