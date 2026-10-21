const BOOKS_URL = "./data/books.json";

async function loadBooks() {
  try {
    const response = await fetch(BOOKS_URL);
    if (!response.ok) throw new Error("Books data could not be loaded");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function bookCard(book) {
  const detailUrl = `book.html?id=${encodeURIComponent(book.id)}`;
  const price = Number.isFinite(Number(book.priceINR))
    ? `<p class="book-price">₹${Number(book.priceINR).toLocaleString("en-IN")}</p>`
    : "";
  const format = book.format ? `<p>${book.format}${book.pages ? ` · ${book.pages} पृष्ठ` : ""}</p>` : "";
  const saleLink = book.salesStoreUrl
    ? `<a class="btn" href="${book.salesStoreUrl}" target="_blank" rel="noopener">Payhip स्टोर देखें</a>`
    : "";
  return `
    <article class="book-card">
      <div class="book-cover"><span>${book.language || "Book"}</span></div>
      <div class="book-content">
        <h3>${book.title || "Untitled Book"}</h3>
        ${book.alternateTitle ? `<p>${book.alternateTitle}</p>` : ""}
        <p class="book-author">${book.author || book.publisher || "GBSBFORYOU"}</p>
        <p class="book-category">${book.category || "General"}</p>
        ${format}
        ${price}
        <a class="btn" href="${detailUrl}">पुस्तक विवरण</a>
        ${saleLink}
      </div>
    </article>`;
}

async function renderLibrary(targetId) {
  const container = document.getElementById(targetId || "libraryGrid") || document.querySelector("#bookGrid");
  if (!container) return;
  const books = await loadBooks();
  const searchInput = document.querySelector("#searchInput") || document.querySelector("#search");
  const categorySelect = document.querySelector("#categorySelect") || document.querySelector("#category");
  const categories = [...new Set(books.map(b => b.category).filter(Boolean))].sort();
  if (categorySelect) {
    const current = categorySelect.value;
    categorySelect.innerHTML = '<option value="">सभी श्रेणियाँ</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join("");
    categorySelect.value = current;
  }
  const render = () => {
    const search = (searchInput?.value || "").toLowerCase().trim();
    const category = categorySelect?.value || "";
    const filtered = books.filter(book => {
      const text = [book.title, book.alternateTitle, book.author, book.publisher, book.category, book.language, book.description].filter(Boolean).join(" ").toLowerCase();
      return (!search || text.includes(search)) && (!category || book.category === category);
    });
    container.innerHTML = filtered.length ? filtered.map(bookCard).join("") : "<p>कोई पुस्तक नहीं मिली।</p>";
  };
  searchInput?.addEventListener("input", render);
  categorySelect?.addEventListener("change", render);
  render();
}

async function renderBookDetail() {
  const container = document.querySelector("#bookDetail");
  if (!container) return;
  const id = new URLSearchParams(window.location.search).get("id");
  const books = await loadBooks();
  const book = books.find(item => String(item.id) === String(id));
  if (!book) {
    container.innerHTML = "<p>पुस्तक नहीं मिली।</p>";
    return;
  }
  container.innerHTML = `
    <article class="book-detail">
      <div class="book-cover large"><span>${book.language || "Book"}</span></div>
      <div><h1>${book.title}</h1>
      ${book.alternateTitle ? `<p><strong>English title:</strong> ${book.alternateTitle}</p>` : ""}
      <p><strong>लेखक:</strong> ${book.author || "GBSBFORYOU"}</p>
      <p><strong>प्रकाशक:</strong> ${book.publisher || "GBSBFORYOU Publications"}</p>
      <p><strong>श्रेणी:</strong> ${book.category || "General"}</p>
      <p><strong>भाषा:</strong> ${book.language || "Hindi"}</p>
      ${book.format ? `<p><strong>प्रारूप:</strong> ${book.format}</p>` : ""}
      ${book.pages ? `<p><strong>पृष्ठ:</strong> ${book.pages}</p>` : ""}
      ${Number.isFinite(Number(book.priceINR)) ? `<p><strong>मूल्य:</strong> ₹${Number(book.priceINR).toLocaleString("en-IN")}</p>` : ""}
      <p>${book.description || ""}</p>
      ${book.salesStoreUrl ? `<p><a class="btn" href="${book.salesStoreUrl}" target="_blank" rel="noopener">Payhip पर खरीदें / स्टोर देखें</a></p>` : ""}
      </div>
    </article>`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderLibrary();
  renderBookDetail();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(error => console.error("Service Worker Error:", error));
  }
});


// Backward-compatible functions used by the home page and older page templates.
window.GBSB = window.GBSB || {};
window.GBSB.renderFeatured = async function(targetId) {
  const container = document.getElementById(targetId || "featuredGrid");
  if (!container) return;
  const books = await loadBooks();
  container.innerHTML = books.slice(0, 6).map(bookCard).join("");
};
window.GBSB.renderBook = renderBookDetail;
