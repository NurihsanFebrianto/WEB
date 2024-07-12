const CART_ITEM_STORAGE = 'cart_item_storage'
const CHECKOUT_ITEM_STORAGE = 'checkout_item_storage'
const SESSION_EVENT_STORE = 'session_event_store'




/**
 * 
 * @param {string|null} id 
 * @param {string} shop_id
 * @param {"check-shop"|"check-product"|"uncheck-shop"|"uncheck-product"} operational 
 */
async function setSessionCheckoutCheckInput(id, shop_id, operational) {
    const event = new CustomEvent(SESSION_EVENT_STORE)
    let checkout = JSON.parse(sessionStorage.getItem(CHECKOUT_ITEM_STORAGE)) || {};
    let chart = await getDataCheckout()

    if (shop_id in checkout) checkout = {
        ...checkout,
        [shop_id]: {}
    }


    switch(operational) {
        case "check-shop":
            checkout[shop_id] = chart[shop_id].products.reduce((prev, curr) => ({
                ...prev,
                [curr.id]: curr.pieces
            }),{})

        case "check-product":
            checkout[shop_id][id] = chart[id].pieces
        
        case "uncheck-shop":
            checkout = Object.keys(checkout).filter(dt => dt !== shop_id).reduce((prev, curr) => {
                prev[curr] = checkout[curr]
                return prev
            },{})

        case "uncheck-product":
            checkout[shop_id] = Object.keys(checkout[shop_id]).filter(dt => dt !== id).reduce((prev, curr) => {
                prev[curr] = checkout[curr]
                return prev
            },{})
    }


    sessionStorage.setItem(CHECKOUT_ITEM_STORAGE, JSON.stringify(checkout))
    document.dispatchEvent(event)
}



/**
 * 
 * @param {string|null} id 
 * @param {string|null} shop_id 
 * @param {"delete-shop"|"delete-product"} operational 
 */
async function setSessionCheckoutDeleteInput(id, shop_id, operational) {
    const event = new CustomEvent(SESSION_EVENT_STORE)
    let checkout = JSON.parse(sessionStorage.getItem(CHECKOUT_ITEM_STORAGE)) || {};
    let carts = JSON.parse(sessionStorage.getItem(CART_ITEM_STORAGE)) || {};
    let chartBuild = await getDataCheckout()

    switch (operational) {
        case "delete-shop":
            checkout = Object.keys(checkout).filter(dt => dt !== shop_id).reduce((prev, curr) => {
                prev[curr] = checkout[curr]
                return prev
            },{})

        case "delete-product":
            checkout[shop_id] = Object.keys(checkout[shop_id]).filter(dt => dt !== id).reduce((prev, curr) => {
                prev[curr] = checkout[curr]
                return prev
            },{})
    }
    let chartByShop = chartBuild[shop_id].products.reduce((prev, curr) =>  prev.push(curr.id),[])
    carts = Object.keys(carts).filter(dt => chartByShop.includes(dt)).reduce((prev, curr) => {
        prev[curr] = checkout[curr]
        return prev  
    }, {})

    sessionStorage.setItem(CHECKOUT_ITEM_STORAGE, JSON.stringify(checkout))
    sessionStorage.setItem(CART_ITEM_STORAGE, JSON.stringify(carts))
    document.dispatchEvent(event)
}




async function setSessionCheckoutPiecesInput(id, shop_id, count) {
    const event = new CustomEvent(SESSION_EVENT_STORE)
    let checkout = JSON.parse(sessionStorage.getItem(CHECKOUT_ITEM_STORAGE)) || {};

    if (shop_id in checkout) checkout = {
        ...checkout,
        [shop_id]: {}
    }

    if (count === 0) return
    checkout[shop_id][id] = count
    
    sessionStorage.setItem(CHECKOUT_ITEM_STORAGE)
    document.dispatchEvent(event)
}




/**
 * getDataCheckout.
 * Get data checkout from session storage and do remake data
 * @returns {void}
 */
async function getDataCheckout() {
    const shops = await fetch('shop.json').then(res => res.json())
    const products = await fetch('product.json').then(res => res.json())
    const carts = JSON.parse(sessionStorage.getItem(CART_ITEM_STORAGE)) || {};
    const checkoutProduct = products.filter(data => Object.keys(carts).includes(data.id))

    console.log(checkoutProduct)

    const wrapingShop = shops.reduce((prev, curr) => ({
        ...prev,
        [curr.id]: {
            id: curr.id,
            name: curr.name,
            products: checkoutProduct.filter(data => data.shop_id === curr.id).map(dt => ({ ...dt, pieces: carts[dt.id] }))
        }
    }), {})

    return wrapingShop
}




/**
 * 
 * @param {{ title: string, price: number, discount_percentage: number, description: string, id: number, total: number, images: string[] }} data 
 * @returns {HTMLDivElement}
 */
function generateProductItem(data) {
    const itemElement = document.createElement('div');
    itemElement.innerHTML = `
        <input type="checkbox" class="mr-2 item-checkbox">
        <img src="${data.images[0]}" alt="${data.name}">
        <div class="item-details">
            <h3 class="font-semibold">${item.name}</h3>
            <div class="flex justify-between items-center mt-2">
                <div>
                    <span class="font-bold">$${data.price}</span>
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

    return document.createElement('h1')
}



async function generateProductByShop() {
    const cartItems = document.body.querySelector('#cartItems')
    const data = await getDataCheckout()
    
    for (const key in data) {
        const parrentElement = document.createElement('div')
        parrentElement.innerHTML = `
            <input type="checkbox" class="item-checkbox" />
            <span>${data[key].name}</span>
        `
        console.log(data[key])
        // data[key].products.forEach(element => {
        //     console.log('masuk sin  ')
        //     parrentElement.appendChild(generateProductItem({
        //         id: element.id,
        //         title: element.title,
        //         description: element.description,
        //         discount_percentage: element.discount_percentage,
        //         price: element.price
        //     }))
        // });

        cartItems.appendChild(parrentElement)
    }
}



async function initContentLoaded() {
    await generateProductByShop()
}




window.addEventListener('DOMContentLoaded', initContentLoaded)
window.addEventListener(SESSION_EVENT_STORE, () => {})