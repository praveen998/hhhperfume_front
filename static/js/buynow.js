
function geturl() {
    url = localStorage.getItem("fasturl");
    return url;
}

function getweburl() {
    url = localStorage.getItem("weburl");
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
    append_cart_item();
    let customer;
    $('.placeorder').click(async function () {
        let firstName = sanitizeInput($("#firstName").val());
        let lastName = sanitizeInput($("#lastName").val());
        let email = sanitizeInput($('#email').val());
        let phone = sanitizeInput($('#phone').val().toString());
        let country = sanitizeInput($('#country').val());
        let state = sanitizeInput($('#state').val());
        let city = sanitizeInput($('#city').val());
        let address = sanitizeInput($('#address').val());
        let zipcode = sanitizeInput($('#zipcode').val());
        let additionalInfo = sanitizeInput($('#additionalInfo').val());
        const keys = 'buynow_product';
        const storedValues = localStorage.getItem(keys);
        let parsedValue = JSON.parse(storedValues);
        let total_amount = parsedValue.product_total;
        if (firstName && lastName && email && country && phone && state && address && zipcode) {
            //alert(`${total_amount}`);
            $(".required").text('');
            let response = await $.ajax({
                url: geturl() + "/create-order/",
                type: "POST",
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                contentType: "application/json",
                data: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone: phone,
                    state: state,
                    city:city,
                    address: address,
                    country: country,
                    zipcode: zipcode,
                    additional_info: additionalInfo,
                    total_amount: total_amount,
                    order_data:parsedValue,
                }),
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
                        error:{
                            
                        }
                    });

                    $(".orderstatus").html(`
                         <span style="color: green;">${response.message}</span>
                         <div class=" mt-4">
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
                            name: "HHH Perfumes",
                            description: "Test Transaction",
                            //image: "https://your-logo-url.com/logo.png", // Your company logo
                            handler: async function (response) {
                                // This function will be called after a successful payment
                                //alert("Payment successful! Payment ID: " + res.razorpay_payment_id);

                            try{
                                let verifyResponse = await fetch(geturl()+"/verify-payment/", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
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
                    let errorMessage = "Error: " + xhr.responseJSON.detail;
                    alert(errorMessage);  // Show error message in an alert box
                }
            });

        }
        else {
            $(".required").text('error:fill every field...');
        }
    });



    //retrieve_buynow_storage()
    $('#max').click(function () {
        c = maxize_price();
        $("#count").text(`${c}`);

    });


    $('#min').click(function () {
        c = minimize_price();
        $("#count").text(`${c}`);
    });

    var countrySelect = $('#country');
    $.get("https://countriesnow.space/api/v0.1/countries", function(data) {
        let countries = data.data;
        $.each(countries, function(index, country) {
            $('#country').append(`<option value="${country.country}">${country.country}</option>`);
        });
    });
    // countries.forEach(function (country) {
    //     countrySelect.append('<option value="' + country.id + '">' + country.text + '</option>');
    // });

    $('#country').change(function() {
       
        let countryName = $(this).val();
        $('#state').html('<option value="">Select State</option>');
    
        if (countryName) {
            $.ajax({
                url: "https://countriesnow.space/api/v0.1/countries/states",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ country: countryName }),
                success: function(response) {
                    if (response.error === false) {
                        let states = response.data.states;
                        $.each(states, function(index, state) {
                            $('#state').append(`<option value="${state.name}">${state.name}</option>`);
                        });
                    } else {
                        alert("No states found for this country.");
                    }
                },
                error: function() {
                    alert("Error fetching states.");
                }
            });
        }
    });

    $('#state').change(function() {
        let countryName = $('#country').val();
        let stateName = $(this).val();
        $('#city').html('<option value="">Select City</option>'); // Reset City Dropdown

        if (countryName && stateName) {
            $.ajax({
                url: "https://countriesnow.space/api/v0.1/countries/state/cities",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ country: countryName, state: stateName }),
                success: function(response) {
                    if (!response.error) {
                        let cities = response.data;
                        $.each(cities, function(index, city) {
                            $('#city').append(`<option value="${city}">${city}</option>`);
                        });
                    } else {
                        alert("No cities found for this state.");
                    }
                },
                error: function() {
                    alert("Error fetching cities.");
                }
            });
        }
    });



    $("#cart").click(function () {
        window.location.href = `${getweburl()}/cart`;
    });

});



function retrieve_buynow_storage() {
    const key = 'buynow_product';
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        let parsedValue = JSON.parse(storedValue);
        alert('Product Name: ' + parsedValue.product_name + '\n' +
            'Image Source: ' + parsedValue.product_src + '\n' +
            'Description: ' + parsedValue.product_description + '\n' +
            'Price: ' + parsedValue.product_price);

    } else {
        console.log(`${key} does not exist.`);
    }

}


function minimize_price() {
    const key = 'buynow_product';
    const product = JSON.parse(localStorage.getItem(key));
    if (product.product_count != 1) {
        product.product_count -= 1;
        product.product_total -= product.product_price;
        $("#subtotal").text(`${product.product_total}`);
        $("#total").text(`${product.product_total}`);
    }
    localStorage.setItem(key, JSON.stringify(product));
    return product.product_count;
}



function maxize_price() {
    const key = 'buynow_product';
    const product = JSON.parse(localStorage.getItem(key));
    product.product_count += 1;
    product.product_total += product.product_price;
    $("#subtotal").text(`${product.product_total}`);
    $("#total").text(`${product.product_total}`);
    localStorage.setItem(key, JSON.stringify(product));
    return product.product_count;
}


function append_cart_item() {
    const key = 'buynow_product';
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        let parsedValue = JSON.parse(storedValue);
        $("#subtotal").text(`${parsedValue.product_total}`);
        $("#total").text(`${parsedValue.product_total}`);

        // alert('Product Name: ' +  parsedValue.product_name  + '\n' +
        //     'Image Source: ' + parsedValue.product_src + '\n' +
        //     'Description: ' + parsedValue.product_description  + '\n' +
        //     'Price: ' + parsedValue.product_price);
        carditem = `
                        <div class="row align-items-center">
                            <div class="col-4 text-center">
                                <img  src=${parsedValue.product_src}
                                alt="Blue Jeans Jacket" class="rounded-3">
                            </div>
                            <div class="col-8">
                                <span class="mb-0 text-price d-block">${parsedValue.product_price}</span>
                                <p class="mb-0"><b>${parsedValue.product_name}</b></p>
                                <span>${parsedValue.product_description}</span>
                                <div class="d-flex align-items-center mt-3">
                                    <button id="max" class="btn btn-primary btn-sm me-2">+</button>
                                    <div id="count">${parsedValue.product_count}</div>
                                    <button id="min" class=" btn btn-secondary btn-sm ms-2">-</button>
                                </div>
                            </div>
                        </div>
                        </div>
    `
        $("#card_item").html(carditem);

    } else {
        console.log(`${key} does not exist.`);
    }

}



function retrieve_buynow_storage() {
    const key = 'buynow_product';
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        let parsedValue = JSON.parse(storedValue);
        alert('Product Name: ' + parsedValue.product_name + '\n' +
            'Image Source: ' + parsedValue.product_src + '\n' +
            'Description: ' + parsedValue.product_description + '\n' +
            'Price: ' + parsedValue.product_price);
    }
    else {
        console.log(`${key} does not exist.`);
    }
}



function get_stored_value() {
    const key = 'buynow_product';
    const storedValue = localStorage.getItem(key);
    return storedValue;
}

