import List from "../models/list.model.js";

export const createListService = async (user, data) => {
  const list = new List({
    ...data,
    title: data.title,
  });

  await list.save();
  return list;
};

export const deleteListService = async (user, data) => {
  await List.findByIdAndDelete(data);
};
