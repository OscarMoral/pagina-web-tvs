
document.addEventListener("DOMContentLoaded", () => {
    const productsGrid = document.getElementById("products-grid");
    const viewProductsBtn = document.getElementById("view-products-btn");
    const cartButton = document.getElementById("cart-button");
    const API_URL = "https://products-foniuhqsba-uc.a.run.app/TVs";

    let allProducts = [];
    let cart = [];

    // Cargar productos desde la API
    async function loadProducts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error en la respuesta de la API");
            allProducts = await response.json();
            displayProducts(allProducts);
        } catch (error) {
            console.error("Error al cargar productos:", error);
            productsGrid.innerHTML = "<p>Error al cargar los productos. Intenta nuevamente más tarde.</p>";
        }
    }

    // Mostrar productos en la cuadrícula
    function displayProducts(products) {
        productsGrid.innerHTML = "";
        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card", "p-4", "bg-white", "rounded-lg", "shadow-lg", "hover:shadow-xl");
            productCard.setAttribute("data-id", product.id);

            const productName = product.title || "Modelo desconocido";
            const productImage = product.image || "https://via.placeholder.com/150";
            const productPrice = product.price || "Precio no disponible";
            const productDescription = product.short_description || "Descripción no disponible";

            productCard.innerHTML = `
                <img src="${productImage}" alt="${productName}" class="w-full h-48 object-cover rounded-md" />
                <h3 class="mt-4 text-xl font-bold">${productName}</h3>
                <p class="text-gray-600 mt-2">${productDescription}</p>
                <p class="mt-2 font-bold">${productPrice}</p>
                <button class="view-details bg-blue-500 text-white px-4 py-2 mt-4 rounded-lg">Ver detalles</button>
                <button class="add-to-cart bg-green-500 text-white px-4 py-2 mt-4 rounded-lg">Agregar al carrito</button>
            `;

            // Asignar evento para mostrar detalles del producto en un popover
            const viewDetailsButton = productCard.querySelector(".view-details");
            viewDetailsButton.addEventListener("click", () => {
                showProductDetails(product);
            });

            // Asignar evento para agregar al carrito
            const addToCartButton = productCard.querySelector(".add-to-cart");
            addToCartButton.addEventListener("click", () => {
                addToCart(product);
            });

            productsGrid.appendChild(productCard);
        });
    }

    // Mostrar detalles del producto en un popover
    function showProductDetails(product) {
        const existingPopover = document.querySelector(".product-popover");
        if (existingPopover) existingPopover.remove(); // Eliminar cualquier popover existente

        const productCard = document.querySelector(`[data-id="${product.id}"]`);
        const popover = document.createElement("div");
        popover.classList.add("product-popover", "absolute", "bg-white", "p-4", "rounded-lg", "shadow-lg");
        popover.style.top = `${productCard.offsetTop + productCard.offsetHeight}px`;
        popover.style.left = `${productCard.offsetLeft}px`;

        popover.innerHTML = `
            <div class="w-64">
                <img src="${product.image}" alt="${product.title}" class="w-full h-40 object-cover rounded-md" />
                <h2 class="text-lg font-bold mt-2">${product.title}</h2>
                <p class="text-gray-600 mt-2">${product.description}</p>
                <p class="font-bold mt-2">${product.price}</p>
                <ul class="mt-4 text-sm text-gray-700">
                    ${product.features
                        .map(
                            feature => `
                                <li><strong>${feature.type}:</strong> ${feature.value}</li>
                            `
                        )
                        .join("")}
                </ul>
                <button class="close-popover bg-red-500 text-white px-4 py-2 mt-4 rounded-lg">Cerrar</button>
            </div>
        `;

        // Cerrar el popover al hacer clic en el botón
        popover.querySelector(".close-popover").addEventListener("click", () => {
            popover.remove();
        });

        document.body.appendChild(popover);
    }

    // Agregar producto al carrito
    function addToCart(product) {
        cart.push(product);
        updateCartDisplay();
    }

    // Actualizar visualización del carrito
    function updateCartDisplay() {
        const cartModal = document.createElement("div");
        cartModal.classList.add("fixed", "top-0", "right-0", "w-96", "h-full", "bg-white", "shadow-lg", "flex", "flex-col");

        const totalPrice = cart.reduce((total, product) => {
            return total + parseFloat(product.price.replace("€", "").trim());
        }, 0);

        cartModal.innerHTML = `
            <div class="p-4 border-b">
                <h2 class="text-xl font-bold">Carrito</h2>
            </div>
            <div class="flex-1 overflow-y-auto">
                <ul class="cart-items">
                    ${cart.map(product => `
                        <li class="flex items-center justify-between p-4 border-b">
                            <img src="${product.image}" alt="${product.title}" class="w-16 h-16 rounded-md" />
                            <div class="flex-1 ml-4">
                                <h3 class="text-md font-bold">${product.title}</h3>
                                <p class="text-gray-600">${product.price}</p>
                            </div>
                            <button class="remove-item text-red-500 font-bold" data-id="${product.id}">X</button>
                        </li>
                    `).join("")}
                </ul>
            </div>
            <div class="p-4 border-t">
                <p class="text-lg font-bold">Total: ${totalPrice.toFixed(2)} €</p>
                <button class="w-full bg-blue-500 text-white px-4 py-2 mt-4 rounded-lg">Comprar</button>
                <button class="w-full bg-red-500 text-white px-4 py-2 mt-2 rounded-lg" id="close-cart">Cerrar</button>
            </div>
        `;

        document.body.appendChild(cartModal);

        const closeCartButton = cartModal.querySelector("#close-cart");
        closeCartButton.addEventListener("click", () => {
            cartModal.remove();
        });

        const removeButtons = cartModal.querySelectorAll(".remove-item");
        removeButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const idToRemove = parseInt(e.target.getAttribute("data-id"));
                cart = cart.filter(item => item.id !== idToRemove);
                cartModal.remove();
                updateCartDisplay();
            });
        });
    }

    // Eventos principales
    viewProductsBtn.addEventListener("click", () => {
        productsGrid.classList.remove("hidden");
        viewProductsBtn.style.display = "none";
        loadProducts();
    });

    cartButton.addEventListener("click", updateCartDisplay);
});
