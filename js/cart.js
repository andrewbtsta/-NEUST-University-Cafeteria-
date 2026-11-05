let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Get elements
let cartItems = document.querySelector('#cart-items');
let cartTotal = document.querySelector('#cart-total');
let emptyMessage = document.querySelector('#empty-cart');
let cartTable = document.querySelector('#cart-table');

// Prices
let ricePrice = 10;
let takeOutFee = 10;


// FUNCTION 1: Display cart
function displayCart() {

    cart = JSON.parse(localStorage.getItem('cart')) || [];

    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        emptyMessage.style.display = 'block';
        cartTable.style.display = 'none';
        cartTotal.textContent = 'TOTAL: ₱0.00';
    } else {
        emptyMessage.style.display = 'none';
        cartTable.style.display = 'table';

        cart.forEach(function(item, index) {

            let isStandaloneRice = item.standaloneRice === true;
            let isMeal = item.category === 'meals' && !isStandaloneRice;

            if (isMeal && item.riceQuantity === undefined) {
                item.riceQuantity = item.quantity;
            }

            if (isMeal && item.orderType === undefined) {
                item.orderType = 'dine-in';
            }

            let riceAdjustment = 0;

            if (isMeal) {
                riceAdjustment = (item.riceQuantity - item.quantity) * ricePrice;
            }

            let takeOutAdjustment = 0;

            if (isMeal && item.orderType === 'take-out') {
                takeOutAdjustment = takeOutFee * item.quantity;
            }

            let subtotal = (item.price * item.quantity)
                + riceAdjustment
                + takeOutAdjustment;

            total += subtotal;

            let riceInput = '';

            if (isMeal) {
                riceInput = `
                    <input type="number"
                        class="rice-qty"
                        data-index="${index}"
                        min="0"
                        step="1"
                        value="${item.riceQuantity}"
                        required>
                `;
            } else {
                riceInput = 'N/A';
            }

            let orderSelect = '';

            if (isMeal) {

                let dineInSelected = '';
                let takeOutSelected = '';

                if (item.orderType === 'dine-in') {
                    dineInSelected = 'selected';
                }

                if (item.orderType === 'take-out') {
                    takeOutSelected = 'selected';
                }

                orderSelect = `
                    <select class="order-type" data-index="${index}">
                        <option value="dine-in" ${dineInSelected}>
                            Dine In
                        </option>
                        <option value="take-out" ${takeOutSelected}>
                            Take Out (+₱10)
                        </option>
                    </select>
                `;
            } else {
                orderSelect = 'N/A';
            }

            let row = `
                <tr>
                    <td>
                        <img src="${item.image}"
                            alt="${item.name}"
                            class="img">
                    </td>

                    <td>${item.name}</td>

                    <td class="price">
                        ₱${item.price.toFixed(2)}
                    </td>

                    <td>
                        <div class="quantity">
                            <button type="button"
                                class="minus-btn"
                                data-index="${index}">−</button>

                            <span class="quantity-number">
                                ${item.quantity}
                            </span>

                            <button type="button"
                                class="plus-btn"
                                data-index="${index}">+</button>
                        </div>
                    </td>

                    <td>${riceInput}</td>
                    <td>${orderSelect}</td>

                    <td class="price">
                        ₱${subtotal.toFixed(2)}
                    </td>

                    <td>
                        <button type="button"
                            class="remove-btn"
                            data-index="${index}">×</button>
                    </td>
                </tr>
            `;

            cartItems.innerHTML += row;
        });

        cartTotal.textContent = 'TOTAL: ₱' + total.toFixed(2);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
}


// FUNCTION 2: Food quantity and remove buttons
cartItems.addEventListener('click', function(event) {

    let button = event.target;

    if (button.tagName !== 'BUTTON') {
        return;
    }

    let index = Number(button.dataset.index);
    let item = cart[index];

    if (!item) {
        return;
    }

    let isStandaloneRice = item.standaloneRice === true;
    let isMeal = item.category === 'meals' && !isStandaloneRice;

    if (button.classList.contains('plus-btn')) {

        item.quantity++;

        if (isMeal) {
            item.riceQuantity = (item.riceQuantity || 0) + 1;
        }

    } else if (button.classList.contains('minus-btn')) {

        if (item.quantity > 1) {

            item.quantity--;

            if (isMeal) {
                item.riceQuantity = Math.max(
                    0,
                    (item.riceQuantity || 0) - 1
                );
            }

        } else {
            cart.splice(index, 1);
        }

    } else if (button.classList.contains('remove-btn')) {

        cart.splice(index, 1);

    } else {
        return;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateQuantity();
});


// FUNCTION 3: Rice quantity
cartItems.addEventListener('change', function(event) {

    if (!event.target.classList.contains('rice-qty')) {
        return;
    }

    let index = Number(event.target.dataset.index);
    let value = event.target.value;
    let quantity = Number(value);

    if (value === '' || !Number.isInteger(quantity) || quantity < 0) {
        displayCart();
        return;
    } else {
        cart[index].riceQuantity = quantity;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateQuantity();
});


// FUNCTION 4: Order type
cartItems.addEventListener('change', function(event) {

    if (!event.target.classList.contains('order-type')) {
        return;
    }

    let index = Number(event.target.dataset.index);

    cart[index].orderType = event.target.value;

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateQuantity();
});


// Display cart when page opens
displayCart();
updateQuantity();
