const API_URL = "http://localhost:3001/articles";
const TAG_COLORS = {
  JavaScript: "purple",
  Frontend: "blue",
  "Web Dev": "teal",
  "REST API": "orange",
  Arquitetura: "pink",
};

const form = document.querySelector("#article-form");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");
const authorInput = document.querySelector("#author");
const dateInput = document.querySelector("#date");
const selectedTagInput = document.querySelector("#selected-tag");
const articlesContainer = document.querySelector("#articles");
const articlesBadge = document.querySelector("#articles-badge");
const emptyState = document.querySelector("#empty-state");
const searchFilter = document.querySelector("#search-filter");
const sortSelect = document.querySelector("#sort-select");
const payloadCode = document.querySelector("#payload-code");
const connectionStatus = document.querySelector("#connection-status");
const connectionLabel = document.querySelector("#connection-label");
const submitButton = document.querySelector("#submit-btn");
const submitText = document.querySelector("#submit-text");
const submitIcon = document.querySelector("#submit-icon");
const submitSpinner = document.querySelector("#submit-spinner");
let articles = [];

function localDateISO() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();
  return new Date(now.getTime() - timezoneOffset * 60_000)
    .toISOString()
    .slice(0, 10);
}

function getFormPayload() {
  return {
    title: titleInput.value.trim(),
    content: contentInput.value.trim(),
    author: authorInput.value.trim(),
    date: dateInput.value,
    tag: selectedTagInput.value,
  };
}

function updatePayloadViewer() {
  payloadCode.textContent = JSON.stringify(getFormPayload(), null, 2);
}

function updateCounters() {
  document.querySelector("#title-counter").textContent =
    `${titleInput.value.length} / 120`;
  const words = contentInput.value.trim()
    ? contentInput.value.trim().split(/\s+/).length
    : 0;
  document.querySelector("#content-counter").textContent =
    `${words} ${words === 1 ? "palavra" : "palavras"}`;
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " is-error" : ""}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.textContent = message;
  const container = document.querySelector("#toast-container");
  container.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3500);
}

function setConnectionStatus(connected) {
  connectionStatus.classList.toggle("is-offline", !connected);
  connectionLabel.textContent = connected
    ? "API conectada"
    : "API desconectada";
}

function formatDate(dateValue) {
  if (!dateValue) return "Data não informada";
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name = "") {
  const names = name.trim().split(/\s+/).filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return (names[0] || "?").slice(0, 2).toUpperCase();
}

function createIconButton(icon, label, className = "") {
  const button = document.createElement("button");
  button.className = `icon-button ${className}`.trim();
  button.type = "button";
  button.title = label;
  button.setAttribute("aria-label", label);
  const iconElement = document.createElement("span");
  iconElement.className = "material-symbols-outlined";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = icon;
  button.appendChild(iconElement);
  return button;
}

