
// ORDER DETAILS

let studentName = localStorage.getItem("studentName") || "";
let studentID = localStorage.getItem("studentID") || "";
let paymentMethod = localStorage.getItem("paymentMethod") || "";


// Display student information
document.getElementById("student-name").textContent = studentName;
document.getElementById("student-id").textContent = studentID;
document.getElementById("payment-method").textContent =
    paymentMethod.toUpperCase();


// ORDER NUMBER GENERATOR

let orderNumber = localStorage.getItem("orderNumber");

if (!orderNumber) {
    orderNumber = "ORD-" + Date.now().toString().slice(-8);
    localStorage.setItem("orderNumber", orderNumber);
}

document.getElementById("order-number").textContent = orderNumber;


// ESTIMATED PICKUP TIME

// Use the time saved at checkout so refreshing the page doesn't change it
let savedPickup = localStorage.getItem("pickupAt");
let pickupTime = savedPickup ? new Date(savedPickup) : new Date();

if (!savedPickup) {
    pickupTime.setMinutes(pickupTime.getMinutes() + 5);
}

let hours = pickupTime.getHours();
let minutes = pickupTime.getMinutes();

let period = hours >= 12 ? "PM" : "AM";

hours = hours % 12;
hours = hours === 0 ? 12 : hours;

let formattedMinutes = minutes.toString().padStart(2, "0");

document.getElementById("pickup-time").textContent =
    hours + ":" + formattedMinutes + " " + period;


// ORDER SUMMARY

let cart = JSON.parse(localStorage.getItem("confirmedOrder")) || [];

let orderItems = document.getElementById("order-items");
let orderTotal = document.getElementById("order-total");

let ricePrice = 10;
let takeOutFee = 10;
let total = 0;


// DISPLAY ORDERED ITEMS

if (cart.length === 0) {

    orderItems.innerHTML = `
        <tr>
            <td colspan="3">No order items found.</td>
        </tr>
    `;

} else {

    cart.forEach(function(item) {

        let isStandaloneRice = item.standaloneRice === true;
        let isMeal = item.category === "meals" && !isStandaloneRice;

        let riceAdjustment = 0;

        if (isMeal) {
            let riceQuantity = item.riceQuantity ?? item.quantity;
            riceAdjustment = (riceQuantity - item.quantity) * ricePrice;
        }

        let takeOutAdjustment = 0;

        if (isMeal && item.orderType === "take-out") {
            takeOutAdjustment = takeOutFee * item.quantity;
        }

        let subtotal = (item.price * item.quantity)
            + riceAdjustment
            + takeOutAdjustment;

        total += subtotal;

        let row = document.createElement("tr");

        let nameCell = document.createElement("td");
        nameCell.textContent = item.name;

        let quantityCell = document.createElement("td");
        quantityCell.textContent = item.quantity;

        let priceCell = document.createElement("td");
        priceCell.textContent = "₱" + subtotal.toFixed(2);

        row.appendChild(nameCell);
        row.appendChild(quantityCell);
        row.appendChild(priceCell);

        orderItems.appendChild(row);

    });

}


// DISPLAY TOTAL

orderTotal.textContent = "₱" + total.toFixed(2);
