const postsLoggedIn = document.querySelectorAll(".posts");

function addComment(event) {
  console.log(event);
}

postsLoggedIn.addEventListener("click", addComment);
