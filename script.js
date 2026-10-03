// Paste your deployed Google Apps Script Web App URL here.
const GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

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
    // text/plain avoids a browser preflight request to Google Apps Script.
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