function renderArticle(articleData) {
  const article = document.createElement("article");
  article.className = "article-card";
  article.dataset.id = articleData.id;
  article.dataset.date = articleData.date || "";

  const inner = document.createElement("div");
  inner.className = "article-inner";
  const topLine = document.createElement("div");
  topLine.className = "article-topline";
  const metadata = document.createElement("div");
  metadata.className = "article-meta";

  const tag = document.createElement("span");
  tag.className = `article-tag tag-${TAG_COLORS[articleData.tag] || "purple"}`;
  tag.textContent = articleData.tag || "Geral";
  metadata.appendChild(tag);

  const createdBadge = document.createElement("span");
  createdBadge.className = "created-badge";
  const createdIcon = document.createElement("span");
  createdIcon.className = "status-dot status-dot-small";
  createdIcon.setAttribute("aria-hidden", "true");
  createdBadge.append(createdIcon, document.createTextNode("Publicado"));
  metadata.appendChild(createdBadge);

  const words = (articleData.content || "").trim().split(/\s+/).filter(Boolean).length;
  const readTime = document.createElement("span");
  readTime.className = "reading-time";
  const clockIcon = document.createElement("span");
  clockIcon.className = "material-symbols-outlined";
  clockIcon.setAttribute("aria-hidden", "true");
  clockIcon.textContent = "schedule";
  readTime.append(
    clockIcon,
    document.createTextNode(`${Math.max(1, Math.ceil(words / 45))} min de leitura`),
  );
  metadata.appendChild(readTime);

  const actions = document.createElement("div");
  actions.className = "article-actions";
  const deleteButton = createIconButton("delete", "Excluir artigo", "btn-delete-card");
  actions.appendChild(deleteButton);
  topLine.append(metadata, actions);

  const textBlock = document.createElement("div");
  textBlock.className = "article-text";
  const title = document.createElement("h3");
  title.textContent = articleData.title || "Artigo sem título";
  const content = document.createElement("p");
  content.className = "article-content";
  content.textContent = articleData.content || "";
  textBlock.append(title, content);

  const footer = document.createElement("div");
  footer.className = "article-footer";
  const authorBlock = document.createElement("div");
  authorBlock.className = "author-block";
  const avatar = document.createElement("span");
  avatar.className = "author-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = getInitials(articleData.author);
  const authorDetails = document.createElement("span");
  authorDetails.className = "author-details";
  const authorName = document.createElement("strong");
  authorName.textContent = articleData.author || "Autor desconhecido";
  const date = document.createElement("span");
  date.textContent = `Autor • ${formatDate(articleData.date)}`;
  authorDetails.append(authorName, date);
  authorBlock.append(avatar, authorDetails);

  const id = document.createElement("span");
  id.className = "article-id";
  id.textContent = `ID: #${articleData.id}`;
  footer.append(authorBlock, id);
  inner.append(topLine, textBlock, footer);
  article.appendChild(inner);
  return article;
}

function renderArticles() {
  const query = searchFilter.value.trim().toLocaleLowerCase("pt-BR");
  const order = sortSelect.value;
  const filteredArticles = articles
    .filter((article) => {
      const searchableText = `${article.title || ""} ${article.content || ""} ${
        article.author || ""
      } ${article.tag || ""}`.toLocaleLowerCase("pt-BR");
      return searchableText.includes(query);
    })
    .sort((first, second) => {
      const firstDate = first.date || "";
      const secondDate = second.date || "";
      return order === "newest"
        ? secondDate.localeCompare(firstDate)
        : firstDate.localeCompare(secondDate);
    });

  articlesContainer.replaceChildren(
    ...filteredArticles.map((article) => renderArticle(article)),
  );
  articlesBadge.textContent = `${articles.length} ${
    articles.length === 1 ? "artigo" : "artigos"
  }`;
  emptyState.classList.toggle("is-hidden", filteredArticles.length > 0);
}

async function loadArticles() {
  try {
    const response = await fetch(API_URL);
    setConnectionStatus(true);
    if (!response.ok) {
      throw new Error(`Falha ao carregar artigos (HTTP ${response.status}).`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("A API retornou uma lista de artigos inválida.");
    }
    articles = data;
    setConnectionStatus(true);
    renderArticles();
  } catch (error) {
    setConnectionStatus(!(error instanceof TypeError));
    showToast(
      `${error.message} Confira se o JSON Server está rodando na porta 3001.`,
      "error",
    );
  }
}

function setSelectedTag(tagValue) {
  selectedTagInput.value = tagValue;
  document.querySelectorAll(".tag-pill").forEach((button) => {
    const isSelected = button.dataset.tag === tagValue;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  updatePayloadViewer();
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitIcon.classList.toggle("is-hidden", isSubmitting);
  submitSpinner.classList.toggle("is-hidden", !isSubmitting);
  submitText.textContent = isSubmitting
    ? "Publicando artigo..."
    : "Publicar artigo";
}

function setPreviewMode(isPreviewMode) {
  const previewButton = document.querySelector("#preview-toggle-btn");
  const previewPane = document.querySelector("#content-preview-pane");
  contentInput.classList.toggle("is-hidden", isPreviewMode);
  previewPane.classList.toggle("is-hidden", !isPreviewMode);
  previewButton.setAttribute("aria-pressed", String(isPreviewMode));
  previewButton.querySelector("span:last-child").textContent = isPreviewMode
    ? "Editar conteúdo"
    : "Pré-visualizar";
  previewPane.textContent = contentInput.value || "Nenhum conteúdo para visualizar.";
}

function formatSelection(format) {
  const start = contentInput.selectionStart;
  const end = contentInput.selectionEnd;
  const selected = contentInput.value.slice(start, end) || "texto";
  const formats = {
    bold: [`**${selected}**`, start, end],
    italic: [`*${selected}*`, start, end],
    code: [`\`${selected}\``, start, end],
    quote: [`> ${selected}`, start, end],
    list: [`- ${selected}`, start, end],
  };
  const [replacement, selectionStart, selectionEnd] = formats[format];
  contentInput.setRangeText(replacement, selectionStart, selectionEnd, "end");
  contentInput.focus();
  contentInput.dispatchEvent(new Event("input", { bubbles: true }));
}

document.querySelectorAll(".tag-pill").forEach((button) => {
  button.addEventListener("click", () => setSelectedTag(button.dataset.tag));
});

[titleInput, contentInput, authorInput, dateInput].forEach((input) => {
  input.addEventListener("input", () => {
    updatePayloadViewer();
    updateCounters();
    if (input === contentInput && !document.querySelector("#content-preview-pane").classList.contains("is-hidden")) {
      document.querySelector("#content-preview-pane").textContent =
        contentInput.value || "Nenhum conteúdo para visualizar.";
    }
  });
});

document.querySelectorAll(".format-btn").forEach((button) => {
  button.addEventListener("click", () => formatSelection(button.dataset.format));
});

document.querySelector("#preview-toggle-btn").addEventListener("click", (event) => {
  const isPreviewVisible = event.currentTarget.getAttribute("aria-pressed") !== "true";
  setPreviewMode(isPreviewVisible);
});

document.querySelector("#toggle-payload").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const isExpanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!isExpanded));
  document.querySelector("#payload-viewer").classList.toggle("is-hidden", isExpanded);
});

