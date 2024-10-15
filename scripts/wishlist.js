function getWishlist() {
  const wishList = JSON.parse(localStorage.getItem("wishlist")) || [];
  document.getElementById("wishnav").textContent = wishList.length;
  return wishList;
}

async function fetchWishlistBooks() {
  const wishlist = getWishlist();
  if (wishlist.length === 0) {
    displayEmptyMessage();
    return;
  }

  try {
    const response = await fetch(
      `https://gutendex.com/books?ids=${wishlist.join(",")}`
    );
    const data = await response.json();
    displayWishlistBooks(data.results);
  } catch (error) {
    console.error("Error fetching wishlist books:", error);
  }
}

function displayWishlistBooks(wishlistBooks) {
  const wishlistContainer = document.getElementById("wishlist-container");
  wishlistContainer.innerHTML = "";

  wishlistBooks.forEach((book) => {
    const coverImage =
      book.formats["image/jpeg"] ||
      "https://images.inc.com/uploaded_files/image/1920x1080/getty_509107562_2000133320009280346_351827.jpg"; // Fallback if cover not available

    const authors = book.authors
      .map(
        (author) =>
          `${author.name} (${author.birth_year} - ${
            author.death_year || "Present"
          })`
      )
      .join(", ");

    const bookCard = document.createElement("div");
    bookCard.classList.add("bookCard");
    bookCard.innerHTML = `
                  <img src="${coverImage}" alt="${book.title}" />
                  <h3>${book.title}</h3>
                  <p>Authors: ${authors}</p>
                  <button class="remove-btn" data-id="${book.id}">Remove from Wishlist</button>
                `;

    const removeButton = bookCard.querySelector(".remove-btn");
    removeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromWishlist(book.id);
    });

    wishlistContainer.appendChild(bookCard);
    wishlistContainer.addEventListener("click", () => {
      window.location.href = `book.html?id=${book.id}`;
    });
  });
}

function displayEmptyMessage() {
  const wishlistContainer = document.getElementById("wishlist-container");
  wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
}

function removeFromWishlist(bookId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter((id) => id !== bookId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  fetchWishlistBooks();
}

function initWishlistPage() {
  fetchWishlistBooks();
}

document.addEventListener("DOMContentLoaded", initWishlistPage);
