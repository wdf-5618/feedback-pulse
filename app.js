"use strict";

const STORAGE_KEY = "feedback-pulse.responses.v1";
const MAX_RESPONSES = 1000;
const MAX_COMMENT_LENGTH = 2000;
const RATINGS = [1, 2, 3, 4, 5];
const CATEGORIES = [
  "Product quality", "Customer service", "Delivery", "Price and value", "Website experience", "Other",
];
const CHANNELS = ["Website", "Email survey", "In person", "Phone", "Social media", "Other"];

const els = {
  storageStatus: document.querySelector("#storage-status"),
  responseList: document.querySelector("#response-list"),
  resultCount: document.querySelector("#result-count"),
  filterSummary: document.querySelector("#filter-summary"),
  search: document.querySelector("#feedback-search"),
  ratingFilter: document.querySelector("#rating-filter"),
  sentimentFilter: document.querySelector("#sentiment-filter"),
  categoryFilter: document.querySelector("#category-filter"),
  sortOrder: document.querySelector("#sort-order"),
  detail: document.querySelector("#response-detail"),
  newDialog: document.querySelector("#new-response-dialog"),
  newForm: document.querySelector("#new-response-form"),
  resetDialog: document.querySelector("#reset-dialog"),
  newMessage: document.querySelector("#new-response-message"),
  dateInput: document.querySelector("#feedback-date"),
  distribution: document.querySelector("#rating-distribution"),
  categoryBreakdown: document.querySelector("#category-breakdown"),
};

function nowISO() {
  return new Date().toISOString();
}

function localDateISO(date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDateISO(date);
}

els.dateInput.value = localDateISO(new Date());
els.dateInput.max = localDateISO(new Date());

function makeSampleResponses() {
  return [
    {
      id: "FB-2026-208",
      customerName: "May Thiri",
      date: daysAgo(0),
      rating: 5,
      category: "Customer service",
      channel: "Website",
      comment: "The support team answered quickly and explained every step clearly. I knew what would happen next.",
      followup: "",
      followupDone: true,
      createdAt: hoursAgo(2),
    },
    {
      id: "FB-2026-207",
      customerName: "Ko Min",
      date: daysAgo(1),
      rating: 4,
      category: "Product quality",
      channel: "Email survey",
      comment: "The product works well and feels reliable. A setup guide with more examples would make the first use even easier.",
      followup: "Add more examples to the setup guide.",
      followupDone: false,
      createdAt: hoursAgo(20),
    },
    {
      id: "FB-2026-206",
      customerName: "Aye Chan",
      date: daysAgo(2),
      rating: 2,
      category: "Delivery",
      channel: "Phone",
      comment: "The delivery arrived later than the estimate, and I did not get an update. I had to contact support to find out what happened.",
      followup: "Review delivery update messages for delayed orders.",
      followupDone: false,
      createdAt: hoursAgo(43),
    },
    {
      id: "FB-2026-205",
      customerName: "Nandar Win",
      date: daysAgo(3),
      rating: 4,
      category: "Website experience",
      channel: "Website",
      comment: "The site is clear and easy to use on my phone. It took me a while to find the return policy.",
      followup: "Consider making the return policy easier to find.",
      followupDone: false,
      createdAt: hoursAgo(70),
    },
    {
      id: "FB-2026-204",
      customerName: "Thant Zin",
      date: daysAgo(4),
      rating: 3,
      category: "Price and value",
      channel: "In person",
      comment: "The product is acceptable for the price. I would like to compare the available plans more easily.",
      followup: "",
      followupDone: false,
      createdAt: hoursAgo(96),
    },
    {
      id: "FB-2026-203",
      customerName: "Ei Mon",
      date: daysAgo(5),
      rating: 1,
      category: "Customer service",
      channel: "Social media",
      comment: "I asked the same question twice and received two different answers. I am not sure which information is correct.",
      followup: "Review the response and provide one consistent answer.",
      followupDone: false,
      createdAt: hoursAgo(122),
    },
    {
      id: "FB-2026-202",
      customerName: "Htet Aung",
      date: daysAgo(6),
      rating: 5,
      category: "Product quality",
      channel: "Email survey",
      comment: "Everything arrived as expected and the quality was better than I thought. I would buy this again.",
      followup: "",
      followupDone: true,
      createdAt: hoursAgo(149),
    },
    {
      id: "FB-2026-201",
      customerName: "Su Myat",
      date: daysAgo(8),
      rating: 4,
      category: "Delivery",
      channel: "Website",
      comment: "The order came in good condition. Delivery tracking could show more detail during the final stage.",
      followup: "Check whether the final delivery status can be clearer.",
      followupDone: false,
      createdAt: hoursAgo(190),
    },
  ];
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function normalizeResponse(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = cleanString(raw.id, 40);
  const customerName = cleanString(raw.customerName, 100).trim();
  const date = cleanString(raw.date, 10);
  const rating = Number(raw.rating);
  if (!id || !customerName || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !RATINGS.includes(rating)) return null;

  return {
    id,
    customerName,
    date,
    rating,
    category: CATEGORIES.includes(raw.category) ? raw.category : "Other",
    channel: CHANNELS.includes(raw.channel) ? raw.channel : "Other",
    comment: cleanString(raw.comment, MAX_COMMENT_LENGTH),
    followup: cleanString(raw.followup, 500),
    followupDone: raw.followupDone === true,
    createdAt: cleanString(raw.createdAt, 40) || nowISO(),
  };
}

function setStorageStatus(text) {
  els.storageStatus.textContent = text;
}

function readStoredResponses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.responses)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.responses.slice(0, MAX_RESPONSES).map(normalizeResponse).filter(Boolean);
  } catch (error) {
    setStorageStatus("Browser storage unavailable");
    return null;
  }
}

