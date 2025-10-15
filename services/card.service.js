import Board from "../models/board.model.js";
import Card from "../models/card.model.js";

export const createCardService = async (user, listId, data) => {
  const card = new Card({
    ...data,
    title: data.title,
    listId,
    admin: user.id,
  });

  if (!card) {
    throw new Error("Card could not be created.");
  }
  await card.save();
  return card;
};

export const assignMemberService = async (cardId, memberId) => {
  const card = await Card.findById(cardId);
  if (!card) throw new Error("Card not found.");
  const board = await Board.findById(card.boardId);
  if (!board) throw new Error("Board not found.");
  const isBoardMember = board.members.some(
    (mId) => mId.toString() === memberId.toString()
  );
  if (!isBoardMember) {
    throw new Error(
      "User is not a member of this board, cannot assign to card."
    );
  }
  if (!card.members.includes(memberId)) {
    card.members.push(memberId);
    await card.save();
  }
  return card;
};

export const moveCardService = async (cardId, targetListId) => {
  const card = await Card.findByIdAndUpdate(
    cardId,
    { $set: { listId: targetListId } },
    { new: true }
  );
  return card;
};

export const deleteCardService = async (cardId) => {
  await Card.findByIdAndDelete(cardId);
  return true;
};
