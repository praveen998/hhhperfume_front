function geturl() {
    url = localStorage.getItem("fasturl");
    return url;
}


function sanitizeInput(input) {
    return $("<div>").text(input).html();
}

let csrfToken = "";
$.ajax({
    url: geturl() + "/csrf-token",
    type: "GET",
    success: (data) => {
        console.log("CSRF Token Response:", data);
        csrfToken = data?.csrf_token || "Not Found";

    },
    error: (xhr, status, error) => {
        console.error("Error fetching CSRF token:", xhr.responseText);
    }
});


$(document).ready(function () {
    append_cart_items();
    $('.placeorder').click(async function (e) {
        e.preventDefault();
        let orderData = {
            first_name: sanitizeInput($("#firstName").val()),
            last_name: sanitizeInput($("#lastName").val()),
            email: sanitizeInput($('#email').val()),
            phone: sanitizeInput($('#phone').val().toString()),
            country: sanitizeInput($('#country').val()),
            state: sanitizeInput($('#state').val()),
            city: sanitizeInput($('#city').val()),
            address: sanitizeInput($('#address').val()),
            zipcode: sanitizeInput($('#zipcode').val()),
            additionalInfo: sanitizeInput($('#additionalInfo').val())
        }

        const storedValues = localStorage.getItem("mycart");
        let mycart = JSON.parse(storedValues);

        let requestData = {
            order: orderData,
            cart: mycart
        };

        if (firstName && lastName && email && country && phone && state && address && zipcode) {
            $(".required").text('');
            let response = await $.ajax({
                url: geturl() + "/create-order-cart/",
                type: "POST",
                headers: {
                    "X-CSRF-Token": csrfToken
                },

                contentType: "application/json",
                data: JSON.stringify(requestData),
                success: async function (response) {
                    customer = response;
                    await $.ajax({
                        url: geturl() + "/send_purchase_data/",
                        type: "POST",
                        // headers: {
                        //     "X-CSRF-Token": csrfToken
                        // },
                        contentType: "application/json",
                        data: JSON.stringify(customer),
                        success: function (response) {
                        },
                        error: {

                        }
                    });

                    $(".orderstatus").html(`
                         <span style="color: green;">${response.message}</span>
                         <div class="card-footer mt-4">
                            <ul class="list-group list-group-flush">
                             <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                   Order id
                                    <div>${response.id}</div>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                   Name
                                    <div>${response.first_name} ${response.last_name}</div>
                                </li>
                                  <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                   Email
                                    <div>${response.email}</div>
                                </li>
                                  <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                   Phone
                                    <div>${response.phone}</div>
                                </li>
                                   <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                   State
                                    <div>${response.state}</div>
                                </li>
                                 <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                   city
                                    <div>${response.city}</div>
                                </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                   Address
                                    <div>${response.address}</div>
                                </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                   Country
                                    <div>${response.country}</div>
                                </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                   Zipcode
                                    <div>${response.zipcode}</div>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0 fw-bold text-uppercase">
                                    Total to pay
                                    <div id="total">${response.total_amount}</div>
                                </li>   
                            </ul>
                              <div class="paymentdiv">
                               <br>
                                <button class="pay-button btn btn-primary w-100">Check Out</button>
                            </div>
                        </div>
                        `);

                    $(".paymentdiv").css("visibility", "visible");
                    localStorage.setItem('order', JSON.stringify(response));

                    $(".pay-button").click(function (e) {
                        e.preventDefault();
                        alert('paymentbutton clicked');
                        var options = {
                            key: "rzp_test_2SSqGlsTH8Gc2X", // Replace with your Razorpay Key ID
                            amount: response.amount, // Amount in paise (e.g., 1000 = ₹10)
                            currency: response.currency,
                            order_id: response.id,
                            name: "Your Company Name",
                            description: "Test Transaction",
                            //image: "https://your-logo-url.com/logo.png", // Your company logo

                            handler: async function (response) {

                                // This function will be called after a successful payment
                                //alert("Payment successful! Payment ID: " + res.razorpay_payment_id);

                                try {
                                    let verifyResponse = await fetch(geturl() + "/verify-payment/", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            //customer:JSON.stringify(customer),
                                            razorpay_order_id: response.razorpay_order_id,
                                            razorpay_payment_id: response.razorpay_payment_id,
                                            razorpay_signature: response.razorpay_signature
                                        })
                                    });
                                    let result = await verifyResponse.json();
                                    if (verifyResponse.ok) {

                                        alert("✅ Payment Verified: " + result.message);

                                        $(".mainwindow").html(`
                                        <span style="color: green;">Your Order Created...! Thanks for Purchasing</span>
                                        <div class="card-footer mt-4">
                                           <ul class="list-group list-group-flush">
                                              <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                                  Order id
                                                   <div>${customer.id}</div>
                                               </li>
                                               <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                                  Name
                                                   <div>${customer.first_name} ${customer.last_name}</div>
                                               </li>
                                                 <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                                  Email
                                                   <div>${customer.email}</div>
                                               </li>
                                                 <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                                  Phone
                                                   <div>${customer.phone}</div>
                                               </li>
                                                  <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                                  State
                                                   <div>${customer.state}</div>
                                               </li>
                                                <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                                  city
                                                    <div>${customer.city}</div>
                                                </li>
                                               
                                                   <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                                  Address
                                                   <div>${customer.address}</div>
                                               </li>
                                                   <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                                  Country
                                                   <div>${customer.country}</div>
                                               </li>
                                                   <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0 text-muted">
                                                  Zipcode
                                                   <div>${customer.zipcode}</div>
                                               </li>
                                               <li class="list-group-item d-flex justify-content-between align-items-center px-0 fw-bold text-uppercase">
                                                   Total to pay
                                                   <div id="total">${customer.total_amount}</div>
                                               </li>   
                                           </ul>
                                       </div>
                                       `);
                                    } else {
                                        alert("❌ Payment Verification Failed: " + result.detail);
                                    }

                                } catch (error) {
                                    alert("❌ Error initializing payment: " + error.message);
                                }

                            },

                            prefill: {
                                name: `${response.first_name} ${response.last_name}`,
                                email: response.email,
                                contact: response.phone,
                            },
                            notes: {
                                address: response.address,
                                zipcode: response.zipcode
                            },
                            theme: {
                                color: "#F37254", // Customize the payment button color
                            },
                        };

                        // Initialize Razorpay
                        var rzp = new Razorpay(options);

                        // Open the payment modal
                        rzp.open();
                    });

                },
                error: function (xhr, status, error) {
                    console.error("Error placing order:", error);
                }
            });

        } else {
            $(".required").text('error:fill every field...');
        }

    });


    // var countries = [
    //     { id: "US", text: "United States" },
    //     { id: "CA", text: "Canada" },
    //     { id: "GB", text: "United Kingdom" },
    //     { id: "IN", text: "India" },
    //     { id: "AU", text: "Australia" },
    //     { id: "DE", text: "Germany" },
    //     { id: "FR", text: "France" },
    //     { id: "IT", text: "Italy" },
    //     { id: "ES", text: "Spain" },
    //     { id: "MX", text: "Mexico" },
    // ];


    // Populate the country dropdown using the static list
    var countrySelect = $('#country');
    $.get("https://countriesnow.space/api/v0.1/countries", function (data) {
        let countries = data.data;
        $.each(countries, function (index, country) {
            $('#country').append(`<option value="${country.country}">${country.country}</option>`);
        });
    });

    $('#country').change(function () {

        let countryName = $(this).val();
        $('#state').html('<option value="">Select State</option>');

        if (countryName) {
            $.ajax({
                url: "https://countriesnow.space/api/v0.1/countries/states",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ country: countryName }),
                success: function (response) {
                    if (response.error === false) {
                        let states = response.data.states;
                        $.each(states, function (index, state) {
                            $('#state').append(`<option value="${state.name}">${state.name}</option>`);
                        });
                    } else {
                        alert("No states found for this country.");
                    }
                },
                error: function () {
                    alert("Error fetching states.");
                }
            });
        }
    });

    $('#state').change(function () {
        let countryName = $('#country').val();
        let stateName = $(this).val();
        $('#city').html('<option value="">Select City</option>'); // Reset City Dropdown

        if (countryName && stateName) {
            $.ajax({
                url: "https://countriesnow.space/api/v0.1/countries/state/cities",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ country: countryName, state: stateName }),
                success: function (response) {
                    if (!response.error) {
                        let cities = response.data;
                        $.each(cities, function (index, city) {
                            $('#city').append(`<option value="${city}">${city}</option>`);
                        });
                    } else {
                        alert("No cities found for this state.");
                    }
                },
                error: function () {
                    alert("Error fetching cities.");
                }
            });
        }
    });


    $(document).on('click', '.remove', function (e) {
        e.preventDefault();
        const productName = $(this).closest('.col-8').find('.pname').text();

        const productindex = cart.findIndex(item => item.product_name === productName);

        if (productindex !== -1) {
            // Remove the product from the cart array
            // alert(productindex);
            cart.splice(productindex, 1);
            saveCart();

        }
        window.location.reload();

    });


    $(document).on('click', '.max', function (e) {
        e.preventDefault();
        const productName = $(this).closest('.col-8').find('.pname').text();
        const product = cart.find(item => item.product_name === productName);

        if (product) {
            product.product_count += 1;
            product.product_total += product.product_price;
            const count = $(this).closest('.col-8').find('.count');
            count.text(`${product.product_count}`);

        }
        saveCart();
        count_total_price();

    });


    // Event delegation for Decrease button
    $(document).on('click', '.min', function (e) {
        e.preventDefault();
        const productName = $(this).closest('.col-8').find('.pname').text(); // Find the product name
        const product = cart.find(item => item.product_name === productName);
        if (product) {
            if (product.product_count > 1) {
                product.product_count -= 1
                product.product_total -= product.product_price;
                const count = $(this).closest('.col-8').find('.count');
                count.text(`${product.product_count}`);
            }
        }

        saveCart();
        count_total_price();
    });


});




