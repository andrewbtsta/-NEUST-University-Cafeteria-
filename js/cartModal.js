// ADD-TO-CART POPUP (replaces the browser's confirm() box)
// Usage: let ok = await confirmAddToCart({ name, price, image });

function confirmAddToCart(item) {
    return new Promise(function (resolve) {

        let previousFocus = document.activeElement;

        let overlay = document.createElement("div");
        overlay.className = "cart-modal-overlay";

        let modal = document.createElement("div");
        modal.className = "cart-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-label", "Add " + item.name + " to cart");

        let top = document.createElement("div");
        top.className = "cart-modal-top";
        top.innerHTML = "ADD TO <span>CART</span>";

        let body = document.createElement("div");
        body.className = "cart-modal-body";

        if (item.image) {
            let img = document.createElement("img");
            img.className = "cart-modal-img";
            img.src = item.image;
            img.alt = "";
            body.appendChild(img);
        }

        let name = document.createElement("h3");
        name.className = "cart-modal-name";
        name.textContent = item.name;
        body.appendChild(name);

        if (!isNaN(item.price)) {
            let price = document.createElement("p");
            price.className = "cart-modal-price";
            price.textContent = "₱" + Number(item.price).toFixed(2);
            body.appendChild(price);
        }

        let question = document.createElement("p");
        question.className = "cart-modal-question";
        question.textContent = "Add this item to your cart?";
        body.appendChild(question);

        let actions = document.createElement("div");
        actions.className = "cart-modal-actions";

        let cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "cart-modal-btn cancel";
        cancelBtn.textContent = "Cancel";

        let addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "cart-modal-btn confirm-add";
        addBtn.textContent = "Add to Cart";

        actions.appendChild(cancelBtn);
        actions.appendChild(addBtn);

        modal.appendChild(top);
        modal.appendChild(body);
        modal.appendChild(actions);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        requestAnimationFrame(function () {
            overlay.classList.add("show");
        });
        addBtn.focus();

        function close(result) {
            document.removeEventListener("keydown", onKey);
            overlay.classList.remove("show");
            setTimeout(function () { overlay.remove(); }, 250);
            if (previousFocus && previousFocus.focus) previousFocus.focus();
            resolve(result);
        }

        function onKey(event) {
            if (event.key === "Escape") {
                close(false);
            } else if (event.key === "Tab") {
                // keep focus inside the popup
                event.preventDefault();
                (document.activeElement === addBtn ? cancelBtn : addBtn).focus();
            }
        }

        document.addEventListener("keydown", onKey);
        cancelBtn.addEventListener("click", function () { close(false); });
        addBtn.addEventListener("click", function () { close(true); });
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) close(false);
        });
    });
}


// Small message shown after an item is added
let cartToastTimer = null;

function showCartToast(name) {
    let toast = document.querySelector(".cart-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "cart-toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }

    toast.innerHTML = "";
    let message = document.createElement("span");
    let bold = document.createElement("b");
    bold.textContent = name;
    message.appendChild(bold);
    message.appendChild(document.createTextNode(" added to cart."));

    let link = document.createElement("a");
    link.href = "cart.html";
    link.textContent = "View cart";

    toast.appendChild(message);
    toast.appendChild(link);

    // restart the animation if it's already showing
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");

    clearTimeout(cartToastTimer);
    cartToastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2600);
}
