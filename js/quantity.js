function updateQuantity() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let quantityLogo = document.querySelector('.quantity-logo');

    if (!quantityLogo) {
        return;
    }

    let totalQuantity = cart.reduce(function(total, item) {
        return total + item.quantity;
    }, 0);

    quantityLogo.textContent = totalQuantity;

    if (totalQuantity > 0) {
        quantityLogo.style.display = 'flex';
    } else {
        quantityLogo.style.display = 'none';
    }
}

updateQuantity();

window.addEventListener('storage', updateQuantity);