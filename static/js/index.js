
function seturl() {
    localStorage.setItem("fasturl", "https://ec2-3-110-174-115.ap-south-1.compute.amazonaws.com");
}

function setweburl() {
    localStorage.setItem("weburl", "https://free.nibhasserver.free.nf");
}

function getweburl() {
    url = localStorage.getItem("weburl");
    return url;
}

function geturl() {
    url = localStorage.getItem("fasturl");
    return url;
}

function setselectedvalue(value) {
    localStorage.setItem("selectedValue", `${value}`);
}

function getselectedvalue() {
    selectedValue = localStorage.getItem("selectedValue");
    return selectedValue;
}



$.ajax({
    url: geturl() + "/csrf-token",  // Call FastAPI endpoint to set CSRF cookie
    type: "GET",
    success: (data) => {
        console.log("CSRF Token Response:", data.message);
        console.log("CSRF token is stored in an HttpOnly cookie by the server.");
    },
    error: (xhr, status, error) => {
        console.error("Error fetching CSRF token:", xhr.responseText);
    }
});



seturl();
setweburl();




$.ajax({
    url: geturl() + "/list_category",
    method: "GET",
    success: function (data) {
        const selectElement = $("#styledSelect");
        selectElement.empty(); // Clear existing options
        // Add new options dynamically
        selectElement.append( `<option value="#">Select Category</option>`)
        if (getselectedvalue() === null) {
            setselectedvalue(data[0].categories);
           
        }
        data.forEach(option => {
            selectElement.append(
                `<option value="${option.categories}">${option.categories}</option>`
            );
        });
        generate_product_cards(getselectedvalue());
    },
    error: function () {
        alert("Failed to load options. Please try again.");
    }
});

$("#styledSelect").val("YourCategoryValue").change();
$(document).ready(function () {

    saveCart();
    loadCart();
    update_cart_logo();

    $("#cart").click(function () {
        window.location.href = getweburl()+`/cart`;
    });


    $("#remove").click(function () {
        removeFromCart(2);
    });

    $("#emptycart").click(function () {
        emptyCart();
    });

    $("#iterate").click(function () {
        iterateCartItems();
    });


    //submit selection boc category to backend------------------------------------
    $("#styledSelect").on("change", function () {
        selectedValue = $(this).val(); // Get the selected value
        // Prepare data to send
        if (selectedValue !== "Select Category")
        {
        setselectedvalue(selectedValue);
        generate_product_cards(selectedValue);
        }

    });

    $("#searchBtn").click(function(){
        var query = $("#searchQuery").val();
        const data = { "category": `${query}` };
      

        $.ajax({
            url: geturl()+"/seach_product/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(response) {
                $('#grid-container').html(response);

                $('#grid-container').on('click', '#buynow', function (e) {
                    e.preventDefault();
                    var closestCard = $(this).closest('.card');
                    var productName = closestCard.find('[id^="product_name"]').text();
                    var productImageSrc = closestCard.find('[id^="product_image"]').attr('src');
                    var productDescription = closestCard.find('[id^="product_description"]').text();
                    var productPrice = closestCard.find('[id^="product_price"]').text();
                    var productPrice = parseInt(productPrice.replace(/[₹,]/g, ''));
                    create_buynow_storage(productName, productImageSrc, productPrice, productDescription)
                    window.location.href = `${getweburl()}/buynow`;
                });
                

                $('#grid-container').on('click', '#addcart', function (e) {
                    e.preventDefault();
                    var closestCard = $(this).closest('.card');
                    var productName = closestCard.find('[id^="product_name"]').text();
                    var productImageSrc = closestCard.find('[id^="product_image"]').attr('src');
                    var productDescription = closestCard.find('[id^="product_description"]').text();
                    var productPrice = closestCard.find('[id^="product_price"]').text();
                    var productPrice = parseInt(productPrice.replace(/[₹,]/g, ''));
                    addToCart(productName, productImageSrc, productDescription, productPrice);
                    update_cart_logo();
                    window.location.href = `${getweburl()}/cart`;
                });
            },
            error: function() {
                console.error("Error fetching text:", error);
                $('#textContent').text("Error fetching text. Please try again.");

            }
        });
    });


});