let responses = readStoredResponses();
if (responses === null) responses = makeSampleResponses();
let selectedId = responses.length ? responses[0].id : null;

function saveResponses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      responses: responses.slice(0, MAX_RESPONSES),
    }));
    setStorageStatus("Saved in this browser");
    return true;
  } catch (error) {
    setStorageStatus("Could not save to browser storage");
    return false;
  }
}

function getResponse(id) {
  return responses.find(function (response) { return response.id === id; }) || null;
}

function sentimentFor(rating) {
  if (rating >= 4) return { key: "positive", label: "Positive" };
  if (rating === 3) return { key: "neutral", label: "Neutral" };
  return { key: "attention", label: "Needs attention" };
}

function initials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (part) {
    return part.charAt(0).toUpperCase();
  }).join("") || "?";
}

function makeNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function makeChip(text, className) {
  return makeNode("span", className, text);
}

function formatDate(dateString) {
  if (!dateString) return "Not set";
  const date = new Date(dateString + "T12:00:00");
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function relativeDate(dateString) {
  const date = new Date(dateString);
  const elapsed = Date.now() - date.getTime();
  if (!Number.isFinite(elapsed)) return "Date unknown";
  if (elapsed < 60 * 60 * 1000) return "Just now";
  if (elapsed < 24 * 60 * 60 * 1000) return Math.floor(elapsed / (60 * 60 * 1000)) + "h ago";
  if (elapsed < 48 * 60 * 60 * 1000) return "Yesterday";
  return Math.floor(elapsed / (24 * 60 * 60 * 1000)) + "d ago";
}

function stars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function classSlug(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderMetrics() {
  const count = responses.length;
  const average = count
    ? responses.reduce(function (total, item) { return total + item.rating; }, 0) / count
    : 0;
  const positiveCount = responses.filter(function (item) { return item.rating >= 4; }).length;
  const attentionCount = responses.filter(function (item) { return item.rating <= 2 && !item.followupDone; }).length;
  document.querySelector("#metric-average").textContent = count ? average.toFixed(1) : "—";
  document.querySelector("#average-caption").textContent = count ? stars(Math.round(average)) + " average across " + count + (count === 1 ? " response" : " responses") : "No ratings yet";
  document.querySelector("#metric-total").textContent = String(count);
  document.querySelector("#metric-positive").textContent = count ? Math.round((positiveCount / count) * 100) + "%" : "0%";
  document.querySelector("#metric-attention").textContent = String(attentionCount);
}

function renderDistribution() {
  els.distribution.replaceChildren();
  const total = responses.length;
  RATINGS.slice().reverse().forEach(function (rating) {
    const count = responses.filter(function (item) { return item.rating === rating; }).length;
    const row = makeNode("div", "rating-row");
    const label = makeNode("span", "rating-label");
    label.append(makeNode("span", "", "★ "), document.createTextNode(String(rating)));
    const track = makeNode("div", "rating-track");
    const fill = makeNode("div", "rating-fill");
    fill.style.width = total ? ((count / total) * 100) + "%" : "0%";
    fill.setAttribute("aria-hidden", "true");
    track.append(fill);
    const countText = makeNode("span", "rating-count", count);
    row.append(label, track, countText);
    row.setAttribute("aria-label", rating + " star rating: " + count + " responses");
    els.distribution.append(row);
  });
}

function renderCategoryBreakdown() {
  els.categoryBreakdown.replaceChildren();
  const total = responses.length;
  const counts = CATEGORIES.map(function (category) {
    return {
      category,
      count: responses.filter(function (response) { return response.category === category; }).length,
    };
  }).filter(function (item) { return item.count > 0; })
    .sort(function (a, b) { return b.count - a.count || a.category.localeCompare(b.category); });

  if (!counts.length) {
    els.categoryBreakdown.append(makeNode("p", "category-empty", "Add feedback to see the most common themes."));
    return;
  }

  counts.slice(0, 5).forEach(function (item) {
    const row = makeNode("div", "category-row");
    const head = makeNode("div", "category-row-head");
    head.append(makeNode("span", "", item.category), makeNode("strong", "", item.count));
    const track = makeNode("div", "category-track");
    const fill = makeNode("div", "category-fill");
    fill.style.width = ((item.count / total) * 100) + "%";
    track.append(fill);
    row.append(head, track);
    els.categoryBreakdown.append(row);
  });
}

function currentFilters() {
  return {
    query: els.search.value.trim().toLowerCase(),
    rating: els.ratingFilter.value,
    sentiment: els.sentimentFilter.value,
    category: els.categoryFilter.value,
    sort: els.sortOrder.value,
  };
}

function filteredResponses() {
  const filter = currentFilters();
  const result = responses.filter(function (response) {
    const sent = sentimentFor(response.rating).key;
    const matchesQuery = !filter.query || [
      response.id, response.customerName, response.comment, response.category,
      response.channel, response.followup,
    ].some(function (value) { return String(value || "").toLowerCase().includes(filter.query); });
    return matchesQuery &&
      (filter.rating === "all" || response.rating === Number(filter.rating)) &&
      (filter.sentiment === "all" || sent === filter.sentiment) &&
      (filter.category === "all" || response.category === filter.category);
  });

  result.sort(function (a, b) {
    if (filter.sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (filter.sort === "lowest") return a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt);
    if (filter.sort === "highest") return b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return result;
}

function renderResponseList(visible) {
  els.responseList.replaceChildren();
  els.resultCount.textContent = visible.length + (visible.length === 1 ? " response" : " responses");
  els.filterSummary.textContent = visible.length === responses.length
    ? "Showing all responses"
    : "Showing " + visible.length + " of " + responses.length;

  if (!visible.length) {
    const empty = makeNode("p", "empty-state", responses.length
      ? "No feedback matches these filters. Try changing your search or filters."
      : "No feedback yet. Add a response to begin the dashboard.");
    els.responseList.append(empty);
    selectedId = null;
    return;
  }

  visible.forEach(function (response) {
    const sent = sentimentFor(response.rating);
    const card = makeNode("button", "response-card" + (response.id === selectedId ? " is-selected" : ""));
    card.type = "button";
    card.dataset.responseId = response.id;
    card.setAttribute("aria-pressed", response.id === selectedId ? "true" : "false");

    const head = makeNode("span", "response-head");
    const person = makeNode("span", "response-person");
    const avatar = makeNode("span", "avatar", initials(response.customerName));
    avatar.setAttribute("aria-hidden", "true");
    person.append(avatar, makeNode("span", "", response.customerName));
    head.append(person, makeNode("span", "response-date", formatDate(response.date)));

    const rating = makeNode("span", "response-stars", stars(response.rating));
    rating.setAttribute("aria-label", response.rating + " out of 5 stars");
    const comment = makeNode("span", "response-comment",
      response.comment.trim() || "No written comment was provided.");
    const footer = makeNode("span", "response-footer");
    const tags = makeNode("span", "response-tags");
    tags.append(
      makeChip(sent.label, "sentiment-chip sentiment-" + sent.key),
      makeChip(response.category, "category-chip"),
      makeChip(response.channel, "channel-chip")
    );
    const trailing = makeNode("span");
    if (response.rating <= 2 && !response.followupDone) {
      trailing.append(makeNode("span", "followup-mark", "Needs follow-up"));
    } else if (response.followupDone) {
      trailing.append(makeNode("span", "followup-mark followup-done", "Followed up"));
    }
    footer.append(tags, trailing);
    card.append(head, rating, comment, footer);
    els.responseList.append(card);
  });
}

function addDetailSection(parent, title, text) {
  const section = makeNode("section", "detail-section");
  section.append(makeNode("p", "detail-label", title));
  const content = makeNode("p", "detail-comment", text || "No comment provided.");
  section.append(content);
  parent.append(section);
}

function renderDetail(response) {
  els.detail.replaceChildren();
  if (!response) {
    const empty = makeNode("div", "empty-detail");
    empty.append(
      makeNode("span", "empty-detail-icon", "✳"),
      makeNode("h2", "", "Select a response"),
      makeNode("p", "", "Choose customer feedback to read the full comment, review its category, and record a follow-up action.")
    );
    empty.querySelector("h2").id = "detail-heading";
    els.detail.setAttribute("aria-labelledby", "detail-heading");
    els.detail.append(empty);
    return;
  }

  const sent = sentimentFor(response.rating);
  const header = makeNode("div", "detail-heading-row");
  const titleGroup = makeNode("div");
  titleGroup.append(
    makeNode("p", "detail-id", response.id),
    makeNode("h2", "detail-title", response.customerName)
  );
  titleGroup.querySelector("h2").id = "detail-heading";
  const headerRating = makeNode("span", "detail-rating", stars(response.rating));
  headerRating.setAttribute("aria-label", response.rating + " out of 5 stars");
  header.append(titleGroup, headerRating);
  els.detail.setAttribute("aria-labelledby", "detail-heading");

  const chips = makeNode("div", "detail-chips");
  chips.append(
    makeChip(sent.label, "sentiment-chip sentiment-" + sent.key),
    makeChip(response.category, "category-chip"),
    makeChip(response.channel, "channel-chip")
  );

  const person = makeNode("div", "detail-person");
  const avatar = makeNode("span", "detail-avatar", initials(response.customerName));
  avatar.setAttribute("aria-hidden", "true");
  const personInfo = makeNode("div");
  personInfo.append(
    makeNode("p", "detail-person-name", response.customerName),
    makeNode("p", "detail-person-meta", "Received " + formatDate(response.date))
  );
  person.append(avatar, personInfo);

  const body = makeNode("div", "detail-body");
  addDetailSection(body, "Customer comment", response.comment || "No written comment was provided.");

  const meta = makeNode("div", "detail-meta-grid");
  const categoryCell = makeNode("div", "meta-cell");
  categoryCell.append(makeNode("label", "", "Feedback category"), makeNode("strong", "", response.category));
  const channelCell = makeNode("div", "meta-cell");
  channelCell.append(makeNode("label", "", "Source"), makeNode("strong", "", response.channel));
  const dateCell = makeNode("div", "meta-cell");
  dateCell.append(makeNode("label", "", "Response date"), makeNode("strong", "", formatDate(response.date)));
  const timeCell = makeNode("div", "meta-cell");
  timeCell.append(makeNode("label", "", "Added to this demo"), makeNode("strong", "", formatDate(response.createdAt.slice(0, 10))));
  meta.append(categoryCell, channelCell, dateCell, timeCell);

  const followup = makeNode("section", "followup-panel");
  const followupHead = makeNode("div", "followup-head");
  followupHead.append(makeNode("p", "detail-label", "Follow-up action"));
  const statusText = response.followupDone ? "Completed" : response.followup ? "Not completed" : "No action recorded";
  followupHead.append(makeChip(statusText, "followup-state" + (response.followupDone ? " is-done" : "")));
  followup.append(followupHead);
  followup.append(makeNode("p", "followup-text", response.followup || "No follow-up action has been recorded."));
  followup.append(makeNode("p", "followup-status", response.followupDone
    ? "This response is marked as followed up."
    : response.rating <= 2
      ? "Low ratings stay in Needs attention until marked complete."
      : "Use this action to track whether your team has reviewed the response."));

  const controls = makeNode("div", "detail-controls");
  const followupButton = makeNode("button", "btn " + (response.followupDone ? "btn-outline-secondary" : "btn-primary"),
    response.followupDone ? "Reopen follow-up" : "Mark follow-up done");
  followupButton.type = "button";
  followupButton.id = "toggle-followup-btn";
  const deleteButton = makeNode("button", "btn btn-outline-danger", "Delete response");
  deleteButton.type = "button";
  deleteButton.id = "delete-response-btn";
  controls.append(followupButton, deleteButton);

  const message = makeNode("p", "detail-message", "");
  message.id = "detail-message";
  message.setAttribute("role", "status");
  message.setAttribute("aria-live", "polite");

  els.detail.append(header, chips, person, body, meta, followup, controls, message);

  followupButton.addEventListener("click", function () {
    response.followupDone = !response.followupDone;
    saveResponses();
    renderAll();
  });

  deleteButton.addEventListener("click", function () {
    if (!window.confirm("Delete this feedback response from this browser?")) return;
    responses = responses.filter(function (item) { return item.id !== response.id; });
    selectedId = null;
    saveResponses();
    renderAll();
  });
}

function renderAll() {
  renderMetrics();
  renderDistribution();
  renderCategoryBreakdown();
  const visible = filteredResponses();
  if (!visible.some(function (response) { return response.id === selectedId; })) {
    selectedId = visible.length ? visible[0].id : null;
  }
  renderResponseList(visible);
  renderDetail(getResponse(selectedId));
}

function createId() {
  const taken = new Set(responses.map(function (response) { return response.id; }));
  const year = new Date().getFullYear();
  let id;
  do {
    id = "FB-" + year + "-" + String(Math.floor(1000 + Math.random() * 9000));
  } while (taken.has(id));
  return id;
}

function makeCsvCell(value) {
  let text = String(value == null ? "" : value);
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function exportCsv() {
  if (!responses.length) {
    setStorageStatus("There are no responses to export");
    return;
  }
  const headers = ["Response ID", "Customer", "Date", "Rating", "Sentiment", "Category", "Channel", "Comment", "Follow-up Action", "Follow-up Done", "Added At"];
  const rows = responses.map(function (response) {
    return [
      response.id, response.customerName, response.date, response.rating,
      sentimentFor(response.rating).label, response.category, response.channel,
      response.comment, response.followup, response.followupDone ? "Yes" : "No", response.createdAt,
    ].map(makeCsvCell).join(",");
  });
  const csv = [headers.map(makeCsvCell).join(",")].concat(rows).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "feedback-pulse-" + localDateISO(new Date()) + ".csv";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  setStorageStatus("CSV exported");
}

document.querySelector("#open-response-btn").addEventListener("click", function () {
  els.newMessage.textContent = "";
  els.newForm.reset();
  els.dateInput.value = localDateISO(new Date());
  els.dateInput.max = localDateISO(new Date());
  if (typeof els.newDialog.showModal === "function") els.newDialog.showModal();
});

document.querySelectorAll("[data-close-dialog]").forEach(function (button) {
  button.addEventListener("click", function () {
    const dialog = document.getElementById(button.dataset.closeDialog);
    if (dialog) dialog.close();
  });
});

els.newForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!els.newForm.checkValidity()) {
    els.newForm.reportValidity();
    return;
  }
  if (responses.length >= MAX_RESPONSES) {
    els.newMessage.textContent = "The local demo limit is 1,000 responses. Delete an older response before adding another.";
    return;
  }

  const data = Object.fromEntries(new FormData(els.newForm).entries());
  const rating = Number(data.rating);
  const responseDate = data.date;
  if (!RATINGS.includes(rating) || !/^\d{4}-\d{2}-\d{2}$/.test(responseDate) || responseDate > localDateISO(new Date())) {
    els.newMessage.textContent = "Choose a valid rating and a response date that is not in the future.";
    return;
  }

  const response = {
    id: createId(),
    customerName: data.customerName.trim(),
    date: responseDate,
    rating,
    category: CATEGORIES.includes(data.category) ? data.category : "Other",
    channel: CHANNELS.includes(data.channel) ? data.channel : "Other",
    comment: cleanString(data.comment, MAX_COMMENT_LENGTH).trim(),
    followup: cleanString(data.followup, 500).trim(),
    followupDone: false,
    createdAt: nowISO(),
  };

  responses.unshift(response);
  selectedId = response.id;
  saveResponses();
  els.newForm.reset();
  els.newDialog.close();
  renderAll();
});

els.responseList.addEventListener("click", function (event) {
  const button = event.target.closest("[data-response-id]");
  if (!button) return;
  selectedId = button.dataset.responseId;
  renderAll();
});

[els.search, els.ratingFilter, els.sentimentFilter, els.categoryFilter, els.sortOrder].forEach(function (control) {
  control.addEventListener(control === els.search ? "input" : "change", renderAll);
});

document.querySelector("#clear-filters-btn").addEventListener("click", function () {
  els.search.value = "";
  els.ratingFilter.value = "all";
  els.sentimentFilter.value = "all";
  els.categoryFilter.value = "all";
  els.sortOrder.value = "newest";
  renderAll();
});

document.querySelector("#export-csv-btn").addEventListener("click", exportCsv);

document.querySelector("#sample-reset-btn").addEventListener("click", function () {
  if (typeof els.resetDialog.showModal === "function") els.resetDialog.showModal();
  else if (window.confirm("Reset all responses to the original fictional sample data?")) resetToSamples();
});

els.resetDialog.addEventListener("close", function () {
  if (els.resetDialog.returnValue === "confirm") resetToSamples();
});

function resetToSamples() {
  responses = makeSampleResponses();
  selectedId = responses.length ? responses[0].id : null;
  saveResponses();
  renderAll();
}

function init() {
  saveResponses();
  renderAll();
}

init();