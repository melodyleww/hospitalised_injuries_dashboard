// This file adds open/close behaviour to custom dropdown wrappers so only one
// dropdown stays open at a time and clicking outside closes them

export function initDropdowns() {
  // Find every custom dropdown wrapper on the page
  const wrappers = document.querySelectorAll(".dropdown-wrapper");

  wrappers.forEach((wrapper) => {
    const select = wrapper.querySelector(".dropdown");

    // Opening one dropdown closes all others
    select.addEventListener("mousedown", () => {
      wrappers.forEach((w) => w.classList.remove("open"));
      wrapper.classList.add("open");
    });

    // Close after a value is chosen
    select.addEventListener("change", () => wrapper.classList.remove("open"));

    // Click outside closes the dropdown
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) wrapper.classList.remove("open");
    });
  });
}
