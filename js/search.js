
let navSearch = document.getElementById("nav-search");
let searchBtn = document.getElementById("search-btn");
let searchDropdown = document.getElementById("search-dropdown");
let searchSuggestions = document.getElementById("search-suggestions");

// Menu items
let menuItems = [
    "Bicol Express",
    "Chicken Adobo",
    "Pork Sisig",
    "Fried Chicken",
    "Pork Sinigang",
    "Pork Chop",
    "Beef Tapa",
    "Hotdog",
    "Fries",
    "Cheeseburger",
    "Siomai",
    "Cheese Sticks",
    "Hotdog Sandwich",
    "Banana Cue",
    "Water",
    "Iced Tea",
    "Iced Coffee",
    "Chocolate Milk"
];

// Redirect to menu page
function goToMenu(item) {

    let searchValue = item || navSearch.value.trim();

    if (searchValue !== "") {
        window.location.href =
            "menu.html?search=" + encodeURIComponent(searchValue);
    }

}

// Display suggestions
function displaySuggestions(items) {

    searchSuggestions.innerHTML = "";

    if (items.length === 0) {
        searchSuggestions.innerHTML = "<p>No results found.</p>";
        return;
    }

    items.forEach(function(item) {

        let suggestion = document.createElement("p");

        suggestion.textContent = item;

        suggestion.addEventListener("click", function() {
            goToMenu(item);
        });

        searchSuggestions.appendChild(suggestion);

    });

}

// Show popular searches when focused
navSearch.addEventListener("focus", function() {

    searchDropdown.classList.add("active");

    if (navSearch.value.trim() === "") {
        displaySuggestions(menuItems.slice(0, 5));
    }

});

// Filter suggestions while typing
navSearch.addEventListener("input", function() {

    let searchValue = navSearch.value.toLowerCase().trim();

    let filteredItems = menuItems.filter(function(item) {
        return item.toLowerCase().includes(searchValue);
    });

    searchDropdown.classList.add("active");

    if (searchValue === "") {
        displaySuggestions(menuItems.slice(0, 5));
    } else {
        displaySuggestions(filteredItems);
    }

});

// Search button
searchBtn.addEventListener("click", function() {
    goToMenu();
});

// Enter key
navSearch.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        event.preventDefault();
        goToMenu();
    }

});

// Close dropdown when clicking outside
document.addEventListener("click", function(event) {

    if (!event.target.closest(".nav-search")) {
        searchDropdown.classList.remove("active");
    }

});
