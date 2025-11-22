import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const authHandlers = toNextJsHandler(auth.handler);

export const { GET, POST } = authHandlers;
