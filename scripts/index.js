const apiUrl = "https://gutendex.com/books";
let books = [];
const defaultCoverImage =
  "https://images.inc.com/uploaded_files/image/1920x1080/getty_509107562_2000133320009280346_351827.jpg"; // Default image for missing covers

async function fetchBooks(page = 1) {
  try {
    const response = await fetch(apiUrl + `?page=${page}`);
    const data = await response.json();
    books = data.results;
    addBooksToContainer(books);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

function addBooksToContainer(books) {
  const container = document.querySelector(".bookContainer");

  books.forEach((book) => {
    const bookCard = createBookCard(book);
    container.appendChild(bookCard);
  });
}

function createBookCard(book) {
  const bookCard = document.createElement("div");
  bookCard.classList.add("bookCard");

  const coverImage = book.formats["image/jpeg"] || defaultCoverImage;
  const authors = formatAuthors(book.authors);
  const genre = book.subjects.length > 0 ? book.subjects[0] : "Unknown";

  bookCard.innerHTML = `
          <button class="wishlist-btn" data-id="${
            book.id
          }">❤️</button> <!-- Love button -->
          <img src="${coverImage}" alt="${book.title}" />
          <h3>${book.title.slice(0, 40)}...</h3>
          <p>Authors: ${authors}</p>
          <p>Genre: ${genre}</p>
          <p>ID: ${book.id}</p>
        `;

  return bookCard;
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

fetchBooks();
