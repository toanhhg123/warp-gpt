import type { ChatMessage } from "./types";

export const starterMessages: ChatMessage[] = [
  {
    id: "m-1",
    role: "assistant",
    text: "Hi! I can help you build and refine your UI. Share your screen goals and I will draft the next step.",
    time: "11:22 AM",
  },
  {
    id: "m-2",
    role: "user",
    text: "Create a clean chat layout with a left history rail and an input pinned at the bottom.",
    time: "11:23 AM",
  },
  {
    id: "m-3",
    role: "assistant",
    text: "Done. I set up a responsive shell with conversation history, centered message stream, and a sticky composer.",
    time: "11:24 AM",
  },
];

export const conversations = [
  "New UI mockup",
  "Landing page copy",
  "Support bot tuning",
  "Pricing page QA",
  "Release notes draft",
];