document.querySelector("#btn-fill-mock").addEventListener("click", () => {
  const examples = [
    {
      title: "Dominando requisições POST com Fetch API",
      content:
        "A Fetch API permite enviar dados para um servidor de forma assíncrona. Com JSON e Promises, podemos criar fluxos de publicação claros e fáceis de manter.",
      author: "Mariana Duarte",
      tag: "JavaScript",
    },
    {
      title: "Design responsivo com CSS Grid",
      content:
        "CSS Grid facilita a criação de layouts que se adaptam a diferentes telas. Combine colunas flexíveis, media queries e espaçamentos consistentes para uma experiência melhor.",
      author: "Gabriel Antunes",
      tag: "Frontend",
    },
  ];
  const example = examples[Math.floor(Math.random() * examples.length)];
  titleInput.value = example.title;
  contentInput.value = example.content;
  authorInput.value = example.author;
  dateInput.value = localDateISO();
  setSelectedTag(example.tag);
  updateCounters();
  updatePayloadViewer();
  setPreviewMode(
    document.querySelector("#preview-toggle-btn").getAttribute("aria-pressed") ===
      "true",
  );
  showToast("Exemplo preenchido. Revise os campos antes de publicar.");
});

searchFilter.addEventListener("input", renderArticles);
sortSelect.addEventListener("change", renderArticles);

articlesContainer.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest(".btn-delete-card");
  if (!deleteButton) return;

  const article = deleteButton.closest(".article-card");
  const articleId = article.dataset.id;
  deleteButton.disabled = true;
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(articleId)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Não foi possível excluir o artigo (HTTP ${response.status}).`);
    }
    articles = articles.filter((item) => String(item.id) !== articleId);
    renderArticles();
    showToast("Artigo removido com sucesso.");
  } catch (error) {
    deleteButton.disabled = false;
    showToast(error.message, "error");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const articleData = getFormPayload();
  setSubmitting(true);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articleData),
    });
    if (!response.ok) {
      throw new Error(`Não foi possível publicar o artigo (HTTP ${response.status}).`);
    }
    const savedArticle = await response.json();
    articles.unshift(savedArticle);
    form.reset();
    dateInput.value = localDateISO();
    setSelectedTag("JavaScript");
    setPreviewMode(false);
    updateCounters();
    updatePayloadViewer();
    renderArticles();
    setConnectionStatus(true);
    showToast("Artigo publicado com sucesso (HTTP 201).");
  } catch (error) {
    if (error instanceof TypeError) setConnectionStatus(false);
    showToast(error.message, "error");
  } finally {
    setSubmitting(false);
  }
});

dateInput.value = localDateISO();
updateCounters();
updatePayloadViewer();
loadArticles();