function generate_product_cards(selectedV) {
    const data = { "category": `${selectedV}` };

    // Send data to the backend using AJAX
    $.ajax({
        url: geturl() + "/list_products/",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            $('#grid-container').html(response);

            $('#grid-container').on('click', '#buynow', function (e) {
                e.preventDefault();
                var closestCard = $(this).closest('.card');
                var productName = closestCard.find('[id^="product_name"]').text();
                var productImageSrc = closestCard.find('[id^="product_image"]').attr('src');
                var productDescription = closestCard.find('[id^="product_description"]').text();
                var productPrice = closestCard.find('[id^="product_price"]').text();
                var productPrice = parseInt(productPrice.replace(/[₹,]/g, ''));
                create_buynow_storage(productName, productImageSrc, productPrice, productDescription)
                window.location.href = `${getweburl()}/buynow`;

            });


            $('#grid-container').on('click', '#addcart', function (e) {
                e.preventDefault();
                var closestCard = $(this).closest('.card');
                var productName = closestCard.find('[id^="product_name"]').text();
                var productImageSrc = closestCard.find('[id^="product_image"]').attr('src');
                var productDescription = closestCard.find('[id^="product_description"]').text();
                var productPrice = closestCard.find('[id^="product_price"]').text();
                var productPrice = parseInt(productPrice.replace(/[₹,]/g, ''));
                addToCart(productName, productImageSrc, productDescription, productPrice);
                update_cart_logo();
                window.location.href = `${getweburl()}/cart`;
            });
        },


        error: function (xhr, status, error) {
            console.error("Error fetching text:", error);
            $('#textContent').text("Error fetching text. Please try again.");

        },
    });
}



function create_buynow_storage(productname, productsrc, productprice, productdescription) {
    const key = 'buynow_product';
    const sampleValue = {
        product_name: productname,
        product_description: productdescription,
        product_price: productprice,
        product_src: productsrc,
        product_count: 1,
        product_total: productprice
    };

    // Check if the key exists
    if (localStorage.getItem(key)) {
        // Remove the existing key
        localStorage.removeItem(key);
        console.log(`${key} key exists. Removing the old entry.`);
    }

    // Create a new key with the sample value
    localStorage.setItem(key, JSON.stringify(sampleValue));
    console.log(`New ${key} created with value:`, sampleValue);


}





let cart = [];

function saveCart() {
    localStorage.setItem('mycart', JSON.stringify(cart));
}

function loadCart() {
    const storedCart = localStorage.getItem('mycart');
    cart = storedCart ? JSON.parse(storedCart) : [];
}



function addToCart(productName, productImageSrc, productDescription, productPrice) {
    const newItem = {
        product_name: productName,
        product_description: productDescription,
        product_price: productPrice,
        product_src: productImageSrc,
        product_count: 1,
        product_total: productPrice
    };

    // Check if the item already exists in the cart
    const existingItem = cart.find(item => item.product_name === productName);

    if (existingItem) {
        // If the item already exists, ignore pushing
        console.log("Item already in the cart:", productName);
    } else {
        // Add the new item to the cart
        cart.push(newItem);

        // Save the updated cart to localStorage
        saveCart();

        // Print the cart in the console for debugging
        console.log("Updated Cart:", cart);
    }
}



function removeFromCart(itemId) {
    // Filter out the item with the given ID
    cart = cart.filter(item => item.id !== itemId);

    // Save the updated cart to localStorage
    saveCart();

    // Print the cart in the console for debugging
    console.log("Updated Cart After Removal:", cart);
}


function emptyCart() {
    // Clear the global cart list
    cart = [];

    // Clear the cart from localStorage
    localStorage.removeItem('mycart');

    // Debugging: Log the empty cart
    console.log("Cart is now empty:", cart);
}


function iterateCartItems() {
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        console.log(`Item ${i + 1}:`, item);
        // You can add more actions here, such as displaying the items in a UI.

    }
}



function update_cart_logo() {
    loadCart();
    len = cart.length;
    console.log(len);
    $("#cart-count").text(`${len}`);
}


