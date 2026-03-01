import type { ChatMessage } from "./types";

export const starterMessages: ChatMessage[] = [
  {
    id: "m-1",
    role: "assistant",
    text: "Chào bạn, mình là trợ lý bóng đá. Bạn muốn xem phân tích trận đấu, đội hình dự kiến hay nhận định kèo hôm nay?",
    time: "11:22 AM",
  },
  {
    id: "m-2",
    role: "user",
    text: "Phân tích giúp mình trận Manchester City vs Arsenal tối nay.",
    time: "11:23 AM",
  },
  {
    id: "m-3",
    role: "assistant",
    text: "Trận này khả năng kiểm soát bóng nghiêng về Man City, còn Arsenal nguy hiểm ở phản công nhanh. Nếu bạn muốn, mình có thể breakdown theo từng tuyến và đưa tỷ lệ dự đoán bàn thắng.",
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
