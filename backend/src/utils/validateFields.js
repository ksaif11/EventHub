export const validateFields = (fields, data) => {
  const missing = [];

  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === "") {
      missing.push(field);
    }
  });

  return {
    isValid: missing.length === 0,
    missing
  };
};
