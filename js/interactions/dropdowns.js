// js/interactions/dropdowns.js

export function initDropdowns() {
    const wrappers = document.querySelectorAll(".dropdown-wrapper");
    
    wrappers.forEach(wrapper => {
        const select = wrapper.querySelector(".dropdown");
        
        select.addEventListener("mousedown", () => {
            wrappers.forEach(w => w.classList.remove("open"));
            wrapper.classList.add("open");
        });
        
        select.addEventListener("change", () => wrapper.classList.remove("open"));
        
        document.addEventListener("click", (e) => {
            if (!wrapper.contains(e.target)) wrapper.classList.remove("open");
        });
    });
}