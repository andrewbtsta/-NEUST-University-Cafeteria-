// CHECKOUT PAGE

const RICE_PRICE = 10;
const TAKE_OUT_FEE = 10;
const PICKUP_MINUTES = 5;

let checkoutForm = document.getElementById("checkout-form");
let confirmButton = document.getElementById("confirm-order");
let confirmLabel = confirmButton.querySelector(".confirm-label");
let confirmNote = document.getElementById("confirm-note");

let summaryItems = document.getElementById("summary-items");
let summaryTotal = document.getElementById("summary-total");
let summaryEmpty = document.getElementById("summary-empty");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let isPlacingOrder = false;


// PRICE OF ONE CART LINE (item + extra rice + take-out fee)
function getSubtotal(item) {
    let isStandaloneRice = item.standaloneRice === true;
    let isMeal = item.category === "meals" && !isStandaloneRice;

    let riceAdjustment = 0;
    let takeOutAdjustment = 0;

    if (isMeal) {
        let riceQuantity = item.riceQuantity ?? item.quantity;
        riceAdjustment = (riceQuantity - item.quantity) * RICE_PRICE;

        if (item.orderType === "take-out") {
            takeOutAdjustment = TAKE_OUT_FEE * item.quantity;
        }
    }

    return (item.price * item.quantity) + riceAdjustment + takeOutAdjustment;
}


// ORDER SUMMARY
let total = 0;

summaryItems.innerHTML = "";

cart.forEach(function (item) {
    let subtotal = getSubtotal(item);
    total += subtotal;

    let row = document.createElement("tr");

    [item.name, item.quantity, "₱" + subtotal.toFixed(2)].forEach(function (value) {
        let cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    });

    summaryItems.appendChild(row);
});

summaryEmpty.style.display = cart.length === 0 ? "block" : "none";
summaryTotal.textContent = "₱" + total.toFixed(2);


// BUTTON STATES
function setNote(message, html) {
    if (html) {
        confirmNote.innerHTML = html;
    } else {
        confirmNote.textContent = message || "";
    }
}

if (cart.length === 0) {
    confirmButton.disabled = true;
    confirmLabel.textContent = "Cart is empty";
    setNote("", 'Nothing to confirm yet. <a href="menu.html">Browse the menu</a>');
}

// Shake the button when the form has errors
checkoutForm.addEventListener("invalid", function () {
    confirmButton.classList.remove("shake");
    void confirmButton.offsetWidth; // restart the animation
    confirmButton.classList.add("shake");
}, true);

confirmButton.addEventListener("animationend", function (event) {
    if (event.animationName === "confirm-shake") {
        confirmButton.classList.remove("shake");
    }
});

// Clear the note once the user fixes something
checkoutForm.addEventListener("input", function () {
    if (cart.length > 0) setNote("");
});


// CONFIRM ORDER
// Using "submit" means the browser validates the form first and
// pressing Enter inside a field works the same as clicking the button.
checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (isPlacingOrder || cart.length === 0) return;

    let name = document.getElementById("name").value.trim();
    let id = document.getElementById("idNum").value.trim();
    let paymentMethod = document.querySelector(
        'input[name="methodType"]:checked'
    ).value;

    isPlacingOrder = true;
    setNote("");

    let now = new Date();
    let pickupAt = new Date(now.getTime() + PICKUP_MINUTES * 60000);

    let orderNumber = "ORD-" + now.getTime().toString().slice(-8);

    let order = {
        orderNumber: orderNumber,
        name: name,
        studentId: id,
        paymentMethod: paymentMethod,
        placedAt: now.toISOString(),
        pickupAt: pickupAt.toISOString(),
        total: total,
        // Display lines
        items: cart.map(function (item) {
            return {
                name: item.name,
                quantity: item.quantity,
                subtotal: getSubtotal(item),
                orderType: item.orderType || null
            };
        }),
        // Original cart items, used by "Order again"
        cart: cart
    };

    // SAVE TO ORDER HISTORY (newest first)
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem("orderHistory")) || [];
    } catch (e) {
        history = [];
    }
    history.unshift(order);
    localStorage.setItem("orderHistory", JSON.stringify(history));

    // DATA FOR THE CONFIRMATION PAGE
    localStorage.setItem("studentName", name);
    localStorage.setItem("studentID", id);
    localStorage.setItem("paymentMethod", paymentMethod);
    localStorage.setItem("orderNumber", orderNumber);
    localStorage.setItem("pickupAt", pickupAt.toISOString());
    localStorage.setItem("confirmedOrder", JSON.stringify(cart));

    // CLEAR THE CART
    localStorage.removeItem("cart");

    // GO TO THE ORDER PAGE
    window.location.href = "order.html";
});
