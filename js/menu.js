let cart = JSON.parse(localStorage.getItem('cart')) || [];

let addToCartButtons = document.querySelectorAll('.add-to-cart button');

addToCartButtons.forEach(function(button) {
    button.addEventListener('click', async function() {

        let menuCard = button.closest('.menu-card');
        let name = menuCard.querySelector('.name h3').textContent.trim();

        let answer = await confirmAddToCart({
            name: name,
            price: parseFloat(menuCard.querySelector('.price p').textContent.replace(/[₱,]/g, '')),
            image: menuCard.querySelector('img').getAttribute('src')
        });

        if (answer == true) {
            let priceText = menuCard.querySelector('.price p').textContent;
            let price = parseFloat(priceText.replace(/[₱,]/g, ''));
            let image = menuCard.querySelector('img').getAttribute('src');
            let category = menuCard.dataset.category;
            let standaloneRice = menuCard.dataset.standaloneRice === 'true';

            let existingItem = cart.find(function(item) {
                return item.name === name &&
                    Boolean(item.standaloneRice) === standaloneRice;
            });

            if (existingItem) {
                existingItem.quantity++;

                // Add one default rice for each additional meal
                if (category === 'meals' && !standaloneRice) {
                    existingItem.riceQuantity =
                        (existingItem.riceQuantity || 0) + 1;
                }
            } else {
                let item = {
                    name: name,
                    price: price,
                    image: image,
                    quantity: 1,
                    category: category,
                    standaloneRice: standaloneRice,
                    riceQuantity:
                        category === 'meals' && !standaloneRice ? 1 : 0,
                    orderType: 'dine-in'
                };

                cart.push(item);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateQuantity();
            showCartToast(name);
        }
    });
});

// FILTER MENU
let searchForm = document.querySelector("#search-form");
let searchInput = document.querySelector("#search");
let menuCards = document.querySelectorAll(".menu-card");
let noResults = document.querySelector("#no-results");
let categoryLinks = document.querySelectorAll(".category-section ul li a");

// GET CATEGORY FROM URL
let activeCategory = new URLSearchParams(window.location.search)
    .get("category") || "all";

// FILTER MENU ITEMS
let filterMenu = () => {
    let searchValue = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    menuCards.forEach((card) => {
        let itemName = card.querySelector(".name h3").textContent.toLowerCase();
        let itemCategory = card.dataset.category;

        let matchesSearch = itemName.includes(searchValue);
        let matchesCategory =
            activeCategory === "all" || itemCategory === activeCategory;

        if (matchesSearch && matchesCategory) {
            card.style.display = "";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    noResults.hidden = visibleCount > 0;
};

// SEARCH BUTTON
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterMenu();
});

// SEARCH WHILE TYPING
searchInput.addEventListener("input", filterMenu);

// CATEGORY BUTTONS
categoryLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        activeCategory = link.getAttribute("href").substring(1);

        categoryLinks.forEach((category) => {
            category.classList.remove("active");
        });

        link.classList.add("active");

        filterMenu();
    });
});

// HIGHLIGHT SELECTED CATEGORY ON PAGE LOAD
categoryLinks.forEach((link) => {
    let category = link.getAttribute("href").substring(1);

    link.classList.toggle("active", category === activeCategory);
});

// DISPLAY SELECTED CATEGORY
filterMenu();



// search
let urlParams = new URLSearchParams(window.location.search);
let searchQuery = urlParams.get("search");

if (searchQuery) {
    search.value = searchQuery;
    searchForm.dispatchEvent(new Event("submit"));
}

