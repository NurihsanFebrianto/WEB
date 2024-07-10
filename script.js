let cartData = [];

async function loadCartData() {
    try {
        const response = await fetch('cartData.json');
        const data = await response.json();
        cartData = data.cart;
        renderCart();
    } catch (error) {
        console.error('Error loading cart data:', error);
    }
}

function renderCart() {
    const cartContainer = document.getElementById('cartItems');
    cartContainer.innerHTML = '';

    cartData.forEach((store, storeIndex) => {
        const storeElement = document.createElement('div');
        storeElement.className = 'store-container';
        storeElement.innerHTML = `
            <div class="store-header">
                <div class="flex items-center">
                    <input type="checkbox" class="store-checkbox" data-store-index="${storeIndex}">
                    <span class="font-bold">${store.store}</span>
                </div>
                <button class="delete-store" data-store-index="${storeIndex}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;

        store.items.forEach((item, itemIndex) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-container';
            itemElement.innerHTML = `
                <input type="checkbox" class="mr-2 item-checkbox" data-store-index="${storeIndex}" data-item-index="${itemIndex}">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3 class="font-semibold">${item.name}</h3>
                    <p class="text-sm text-gray-500">${item.size || item.variant}</p>
                    <div class="flex justify-between items-center mt-2">
                        <div>
                            <span class="font-bold">Rp${item.price.toLocaleString()}</span>
                            ${item.discount ? `
                                <span class="text-sm line-through text-gray-500 ml-2">Rp${item.originalPrice.toLocaleString()}</span>
                                <span class="text-sm text-red-500 ml-2">${item.discount}%</span>
                            ` : ''}
                        </div>
                        <div class="item-actions">
                            <button class="decrease-quantity" data-store="${storeIndex}" data-item="${itemIndex}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="increase-quantity" data-store="${storeIndex}" data-item="${itemIndex}">+</button>
                            <button class="delete-item" data-store="${storeIndex}" data-item="${itemIndex}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                </div>
            `;
            storeElement.appendChild(itemElement);
        });

        cartContainer.appendChild(storeElement);
    });

    updateTotal();
    addQuantityListeners();
    addCheckboxListeners();
    addDeleteListeners();
    addDeleteStoreListeners();
}

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.item-checkbox:checked').forEach(checkbox => {
        const storeIndex = parseInt(checkbox.getAttribute('data-store-index'));
        const itemIndex = parseInt(checkbox.getAttribute('data-item-index'));
        const item = cartData[storeIndex].items[itemIndex];
        total += item.price * item.quantity;
    });
    document.getElementById('totalPrice').textContent = `Rp${total.toLocaleString()}`;
}

function addQuantityListeners() {
    document.querySelectorAll('.decrease-quantity, .increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const storeIndex = parseInt(this.getAttribute('data-store'));
            const itemIndex = parseInt(this.getAttribute('data-item'));
            const isIncrease = this.classList.contains('increase-quantity');
            
            updateQuantity(storeIndex, itemIndex, isIncrease);
        });
    });
}

function updateQuantity(storeIndex, itemIndex, isIncrease) {
    const item = cartData[storeIndex].items[itemIndex];
    if (isIncrease) {
        item.quantity++;
    } else if (item.quantity > 1) {
        item.quantity--;
    }
    
    renderCart();
}

function addCheckboxListeners() {
    document.querySelectorAll('.store-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const storeIndex = parseInt(this.getAttribute('data-store-index'));
            const storeCheckbox = this.checked;
            document.querySelectorAll(`.item-checkbox[data-store-index="${storeIndex}"]`).forEach(itemCheckbox => {
                itemCheckbox.checked = storeCheckbox;
            });
            updateTotal();
        });
    });

    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const storeIndex = parseInt(this.getAttribute('data-store-index'));
            const allItemsChecked = document.querySelectorAll(`.item-checkbox[data-store-index="${storeIndex}"]:not(:checked)`).length === 0;
            document.querySelector(`.store-checkbox[data-store-index="${storeIndex}"]`).checked = allItemsChecked;
            updateTotal();
        });
    });
}

function addDeleteListeners() {
    document.querySelectorAll('.delete-item').forEach(button => {
        button.addEventListener('click', function() {
            const storeIndex = parseInt(this.getAttribute('data-store'));
            const itemIndex = parseInt(this.getAttribute('data-item'));
            deleteItem(storeIndex, itemIndex);
        });
    });
}

function deleteItem(storeIndex, itemIndex) {
    cartData[storeIndex].items.splice(itemIndex, 1);
    renderCart();
}

function addDeleteStoreListeners() {
    document.querySelectorAll('.delete-store').forEach(button => {
        button.addEventListener('click', function() {
            const storeIndex = parseInt(this.getAttribute('data-store-index'));
            deleteStore(storeIndex);
        });
    });
}

function deleteStore(storeIndex) {
    cartData.splice(storeIndex, 1);
    renderCart();
}

document.getElementById('selectAll').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.store-checkbox, .item-checkbox');
    checkboxes.forEach(cb => cb.checked = this.checked);
    updateTotal();
});

// Load cart data when the page loads
loadCartData();
