import { env } from "./env.js";

export const jetstreamConfig = {
  name: env.NATS_STREAM,

  // covering all subjects for the core services
  subjects: ["user.*", "auth.*", "course.*", "test.*"],

  // retention policy
  retention: "limits",

  // storage type
  max_msgs: -1, // unlimited messages
  max_bytes: -1, // unlimited bytes
};
