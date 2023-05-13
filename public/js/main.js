const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");

function backdropClickHandler() {
  backdrop.style.display = "none";
  sideDrawer.classList.remove("open");
}

function menuToggleClickHandler() {
  backdrop.style.display = "block";
  sideDrawer.classList.add("open");
}

backdrop.addEventListener("click", backdropClickHandler);
menuToggle.addEventListener("click", menuToggleClickHandler);

const errorMessage = $("#error-message");
console.log(errorMessage.length, errorMessage);
if (errorMessage.length != 0) {
  errorMessage.animate({ opacity: "1" }, 1000);
  setTimeout(() => {
    errorMessage.animate({ opacity: "0" }, 1000, function () {
      errorMessage.hide();
    });
  }, 5000);
}
