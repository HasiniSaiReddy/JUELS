function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({ name, price });
    localStorage.setItem("cart", JSON.stringify(cart));

    alert(name + " added to cart!");
}

function displayCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartItemsDiv = document.getElementById("cart-items");
    let totalDisplay = document.getElementById("total");

    cartItemsDiv.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        cartItemsDiv.innerHTML += `
        <div class="cart-item">
            <span>${item.name} - $${item.price}</span>
            <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        </div>
        `;
    });

    totalDisplay.innerHTML = "Total: $" + total;
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1); 
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart(); 
}

if (window.location.pathname.includes("cart.html")) {
    displayCart();
}
