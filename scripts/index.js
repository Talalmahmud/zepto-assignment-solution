const apiUrl = "https://gutendex.com/books";
let books = [];
let currentPage = 1;
let genres = new Set();
const defaultCoverImage =
  "https://images.inc.com/uploaded_files/image/1920x1080/getty_509107562_2000133320009280346_351827.jpg";

const maxVisiblePages = 5;

function toggleLoader(show) {
  const loader = document.getElementById("loader");
  loader.style.display = show ? "block" : "none";
}

function updateLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || null;
}

async function fetchBooks(page = 1, searchQuery = "", topic = "") {
  createPagination(0);
  toggleLoader(true);
  clearBookContainer();
  updateWishlistCount();

  const url = buildApiUrl(page, searchQuery, topic);

  try {
    const response = await fetch(url);
    const data = await response.json();
    books = data.results;

    collectGenres(books);
    displayGenres();

    addBooksToContainer(books);
    createPagination(data.count);
  } catch (error) {
    console.error("Error fetching books:", error);
  } finally {
    toggleLoader(false);
  }
}

function buildApiUrl(page, searchQuery, topic) {
  let url = `${apiUrl}?page=${page}`;
  if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
  if (topic) url += `&topic=${encodeURIComponent(topic)}`;
  return url;
}

function collectGenres(books) {
  books.forEach((book) => {
    if (book.subjects && book.subjects.length > 0) {
      book.subjects.forEach((subject) => genres.add(subject));
    }
  });
}

function displayGenres() {
  const genreArray = Array.from(genres);
  const dropdown = document.getElementById("genre-dropdown");
  const savedGenre = getFromLocalStorage("genre");
  dropdown.innerHTML = '<option value="">Select a genre</option>';

  genreArray.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    if (genre === savedGenre) {
      option.selected = true;
    }

    dropdown.appendChild(option);
  });
}

function clearBookContainer() {
  document.querySelector(".bookContainer").innerHTML = "";
}

function addBooksToContainer(books) {
  const container = document.querySelector(".bookContainer");

  books.forEach((book) => {
    const bookCard = createBookCard(book);
    container.appendChild(bookCard);
  });

  updateWishlistIcons(); // Update the wishlist icons based on localStorage
}

function createBookCard(book) {
  const bookCard = document.createElement("div");
  bookCard.classList.add("bookCard");

  const coverImage = book.formats["image/jpeg"] || defaultCoverImage;
  const authors = formatAuthors(book.authors);
  const genres = book.subjects.join(", ") || "Unknown";

  bookCard.innerHTML = `
    <button class="wishlist-btn" data-id="${
      book.id
    }">❤️</button> <!-- Love button -->
    <img src="${coverImage}" alt="${book.title}" />
    <div class="book-info">
    <h3>${truncateTitle(book.title, 20)}</h3>
    <p><strong>Authors:</strong> ${authors}</p>
    <p><strong>Genre:</strong> ${genres}</p>
    <p><strong>ID:</strong> ${book.id}</p>
    </div>
  `;

  addCardEventListeners(bookCard, book.id);

  return bookCard;
}

function truncateTitle(title, maxLength) {
  return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
}

function formatAuthors(authors) {
  return authors
    .map(
      (author) =>
        `${author.name} (${author.birth_year} - ${
          author.death_year || "Present"
        })`
    )
    .join(", ");
}

function addCardEventListeners(bookCard, bookId) {
  const loveButton = bookCard.querySelector(".wishlist-btn");

  bookCard.addEventListener("click", () => {
    window.location.href = `book.html?id=${bookId}`;
  });

  loveButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent the card click event
    toggleWishlist(bookId);
  });
}

function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function toggleWishlist(bookId) {
  const wishlist = getWishlist();
  const bookIndex = wishlist.indexOf(bookId);

  if (bookIndex === -1) {
    wishlist.push(bookId);
  } else {
    wishlist.splice(bookIndex, 1);
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistIcons();
  updateWishlistCount();
}

function updateWishlistIcons() {
  const wishlist = getWishlist();
  document.querySelectorAll(".wishlist-btn").forEach((button) => {
    const bookId = parseInt(button.dataset.id);
    button.classList.toggle("wishlisted", wishlist.includes(bookId));
  });
}

function updateWishlistCount() {
  const wishlist = getWishlist();
  document.getElementById("wishnav").textContent = wishlist.length;
}

function createPagination(totalBooks) {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(totalBooks / 32);

  for (let i = 1; i <= totalPages; i++) {
    if (shouldDisplayPage(i, totalPages)) {
      const button = createPaginationButton(i);
      pagination.appendChild(button);
    } else if (i === 2 || i === totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "…";
      pagination.appendChild(ellipsis);
    }
  }
}

function createPaginationButton(pageNumber) {
  const button = document.createElement("button");
  button.textContent = pageNumber;
  button.classList.toggle("active", pageNumber === currentPage);

  button.addEventListener("click", () => {
    currentPage = pageNumber;
    fetchBooks(pageNumber);
  });

  return button;
}

function shouldDisplayPage(pageNumber, totalPages) {
  return (
    pageNumber === 1 ||
    pageNumber === totalPages ||
    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
  );
}

function initialize() {
  const savedTitle = getFromLocalStorage("title");
  const savedGenre = getFromLocalStorage("genre");

  const searchBar = document.getElementById("search-bar");
  const genreDropdown = document.getElementById("genre-dropdown");

  if (savedTitle) {
    searchBar.value = savedTitle;
  }

  if (savedGenre) {
    genreDropdown.value = savedGenre;
  }

  fetchBooks(1, savedTitle, savedGenre);

  addEventListeners();
}

function addEventListeners() {
  document.getElementById("search-bar").addEventListener("input", (e) => {
    const searchQuery = e.target.value;
    updateLocalStorage("title", searchQuery);
    const selectedGenre = getFromLocalStorage("genre");
    fetchBooks(1, searchQuery, selectedGenre);
  });

  document.getElementById("genre-dropdown").addEventListener("change", (e) => {
    const selectedGenre = e.target.value;
    updateLocalStorage("genre", selectedGenre);
    const searchQuery = getFromLocalStorage("title");
    fetchBooks(1, searchQuery, selectedGenre);
  });
}

document.addEventListener("DOMContentLoaded", initialize);

fetchBooks();
