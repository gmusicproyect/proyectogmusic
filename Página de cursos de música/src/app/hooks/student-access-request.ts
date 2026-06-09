import { DashboardRequestManager } from "./dashboard-request";
import type { AccessLoadOutcome } from "../services/gmusic-api/access-load";
import type { AccessReason, AccessSubscription, AccessUser } from "../services/gmusic-api/types";

export type StudentAccessHookState =
  | { status: "loading" }
  | { status: "allowed"; user: AccessUser; subscription: AccessSubscription }
  | { status: "denied"; user: AccessUser; reason: AccessReason }
  | { status: "error"; message: string };

export function applyAccessOutcome(
  generation: number,
  manager: DashboardRequestManager,
  outcome: AccessLoadOutcome
): StudentAccessHookState | null {
  if (!manager.isCurrent(generation)) return null;
  if (outcome.type === "aborted") return null;
  if (outcome.type === "error") return { status: "error", message: outcome.message };
  if (outcome.type === "allowed") {
    return {
      status: "allowed",
      user: outcome.user,
      subscription: outcome.subscription,
    };
  }
  return {
    status: "denied",
    user: outcome.user,
    reason: outcome.reason,
  };
}
