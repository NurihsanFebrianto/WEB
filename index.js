const CART_ITEM_STORAGE = 'cart_item_storage'



/**
 * generateProductItem.
 * This function will generate item component
 * @param {{ title: string, price: number, discount_percentage: number, description: string, id: number }} data 
 * @returns {string}
 */
function generateProductItem(data) {
  const discountPrice = (data.price - (data.price * data.discount_percentage / 100)).toFixed(2)

  return `
    <div class="group h-[22rem] select-none relative overflow-hidden">
      <div class="w-100 relative h-[15rem] overflow-hidden rounded-2xl">
        <img class="object-cover w-full h-full" src="./images/image copy 3.png">
        <div onclick="addProductItemToCart('${data.id}')" class="absolute top-3 right-3 p-2 rounded-full opacity-100 flex justify-end  hover:bg-[#00000047]">
          <svg title="add cart" class="cursor-pointer" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></svg>
        </div>
      </div>
      <div class="flex flex-col gap-0 mt-2 rounded-lg">
        <h1 class="text-base">${data.title}</h1>
        <h2 class="text-base font-semibold">$ ${discountPrice === data.price ? data.price : discountPrice}</h2>
        ${ discountPrice !== data.price
              ? `<p><span class='text-[0.8rem] line-through text-gray-400'>$${data.price}</span><span class='text-[0.8rem] ml-1 font-semibold text-red-600'>${data.discount_percentage}%</span></p>`
              : ''
        }
      </div>
    </div>
  `
}



/**
 * addProductItemToCart
 * This item use for add item to cart and will update ui in icon cart
 * and storage data to session storage
 * @param {string} id
 * @package {'increment' | 'dec}
 * @returns {void} 
 */
function addProductItemToCart(id) {
  const elementCart = document.querySelector('#cart-shooping-count')
  let carts = JSON.parse(sessionStorage.getItem(CART_ITEM_STORAGE)) || {};

  if (id in carts === false) carts = { ...carts, [id]: 1 }
  else carts[id] = parseInt(carts[id]) + 1

  sessionStorage.setItem(CART_ITEM_STORAGE, JSON.stringify(carts))  
  elementCart.textContent = Object.values(carts).reduce((prev, curr) => prev + curr, 0)
  elementCart.classList.remove('opacity-0')
}




/**
 * generateContentProducts
 * @returns {void}
 */
async function generateContentProducts() {
  const elementContainer = document.querySelector('#content-products')
  const shops = await fetch('shop.json').then(res => res.json())
  const products = await fetch('product.json').then(res => res.json())

  const shopsRebuild = shops.reduce((prev, current) => {
    return {
      ...prev,
      [current.id]: {
        id: current.id,
        name: current.name,
        products: []
      }
    }
  }, {})
  
  products.map(data => {
    if (shopsRebuild[data.shop_id].products.length === 8) return
    shopsRebuild[data.shop_id].products.push(data)
  })

  for (const key in shopsRebuild) {
    const container = document.createElement('div')
    const title = document.createElement('h1')
    const containerItem = document.createElement('div')

    title.classList.add('text-lg', 'mb-4', 'font-medium')
    title.textContent = shopsRebuild[key].name
    container.appendChild(title)
    containerItem.classList.add('content-product', 'grid', 'grid-cols-4', 'gap-5')
    shopsRebuild[key].products.forEach(product => {
      containerItem.innerHTML += generateProductItem(product)
    })
    container.appendChild(containerItem)
    container.classList.add('mb-5')
    elementContainer.appendChild(container)
  }
  
}




function initContentLoaded() {
  generateContentProducts()
}




document.addEventListener('DOMContentLoaded', initContentLoaded)