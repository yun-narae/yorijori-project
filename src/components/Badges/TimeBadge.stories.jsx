import React from "react";
import TimeBadge from "./TimeBadge";

export default {
  title: "Components/Badges/TimeBadge",
  component: TimeBadge,
  tags: ["autodocs"],
};

export const JustNow = { args: { updated: "방금 전" } };
export const MinutesAgo = { args: { updated: "3분 전" } };
export const HoursAgo = { args: { updated: "2시간 전" } };
export const DaysAgo = { args: { updated: "2025.08.15" } };