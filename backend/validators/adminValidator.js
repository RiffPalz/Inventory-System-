export const validateEmail = (value) => {
  if (!value || typeof value !== "string") return false;
  const email = value.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email : false;
};


export const validatePassword = (value) => {
  if (!value || typeof value !== "string") return false;
  return value.length >= 6;
};

export default { validateEmail, validatePassword };
