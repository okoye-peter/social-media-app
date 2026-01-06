import { serve } from "inngest/next";
import { inngest } from "@/src/ingest/client";
import { helloWorld } from "@/src/ingest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        helloWorld,
    ],
});