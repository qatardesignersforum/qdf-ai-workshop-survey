// QDF AI Workshop Survey
// Live statistics are read from the public aggregate-only endpoint.
// Personal information is never requested by the stats endpoint.

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbryf-q2vX72exMwrvUyqFkmdze3QRTovMa7239HnkPDrTAELvANmxsg-CveSn50_KAyAw/exec";

const form = document.getElementById("surveyForm");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");
const successEl = document.getElementById("success");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

function selected(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x => x.value);
}

function updateProgress() {
  const requiredGroups = [
    selected("interest").length > 0,
    selected("aiUsage").length > 0,
    selected("aiAreas").length > 0,
    document.getElementById("specificTopic").value.trim().length > 0,
    selected("designExperience").length > 0,
    selected("workplace").length > 0,
    ["fullName","company","jobTitle","whatsapp","email"].every(n => form.elements[n].value.trim())
  ];
  const count = requiredGroups.filter(Boolean).length;
  progressText.textContent = `${count} / 7`;
  progressBar.style.width = `${(count / 7) * 100}%`;
}

form.addEventListener("input", updateProgress);
form.addEventListener("change", updateProgress);
updateProgress();

function formatPercent(value, total) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function renderBars(targetId, entries, total, maxItems = 6) {
  const target = document.getElementById(targetId);
  target.replaceChildren();

  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "chart-empty";
    empty.textContent = "No responses yet.";
    target.appendChild(empty);
    return;
  }

  const max = Math.max(...entries.map(x => x[1]), 1);

  entries.slice(0, maxItems).forEach(([label, count]) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const meta = document.createElement("div");
    meta.className = "bar-meta";

    const name = document.createElement("span");
    name.textContent = label;

    const value = document.createElement("strong");
    value.textContent = `${count} · ${formatPercent(count, total)}`;

    meta.append(name, value);

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${Math.max(4, (count / max) * 100)}%`;

    track.appendChild(fill);
    row.append(meta, track);
    target.appendChild(row);
  });
}

function updateStats(stats) {
  const total = Number(stats.total || 0);
  document.getElementById("statTotal").textContent = total;

  const interest = stats.interest || {};
  const interested = Number(interest["Yes, definitely"] || 0);
  document.getElementById("statInterested").textContent =
    total ? `${formatPercent(interested, total)}` : "0%";

  const usage = stats.aiUsage || {};
  const notUsing = Number(usage["I don't use AI yet"] || 0);
  const usingAi = Math.max(total - notUsing, 0);
  document.getElementById("statAiUsers").textContent =
    total ? `${formatPercent(usingAi, total)}` : "0%";

  const interestEntries = Object.entries(interest).sort((a,b) => b[1] - a[1]);
  renderBars("interestChart", interestEntries, total, 5);

  const areaEntries = Object.entries(stats.aiAreas || {})
    .filter(([label]) => label !== "Other")
    .sort((a,b) => b[1] - a[1]);
  renderBars("areasChart", areaEntries, total, 6);

  document.getElementById("statsUpdated").textContent =
    total ? `Based on ${total} submitted response${total === 1 ? "" : "s"}.` : "No responses yet.";
}

function loadCommunityStats() {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) return;

  const callbackName = `qdfStats_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const script = document.createElement("script");
  script.async = true;
  script.src = `${GOOGLE_SCRIPT_URL}?callback=${encodeURIComponent(callbackName)}`;

  const cleanup = () => {
    try { delete window[callbackName]; } catch (_) {}
    script.remove();
  };

  const timeout = setTimeout(() => {
    cleanup();
    document.getElementById("statsUpdated").textContent = "Community results will appear after the connection is available.";
  }, 10000);

  window[callbackName] = (stats) => {
    clearTimeout(timeout);
    updateStats(stats || {});
    cleanup();
  };

  script.onerror = () => {
    clearTimeout(timeout);
    cleanup();
    document.getElementById("statsUpdated").textContent = "Community results will appear after the connection is available.";
  };

  document.head.appendChild(script);
}

loadCommunityStats();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.className = "status";
  statusEl.textContent = "";

  if (GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
    statusEl.className = "status error";
    statusEl.textContent = "The survey connection is not configured yet. Please add the Google Apps Script URL in script.js.";
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const areas = selected("aiAreas");
  if (!areas.length) {
    statusEl.className = "status error";
    statusEl.textContent = "Please select at least one AI area.";
    return;
  }

  const data = {
    interest: selected("interest")[0] || "",
    aiUsage: selected("aiUsage")[0] || "",
    aiAreas: areas.join(", "),
    aiAreasOther: form.elements.aiAreasOther.value.trim(),
    specificTopic: form.elements.specificTopic.value.trim(),
    designExperience: selected("designExperience")[0] || "",
    workplace: selected("workplace")[0] || "",
    fullName: form.elements.fullName.value.trim(),
    company: form.elements.company.value.trim(),
    jobTitle: form.elements.jobTitle.value.trim(),
    whatsapp: form.elements.whatsapp.value.trim(),
    email: form.elements.email.value.trim(),
    suggestion: form.elements.suggestion.value.trim(),
    submittedAt: new Date().toISOString()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify(data)
    });

    form.classList.add("hidden");
    successEl.classList.remove("hidden");
    window.scrollTo({top: 0, behavior: "smooth"});
  } catch (err) {
    console.error(err);
    statusEl.className = "status error";
    statusEl.textContent = "Something went wrong. Please try again.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Survey";
  }
});
