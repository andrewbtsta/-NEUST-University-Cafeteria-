let cart = JSON.parse(localStorage.getItem('cart')) || [];

let addToCartButtons = document.querySelectorAll('.btn2, .sbtn2');

addToCartButtons.forEach(function(button) {
    button.addEventListener('click', async function() {

        let menuCard = button.parentElement;

        let name = menuCard.querySelector('.title1, .stitle1').textContent.trim();

        let answer = await confirmAddToCart({
            name: name,
            price: parseFloat(menuCard.querySelector('.title2, .stitle2').textContent.replace(/[₱,]/g, '')),
            image: menuCard.querySelector('img').getAttribute('src')
        });

        if (answer == true) {
            let priceText = menuCard.querySelector('.title2, .stitle2').textContent;
            let price = parseFloat(priceText.replace(/[₱,]/g, ''));

            let image = menuCard.querySelector('img').getAttribute('src');

            let category = 'meals';
            let standaloneRice = false;

            let existingItem = cart.find(function(item) {
                return item.name === name &&
                    Boolean(item.standaloneRice) === standaloneRice;
            });

            if (existingItem) {
                existingItem.quantity++;

                existingItem.riceQuantity =
                    (existingItem.riceQuantity || 0) + 1;

            } else {
                let item = {
                    name: name,
                    price: price,
                    image: image,
                    quantity: 1,
                    category: category,
                    standaloneRice: standaloneRice,
                    riceQuantity: 1,
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

// EXPLORE MORE CATEGORY CARDS

let categoryCards = document.querySelectorAll(".parent2 [data-category]");

categoryCards.forEach(function(card) {

    card.addEventListener("click", function() {

        let category = card.dataset.category;

        window.location.href = "menu.html?category=" + category;

    });

});

// =========================
// VIDEO INTRO
// =========================

const intro = document.getElementById("intro");
const video = document.getElementById("intro-video");

function finishIntro() {
    if (!intro || intro.classList.contains("hide")) return;

    video.pause();
    intro.classList.add("hide");

    sessionStorage.setItem("introPlayed", "true");

    intro.addEventListener("transitionend", function (event) {
        if (event.propertyName === "opacity") {
            intro.remove();
            document.body.classList.add("intro-finished");
        }
    }, { once: true });
}

if (intro && video) {
    if (sessionStorage.getItem("introPlayed")) {
        intro.remove();
        document.body.classList.add("intro-finished");
    } else {
        document.body.classList.remove("intro-finished");

        video.addEventListener("ended", finishIntro, { once: true });
        video.addEventListener("error", finishIntro, { once: true });

        video.play().catch(finishIntro);
    }
}