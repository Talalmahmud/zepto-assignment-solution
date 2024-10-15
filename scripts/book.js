function getBookIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchBookDetails(bookId) {
  try {
    const response = await fetch(`https://gutendex.com/books?ids=${bookId}`);
    const data = await response.json();
    const book = data.results[0];
    displayBookDetails(book);
  } catch (error) {
    console.error("Error fetching book details:", error);
  }
}

function displayBookDetails(book) {
  const bookDetailsContainer = document.querySelector(
    ".book-details-container"
  );

  const authors = book.authors
    .map(
      (author) =>
        `${author.name} (${author.birth_year} - ${
          author.death_year || "Present"
        })`
    )
    .join(", ");

  const genres = book.subjects.join(", ") || "Unknown";

  // Dynamically adding book details to the page following your class structure
  bookDetailsContainer.innerHTML = `
          <div class="book-image">
            <img src="${book.formats["image/jpeg"]}" alt="${book.title}" />
          </div>
          <div class="book-info">
            <h1>${book.title}</h1>
            <p><strong>Authors:</strong> ${authors}</p>
            <p><strong>Subjects:</strong> ${genres}</p>
            <p><strong>Download Count:</strong> ${book.download_count}</p>
            <p><strong>Language:</strong> ${book.languages.join(", ")}</p>
            <p><strong>Media Type:</strong> ${book.media_type}</p>
            <a href="${
              book.formats["text/html"]
            }" target="_blank">Read Book Online</a>
          </div>
        `;
}

function initBookDetailsPage() {
  const bookId = getBookIdFromURL();
  if (bookId) {
    fetchBookDetails(bookId);
  } else {
    console.error("Book ID not found in the URL");
  }
}

document.addEventListener("DOMContentLoaded", initBookDetailsPage);
