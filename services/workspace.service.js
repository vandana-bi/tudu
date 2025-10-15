import Workspace from "../models/workspace.model.js";
import { canAccessWorkspace, canManageWorkspace } from "./rbac.service.js";

export const createWorkspaceService = async (user, data) => {
  const workspace = new Workspace({
    ...data,
    title: data.title,
    admin: data.admin,
    members: [data.admin],
  });
  await workspace.save();
  return workspace;
};

export const getWorkspacesService = async (user) => {
  const workspaces = await Workspace.find({
    $or: [{ admin: user.id }, { members: user.id }],
  });

  return workspaces.filter((ws) => canAccessWorkspace(user, ws));
};

export const getWorkspaceService = async (user, workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  if (!canAccessWorkspace(user, workspace)) {
    throw new Error("Forbidden: no access to this workspace");
  }
  return workspace;
};

export const updateWorkspaceService = async (user, workspaceId, data) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  if (!canManageWorkspace(user, workspace)) {
    throw new Error("Forbidden: only workspace admin can update");
  }
  Object.assign(workspace, data);
  await workspace.save();
  return workspace;
};

export const deleteWorkspaceService = async (user, workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");

  if (!canManageWorkspace(user, workspace)) {
    throw new Error("Forbidden: only workspace admin can delete");
  }
  await workspace.deleteOne();
  return { message: "Workspace deleted" };
};

export const workspaceVisibilityService = async (workspaceId, visibility) => {
  if (!workspaceId) {
    return res.status(400).json({
      message: "WorkspaceId Is Required, Please Enter A Valid WorkspaceId!!",
    });
  }
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return res.status(400).json({
      message:
        "This WorkspaceId Doesn't Belong To Any Workspace!! Try Another Id.",
    });
  }
  if (visibility !== "Private" && visibility !== "Public") {
    return res.status(400).json({
      message: "Please Enter Valid Value For Visibility",
    });
  }
  if (workspace.visibility === visibility) {
    return res.status(201).json({
      message: `Visibility Is Already ${visibility}!!`,
    });
  }
  board.visibility = visibility;
  await workspace.save();
  return workspace;
};
