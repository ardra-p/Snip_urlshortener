// Backend URL comes from config.js (loaded before this file)
const form = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const submitBtn = document.getElementById("submit-btn");
const errorMsg = document.getElementById("error-msg");
const result = document.getElementById("result");
const resultLink = document.getElementById("result-link");
const copyBtn = document.getElementById("copy-btn");
const recentList = document.getElementById("recent-list");
const recentCount = document.getElementById("recent-count");

function getApiBase() {
  return API_BASE.replace(/\/$/, "");
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}

function clearError() {
  errorMsg.textContent = "";
  errorMsg.classList.add("hidden");
}

async function loadRecent() {
  try {
    const res = await fetch(`${getApiBase()}/api/urls/`);
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    renderRecent(data.results || []);
  } catch (err) {
    recentList.innerHTML = `<li class="recent-empty">Can't reach the backend right now.</li>`;
    recentCount.textContent = "";
  }
}

function renderRecent(items) {
  recentCount.textContent = items.length ? `${items.length}` : "";
  if (!items.length) {
    recentList.innerHTML = `<li class="recent-empty">No links snipped yet.</li>`;
    return;
  }
  recentList.innerHTML = items
    .map(
      (item) => `
      <li>
        <a href="${item.short_url}" target="_blank" rel="noopener">${item.short_code}</a>
        <span class="orig" title="${item.original_url}">${item.original_url}</span>
        <span>${item.clicks} clicks</span>
      </li>`
    )
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();
  result.classList.add("hidden");

  const longUrl = urlInput.value.trim();
  if (!longUrl) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Snipping...";

  try {
    const res = await fetch(`${getApiBase()}/api/shorten/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: longUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Something went wrong. Try again.");
      return;
    }

    resultLink.href = data.short_url;
    resultLink.textContent = data.short_url;
    result.classList.remove("hidden");
    urlInput.value = "";
    loadRecent();
  } catch (err) {
    showError("Couldn't reach the backend. Make sure it's deployed and running.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Snip it";
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultLink.href);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  } catch (err) {
    const range = document.createRange();
    range.selectNode(resultLink);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
  }
});

loadRecent();