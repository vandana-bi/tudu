const isSystemAdmin = (user) => {
  try {
    return user.role === "admin";
  } catch (err) {
    console.error("Error in isSystemAdmin:", err.message);
    return false;
  }
};

export const checkRole = (user, requiredRole) => {
  try {
    if (!user) throw new Error("User not authenticated");
    if (user.role !== requiredRole) {
      throw new Error("Forbidden: insufficient role");
    }
    return true;
  } catch (err) {
    console.error("Error in checkRole:", err.message);
    throw err;
  }
};

export const canAccessWorkspace = (user, workspace) => {
  try {
    if (!user) return false;
    if (isSystemAdmin(user)) return true;
    if (workspace.admin.toString() === user.id.toString()) return true;
    return workspace.members.some(
      (mId) => mId.toString() === user.id.toString()
    );
  } catch (err) {
    console.error("Error in canAccessWorkspace:", err.message);
    return false;
  }
};

export const canManageWorkspace = (user, workspace) => {
  try {
    if (!user) return false;
    return (
      isSystemAdmin(user) || workspace.admin.toString() === user.id.toString()
    );
  } catch (err) {
    console.error("Error in canManageWorkspace:", err.message);
    return false;
  }
};

export const canAccessBoard = (user, board) => {
  try {
    if (!user) return false;
    if (isSystemAdmin(user)) return true;
    if (board.admin.toString() === user.id.toString()) return true;
    return board.members.some((mId) => mId.toString() === user.id.toString());
  } catch (err) {
    console.error("Error in canAccessBoard:", err.message);
    return false;
  }
};

export const canManageBoard = (user, board, workspace) => {
  try {
    if (!user) return false;
    return (
      isSystemAdmin(user) ||
      board.admin.toString() === user.id.toString() ||
      workspace.admin.toString() === user.id.toString()
    );
  } catch (err) {
    console.error("Error in canManageBoard:", err.message);
    return false;
  }
};

export const canManageCard = (user, card, list, board, workspace) => {
  try {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (workspace.admin.toString() === user.id.toString()) return true;
    if (board.admin.toString() === user.id.toString()) return true;
    if (card && card.admin && card.admin.toString() === user.id.toString())
      return true;
    return false;
  } catch (err) {
    console.error("Error in canManageCard:", err.message);
    return false;
  }
};

export const canViewCard = (user, card, list, board, workspace) => {
  try {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (
      workspace.admin.toString() === user.id.toString() ||
      workspace.members.some((mId) => mId.toString() === user.id.toString())
    ) {
      return true;
    }
    if (
      board.admin.toString() === user.id.toString() ||
      board.members.some((mId) => mId.toString() === user.id.toString())
    ) {
      return true;
    }
    if (
      (card.admin && card.admin.toString() === user.id.toString()) ||
      card.members.some((mId) => mId.toString() === user.id.toString())
    ) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error in canViewCard:", err.message);
    return false;
  }
};

export const canCommentOnCard = (user, card, board, workspace) => {
  try {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (
      workspace.admin.toString() === user.id.toString() ||
      workspace.members.some((mId) => mId.toString() === user.id.toString())
    ) {
      return true;
    }
    if (
      board.admin.toString() === user.id.toString() ||
      board.members.some((mId) => mId.toString() === user.id.toString())
    ) {
      return true;
    }
    if (
      (card.admin && card.admin.toString() === user.id.toString()) ||
      card.members.some((mId) => mId.toString() === user.id.toString())
    ) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error in canCommentOnCard:", err.message);
    return false;
  }
};

export const canManageComment = (user, comment, board, workspace) => {
  try {
    if (!user) return false;
    if (isSystemAdmin(user)) return true;
    if (workspace.admin.toString() === user.id.toString()) return true;
    if (board.admin.toString() === user.id.toString()) return true;
    if (comment.author.toString() === user.id.toString()) return true;
    return false;
  } catch (err) {
    console.error("Error in canManageComment:", err.message);
    return false;
  }
};

export const canEditComment = (user, comment) => {
  try {
    if (!user) return false;
    return comment.author.toString() === user.id.toString(); // only author
  } catch (err) {
    console.error("Error in canEditComment:", err.message);
    return false;
  }
};
