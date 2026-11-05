// ORDER HISTORY PAGE

let historyList = document.getElementById("history-list");
let historyTop = document.getElementById("history-top");
let historyEmpty = document.getElementById("history-empty");
let historyNote = document.getElementById("history-note");
let clearButton = document.getElementById("clear-history");
let statOrders = document.getElementById("stat-orders");


function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem("orderHistory")) || [];
    } catch (e) {
        return [];
    }
}

function formatPeso(amount) {
    return "₱" + Number(amount).toFixed(2);
}

function formatDate(isoString) {
    let date = new Date(isoString);

    if (isNaN(date)) return "";

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }) + " · " + date.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit"
    });
}

// Small helper so user text is always inserted safely
function el(tag, className, text) {
    let node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}


function buildCard(order, index) {

    let card = el("article", "order-card");
    card.style.animationDelay = Math.min(index * 0.05, 0.4) + "s";

    // HEAD
    let head = el("div", "order-card-head");
    head.appendChild(el("span", "order-no", order.orderNumber));
    head.appendChild(el("span", "order-date", formatDate(order.placedAt)));
    card.appendChild(head);

    // BODY
    let body = el("div", "order-card-body");
    let meta = el("div", "order-meta");

    let itemCount = order.items.reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);

    let preview = order.items.slice(0, 3).map(function (item) {
        return item.quantity + "× " + item.name;
    }).join(", ");

    if (order.items.length > 3) {
        preview += " +" + (order.items.length - 3) + " more";
    }

    meta.appendChild(el("span", "order-preview", preview));
    meta.appendChild(el(
        "span",
        "chip",
        itemCount + (itemCount === 1 ? " item" : " items")
        + " · " + String(order.paymentMethod).toUpperCase()
    ));
    body.appendChild(meta);

    let totalBlock = el("div", "order-total-block");
    totalBlock.appendChild(el("span", "order-total-label", "TOTAL"));
    totalBlock.appendChild(el("span", "order-total", formatPeso(order.total)));
    body.appendChild(totalBlock);

    card.appendChild(body);

    // ACTIONS
    let actions = el("div", "order-actions-row");

    let detailsBtn = el("button", "small-btn", "View details");
    detailsBtn.type = "button";
    detailsBtn.setAttribute("aria-expanded", "false");
    detailsBtn.addEventListener("click", function () {
        let open = card.classList.toggle("open");
        detailsBtn.textContent = open ? "Hide details" : "View details";
        detailsBtn.setAttribute("aria-expanded", String(open));
    });
    actions.appendChild(detailsBtn);

    if (Array.isArray(order.cart) && order.cart.length > 0) {
        let againBtn = el("button", "small-btn fill", "Order again");
        againBtn.type = "button";
        againBtn.addEventListener("click", function () {
            reorder(order);
        });
        actions.appendChild(againBtn);
    }

    let removeBtn = el("button", "small-btn", "Remove");
    removeBtn.type = "button";
    removeBtn.addEventListener("click", function () {
        removeOrder(order.orderNumber);
    });
    actions.appendChild(removeBtn);

    card.appendChild(actions);

    // DETAILS
    let panel = el("div", "order-details-panel");

    let extra = el("div", "order-detail-extra");
    extra.appendChild(el("span", "", "Name: " + order.name));
    extra.appendChild(el("span", "", "Student ID: " + order.studentId));
    if (order.pickupAt) {
        extra.appendChild(el("span", "", "Pick-up: " + formatDate(order.pickupAt)));
    }
    panel.appendChild(extra);

    let table = el("table", "order-detail-table");
    let thead = el("thead");
    let headRow = el("tr");
    ["Item", "Qty", "Price"].forEach(function (label) {
        headRow.appendChild(el("th", "", label));
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    let tbody = el("tbody");
    order.items.forEach(function (item) {
        let row = el("tr");
        let nameText = item.name;
        if (item.orderType === "take-out") nameText += " (take-out)";
        row.appendChild(el("td", "", nameText));
        row.appendChild(el("td", "", item.quantity));
        row.appendChild(el("td", "", formatPeso(item.subtotal)));
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    let tfoot = el("tfoot");
    let footRow = el("tr");
    footRow.appendChild(el("td", "", "Total"));
    footRow.appendChild(el("td", "", ""));
    footRow.appendChild(el("td", "", formatPeso(order.total)));
    tfoot.appendChild(footRow);
    table.appendChild(tfoot);

    panel.appendChild(table);
    card.appendChild(panel);

    return card;
}


function render() {
    let history = loadHistory();

    historyList.innerHTML = "";

    if (history.length === 0) {
        historyTop.hidden = true;
        historyEmpty.hidden = false;
        return;
    }

    historyEmpty.hidden = true;
    historyTop.hidden = false;

    statOrders.textContent = history.length;

    history.forEach(function (order, index) {
        historyList.appendChild(buildCard(order, index));
    });
}


function removeOrder(orderNumber) {
    let history = loadHistory().filter(function (order) {
        return order.orderNumber !== orderNumber;
    });

    localStorage.setItem("orderHistory", JSON.stringify(history));
    historyNote.textContent = "";
    render();
}


// ORDER AGAIN: put the same items back in the cart
function reorder(order) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    order.cart.forEach(function (oldItem) {
        let existing = cart.find(function (item) {
            return item.name === oldItem.name &&
                Boolean(item.standaloneRice) === Boolean(oldItem.standaloneRice);
        });

        if (existing) {
            existing.quantity += oldItem.quantity;
            if (existing.riceQuantity !== undefined) {
                existing.riceQuantity += (oldItem.riceQuantity ?? oldItem.quantity);
            }
        } else {
            cart.push(Object.assign({}, oldItem));
        }
    });

    localStorage.setItem("cart", JSON.stringify(cart));

    if (typeof updateQuantity === "function") updateQuantity();

    historyNote.innerHTML =
        'Items from ' + order.orderNumber +
        ' were added to your cart. <a href="cart.html">Go to cart</a>';
}


// CLEAR ALL
clearButton.addEventListener("click", function () {
    localStorage.removeItem("orderHistory");
    historyNote.textContent = "";
    render();
});

render();
