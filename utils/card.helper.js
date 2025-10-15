export const calculateDueDate = (createdAt, days) => {
  try {
    if (!days || isNaN(days) || days <= 0) {
      throw new Error("Invalid number of days for due date");
    }

    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + days);

    return dueDate;
  } catch (err) {
    console.error("Error in calculateDueDate:", err.message);
    return null;
  }
};
