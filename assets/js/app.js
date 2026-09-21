const BOOKS_URL = "./data/books.json";

async function loadBooks() {
  try {
    const response = await fetch(BOOKS_URL);

    if (!response.ok) {
      throw new Error("Books data could not be loaded");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function bookCard(book) {
  return `
    <article class="book-card">
      <div class="book-cover">
        <span>${book.language || "Book"}</span>
      </div>

      <div class="book-content">
        <h3>${book.title || "Untitled Book"}</h3>

        <p class="book-author">
          ${book.author || book.publisher || "GBSBFORYOU"}
        </p>

        <p class="book-category">
          ${book.category || "General"}
        </p>

        <a class="btn" href="book.html?id=${encodeURIComponent(book.id)}">
          पुस्तक देखें
        </a>
      </div>
    </article>
  `;
}

async function renderLibrary() {
  const container = document.querySelector("#bookGrid");

  if (!container) return;

  const books = await loadBooks();

  container.innerHTML = books.length
    ? books.map(bookCard).join("")
    : "<p>अभी कोई पुस्तक उपलब्ध नहीं है।</p>";

  setupFilters(books);
}

function setupFilters(books) {
  const searchInput = document.querySelector("#searchInput");
  const categorySelect = document.querySelector("#categorySelect");
  const container = document.querySelector("#bookGrid");

  if (!container) return;

  const render = () => {
    const search = (searchInput?.value || "").toLowerCase().trim();
    const category = categorySelect?.value || "";

    const filtered = books.filter(book => {
      const text = [
        book.title,
        book.author,
        book.publisher,
        book.category,
        book.language
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || text.includes(search);
      const matchesCategory =
        !category || book.category === category;

      return matchesSearch && matchesCategory;
    });

    container.innerHTML = filtered.length
      ? filtered.map(bookCard).join("")
      : "<p>कोई पुस्तक नहीं मिली।</p>";
  };

  searchInput?.addEventListener("input", render);
  categorySelect?.addEventListener("change", render);
}

async function renderBookDetail() {
  const container = document.querySelector("#bookDetail");

  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const books = await loadBooks();
  const book = books.find(item => String(item.id) === String(id));

  if (!book) {
    container.innerHTML = "<p>पुस्तक नहीं मिली।</p>";
    return;
  }

  container.innerHTML = `
    <article class="book-detail">
      <div class="book-cover large">
        <span>${book.language || "Book"}</span>
      </div>

      <div>
        <h1>${book.title}</h1>

        <p><strong>लेखक:</strong>
          ${book.author || "GBSBFORYOU"}
        </p>

        <p><strong>प्रकाशक:</strong>
          ${book.publisher || "GBSBFORYOU Publications"}
        </p>

        <p><strong>श्रेणी:</strong>
          ${book.category || "General"}
        </p>

        <p><strong>भाषा:</strong>
          ${book.language || "Hindi"}
        </p>

        <p>${book.description || ""}</p>
      </div>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderLibrary();
  renderBookDetail();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch(error =>
        console.error("Service Worker Error:", error)
      );
  }
});
