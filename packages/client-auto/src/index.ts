import { type Client, type IAgentRuntime, elizaLogger } from "@elizaos/core";
import { logInitialThought } from "./forge/initial-thought";
import { logRandomThoughts } from "./forge/random-thoughts";

// todo - add a config for this
const AGENT_AUTO_CLIENT_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export class AutoClient {
    interval: NodeJS.Timeout | null = null;
    runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
        // this.runtime.clients["auto"] = this;

        elizaLogger.info(
            `AGENT: ${this.runtime.character.name} (${this.runtime.agentId}) starting auto client...`
        );

        // Run first run
        void logInitialThought(this.runtime);

        // stagger the interval start time randomly within 0-60 minutes
        const staggerMs = Math.floor(Math.random() * (60 + 1)) * 60 * 1000;

        setTimeout(() => {
            // start a loop that runs every hour
            this.interval = setInterval(async () => {
                await logRandomThoughts(this.runtime);
            }, AGENT_AUTO_CLIENT_INTERVAL);
        }, staggerMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            elizaLogger.log(
                `character ${this.runtime.character.name.toUpperCase()} stopping auto client...`
            );
        }
    }
}

export const AutoClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        elizaLogger.info("STARTING AUTO CLIENT", runtime.agentId);
        const client = new AutoClient(runtime);
        return client;
    },
    stop: async (runtime: IAgentRuntime) => {
        console.warn("Auto client does not support stopping yet");
    },
};

export default AutoClientInterface;
