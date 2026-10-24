// plugin-gcp-mcp
// Works with Google Cloud.
// Grant requested: comment-task (the plugin only ever returns comment operations).

const MCP_SERVER_KEY = "gcp";
const MCP_SERVER_CONFIG = {
  "command": "npx",
  "args": [
    "-y",
    "gcp-mcp",
    "--project",
    "<project>"
  ],
  "env": {
    "GOOGLE_APPLICATION_CREDENTIALS": "/workspace/.secrets/gcp.json"
  }
};
const SETUP_STEPS = [
  "Create a service account with Viewer on the project.",
  "Store the key file in the workspace secrets store.",
  "Add the entry to the workspace MCP configuration."
];
const DOCS_URL = "https://www.npmjs.com/package/gcp-mcp";
const MAX_COMMENT_LENGTH = 10000;

function asString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

export function buildSetupComment(event) {
  const lines = [];
  lines.push("### GCP MCP — workspace configuration");
  lines.push("");
  lines.push("This workspace has the **GCP MCP** plugin installed.");
  lines.push("It installs and configures the GCP MCP server: the agent can then list resources, read Cloud Logging entries and query BigQuery on GCP.");
  const title = asString(event && event.taskTitle);
  if (title) {
    lines.push("");
    lines.push("Task: **" + title + "**");
  }
  lines.push("");
  lines.push("Add this entry to the workspace `mcp.servers` configuration:");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify({ [MCP_SERVER_KEY]: MCP_SERVER_CONFIG }, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("**Setup**");
  for (let i = 0; i < SETUP_STEPS.length; i++) {
    lines.push((i + 1) + ". " + SETUP_STEPS[i]);
  }
  lines.push("");
  lines.push("Docs: " + DOCS_URL);
  let text = lines.join("\n");
  if (text.length > MAX_COMMENT_LENGTH) {
    text = text.slice(0, MAX_COMMENT_LENGTH - 3) + "...";
  }
  return text;
}

export async function taskCreated(event) {
  const text = buildSetupComment(event);
  if (!text) return [];
  return [{ type: "comment", value: text }];
}

export const hooks = {
  "task.created": taskCreated,
};
