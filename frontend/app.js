
const API_URL = "";

const titles = {
  overview: "Environmental overview",
  fire: "Sentinel Fire",
  water: "Sentinel Water",
  biodiversity: "Sentinel Biodiversity",
  seismic: "Sentinel Seismic"
};

const history = [];

function navigate(view) {
  document.querySelectorAll(".view").forEach(section => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  document.getElementById(`view-${view}`).classList.add("active");
  document.getElementById("page-title").textContent = titles[view];

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.view));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.go));
});

// Verify backend connection
async function checkConnection() {
  const status = document.getElementById("engine-status");

  try {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) throw new Error("Backend unavailable");

    status.textContent = "Backend connected";
  } catch (error) {
    status.textContent = "Backend disconnected";
  }
}

function showLoading(module) {
  const result = document.getElementById(`${module}-result`);
  const button = document.getElementById(`${module}-submit`);

  result.innerHTML = `
    <div class="result-placeholder">
      <div class="placeholder-symbol">✳</div>
      <h3>Analyzing environmental data...</h3>
      <p>Sentinel Agent is processing the request. Please wait.</p>
    </div>
  `;

  button.disabled = true;
  button.textContent = "Analyzing...";
}


function formatReport(report) {
  const sections = [
    "RIESGO",
    "EVIDENCIA",
    "INCERTIDUMBRE",
    "ACCIONES RECOMENDADAS",
    "AVISO"
  ];

  const headingRegex =
    /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?(RIESGO|EVIDENCIA|INCERTIDUMBRE|ACCIONES RECOMENDADAS|AVISO)(?:\*\*)?\s*:?\s*/gi;

  const matches = [...report.matchAll(headingRegex)];
  let html = "";

  matches.forEach((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length
      ? matches[index + 1].index
      : report.length;

    const section = match[1].toUpperCase();
    const content = report
      .slice(start, end)
      .replace(/\*\*/g, "")
      .trim();

    if (sections.includes(section) && content) {
      html += `
        <h4>${section}</h4>
        <p>${escapeHTML(content)}</p>
      `;
    }
  });

  return html || `<p>${escapeHTML(report)}</p>`;
}


function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function renderResult(module, data) {
  const result = document.getElementById(`${module}-result`);
  const analysis = data.analysis;
  const explanation = data.sentinel_agent?.explanation || "";
  const risk = analysis.risk || "unknown";
  const riskLabel = {
    high: "HIGH RISK",
    medium: "MEDIUM RISK",
    low: "LOW RISK"
  }[risk] || risk.toUpperCase();

  const evidence = (analysis.evidence || [])
    .map(item => `<span class="evidence-chip">${escapeHTML(item)}</span>`)
    .join("");

  result.innerHTML = `
    <div class="result-header">
      <div>
        <div class="eyebrow">PRELIMINARY ASSESSMENT</div>
        <h3>${module === "fire" ? "Fire risk assessment" : "Water risk assessment"}</h3>
      </div>
      <span class="risk-pill risk-${escapeHTML(risk)}">${escapeHTML(riskLabel)}</span>
    </div>

    <div class="result-header" style="margin-top:20px">
      <span style="color:var(--muted);font-size:11px">Risk score</span>
      <span class="risk-score">${escapeHTML(analysis.score)}</span>
    </div>

    <div class="result-evidence">${evidence}</div>

    <div class="agent-report">
      <div class="agent-title">
        <span>✳</span> SENTINEL AGENT · NEMOTRON
      </div>
      ${formatReport(explanation)}
    </div>

    <p class="notice">${escapeHTML(analysis.notice || "Preliminary analysis. Not an official emergency warning.")}</p>
  `;

  addHistory(module, analysis);
}

async function runAnalysis(module, form) {
  const button = document.getElementById(`${module}-submit`);
  showLoading(module);

  const values = Object.fromEntries(new FormData(form).entries());

  const payload = {
    module,
    ...Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value)])
    )
  };

  try {
    const response = await fetch(`${API_URL}/analyze-with-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Analysis request failed");
    }

    if (!data.analysis || !data.sentinel_agent?.explanation) {
      throw new Error("The AI report was not returned by the backend.");
    }

    renderResult(module, data);
  } catch (error) {
    document.getElementById(`${module}-result`).innerHTML = `
      <div class="result-placeholder">
        <div class="placeholder-symbol">!</div>
        <h3>Analysis unavailable</h3>
        <p>${escapeHTML(error.message)}</p>
        <p>Check that the FastAPI backend is running.</p>
      </div>
    `;
  } finally {
    button.disabled = false;
    button.innerHTML = `Run ${module === "fire" ? "Fire" : "Water"} Analysis <span>→</span>`;
  }
}

document.getElementById("fire-form").addEventListener("submit", event => {
  event.preventDefault();
  runAnalysis("fire", event.target);
});

document.getElementById("water-form").addEventListener("submit", event => {
  event.preventDefault();
  runAnalysis("water", event.target);
});

function addHistory(module, analysis) {
  history.unshift({
    module,
    risk: analysis.risk,
    time: new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("history-list");
  document.getElementById("history-count").textContent =
    `${history.length} RECORDS`;

  if (!history.length) {
    container.innerHTML =
      '<div class="empty-state">Your analysis history will appear here.</div>';
    return;
  }

  container.innerHTML = history.map(item => `
    <div class="history-row">
      <div>
        <strong>${item.module === "fire" ? "Sentinel Fire" : "Sentinel Water"}</strong>
        <small>Analysis completed · ${item.time}</small>
      </div>
      <span class="risk-pill risk-${escapeHTML(item.risk)}">
        ${escapeHTML(item.risk.toUpperCase())}
      </span>
    </div>
  `).join("");
}

checkConnection();