let cart = [];


function loadCart() {
    const storedCart = localStorage.getItem('mycart');
    cart = storedCart ? JSON.parse(storedCart) : [];
}



function append_cart_items() {
    loadCart();
    count_total_price();
    $(".items").text(`${cart.length} Items`);
    let itemHtml = ""; // Initialize empty HTML string
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        itemHtml += `
    <div class="row align-items-center">
      <div class="col-4 text-center">
          <img src=${item.product_src} 
          alt="Blue Jeans Jacket" class="rounded-3">
      </div>
      <div class="col-8">
          <span class="mb-0 text-price d-block">${item.product_price}</span>
          <p class="pname mb-0 ">${item.product_name}</p>
          <span>${item.product_description}</span>
          <div class="d-flex align-items-center mt-3">
               <button class="max btn btn-primary btn-sm me-2">+</button>
              <div class="count mt-2 fw-bold">${item.product_count}</div>
              <button class="min btn btn-secondary btn-sm ms-2">-</button>
              <button class="remove float-start badge rounded-pill bg-danger" style="display: inline-block; margin-left: 5em;">Remove</button>
          </div><br>
      </div>  
  </div>
  <br>

            `;
    }

    // Inject the generated HTML into the container with ID 'carditems'
    $("#carditems").html(itemHtml);
}


function saveCart() {
    localStorage.setItem('mycart', JSON.stringify(cart));
}



function count_total_price() {
    let total_price = 0;
    // loadCart();
    let itemHtml = ""; // Initialize empty HTML string
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        total_price += item.product_total;
    }
    $("#subtotal").text(`${total_price}`);
    $("#total").text(`${total_price}`);
}
