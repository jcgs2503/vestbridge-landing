import "./style.css";

// Reveal page now that CSS is loaded (prevents FOUC)
document.body.classList.add("loaded");

// --- Reusable copy-to-clipboard helper ---
function initCopyButton(btnId, textId, getText) {
  const btn = document.getElementById(btnId);
  const textEl = document.getElementById(textId);
  if (!btn) return;

  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(getText()).then(() => {
      textEl.textContent = "Copied!";
      setTimeout(() => {
        textEl.textContent = "Copy";
      }, 2000);
    });
  });
}

// --- Tab switcher ---
function initTabs(tabContainerId, panelPrefix, tabClass, panelClass, dataAttr, onSwitch) {
  const container = document.getElementById(tabContainerId);
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(`.${tabClass}`);
    if (!btn) return;

    const key = btn.dataset[dataAttr];
    if (!key) return;

    // Update tab styles
    container.querySelectorAll(`.${tabClass}`).forEach((t) => {
      t.classList.remove("bg-surface", "text-accent", "border-border");
      t.classList.add("border-transparent", "text-muted");
    });
    btn.classList.remove("border-transparent", "text-muted");
    btn.classList.add("bg-surface", "text-accent", "border-border");

    // Show/hide panels
    document.querySelectorAll(`.${panelClass}`).forEach((p) => p.classList.add("hidden"));
    const target = document.getElementById(`${panelPrefix}${key}`);
    if (target) target.classList.remove("hidden");

    if (onSwitch) onSwitch(key);
  });
}

// Install tabs
const installSnippets = {
  curl: `curl -sSL https://vestbridge.dev/install.sh | sh`,
  pip: `pip install vestbridge`,
  npm: `npx vestbridge`,
  brew: `brew install vestbridge`,
};

let activeInstall = "curl";

initTabs("install-tabs", "install-", "install-tab", "install-panel", "install", (key) => {
  activeInstall = key;
});

// Config client tabs
const configFilenames = {
  claude: "claude_desktop_config.json",
  claudecode: "terminal",
  cursor: ".cursor/mcp.json",
  chatgpt: "terminal",
};

const configSnippets = {
  claude: `{
  "mcpServers": {
    "vestbridge": {
      "command": "vestbridge",
      "args": ["--broker", "robinhood"]
    }
  }
}`,
  claudecode: `claude mcp add vestbridge -- vestbridge --broker robinhood`,
  cursor: `{
  "mcpServers": {
    "vestbridge": {
      "command": "vestbridge",
      "args": ["--broker", "robinhood"]
    }
  }
}`,
  chatgpt: `vestbridge --broker robinhood --transport sse --port 8080`,
};

let activeConfig = "claude";

initTabs("config-tabs", "config-", "config-tab", "config-panel", "config", (key) => {
  activeConfig = key;
  const filenameEl = document.getElementById("config-filename");
  if (filenameEl) filenameEl.textContent = configFilenames[key] || "";
});

// Copy buttons
initCopyButton("copy-install-btn", "copy-install-text", () => installSnippets[activeInstall]);
initCopyButton("copy-btn", "copy-text", () => configSnippets[activeConfig] || configSnippets.claude);

// Form handling
const form = document.getElementById("signup-form");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = form.querySelector('input[name="email"]').value;
    const btn = document.getElementById("submit-btn");
    const successMsg = document.getElementById("form-success");
    const errorMsg = document.getElementById("form-error");

    btn.textContent = "Sending...";
    btn.disabled = true;

    fetch(form.action, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(() => {
        successMsg.classList.remove("hidden");
        errorMsg.classList.add("hidden");
        form.reset();
      })
      .catch(() => {
        errorMsg.classList.remove("hidden");
        successMsg.classList.add("hidden");
      })
      .finally(() => {
        btn.textContent = "Get Early Access";
        btn.disabled = false;
      });
  });
}
