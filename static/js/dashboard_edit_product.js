function geturl() {
    url = localStorage.getItem("fasturl");
    return url;
}


let selectedValue;

$(document).ready(function () {
   
$(document).on("change", ".edit_product_category", function () {
    selectedValue = $(this).val(); 
    loadTable(selectedValue);

});


// $(document).on("click", ".save", function() {
//     let row = $(this).closest("tr");
//     //let id = row.data("id");
//     let name = row.find(".name").val();
//     let desc = row.find(".desc").val();
//     let price;
//     try {
//         price = JSON.parse(row.find(".price").val());
//     } catch (e) {
//         alert("Invalid JSON format in price field");
//         return;
//     }
//     let image = row.find(".image-upload")[0].files[0];
//     let formData = new FormData();
//     formData.append("name", name);
//     formData.append("desc", desc);
//     formData.append("price", JSON.stringify(price));

//     if (image) {
//         formData.append("image", image);
//         let reader = new FileReader();
//         reader.onload = function(e) 
//         {
//             row.find("img").attr("src", e.target.result);
           
//         };
//         reader.readAsDataURL(image);
//     } 
//     $.ajax({
//         url: geturl()+`/update_product/`,
//         type: "POST",
//         data: formData,
//         processData: false, // Prevent jQuery from processing the data
//         contentType: false, // Prevent jQuery from setting content-type
//         success: function(response) {
//             if (response.message === "Product updated successfully") {
//                // row.find("img").attr("src", response.product[3]); // Update image preview
//                 alert("Product updated successfully!");
//             } else {
//                 alert("Error updating product: " + response.detail);
//             }
//         },
//         error: function(xhr) {
//             alert("Error updating product: " + xhr.responseText);
//         }
//     });
// });



$(document).on("click", ".delete", function() {
    let row = $(this).closest("tr");
    let name = row.find(".name").val();
    //alert(`${name}`);
    const token = sessionStorage.getItem("jwt");
   
     $.ajax({
            url: geturl()+"/delete_product/",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            contentType: "application/json",
            data: JSON.stringify({ product_name: name }),
            success: function (response) {
              alert(`${response.message}`);
              loadTable(selectedValue);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching text:", error);
                alert("Error fetching text. Please try again.");
            }
        });
    
});

});




//let products = {"1":["vanila perfume 50ml","good body perfume",{"UAE":111.0,"India":555.0},"https://nibhasitsolutions.s3.ap-south-1.amazonaws.com/kali-linux-3840x2160-18058.jpg"],"2":["rose perfume 100ml","good body perfume",{"UAE":222.0,"India":444.0},"kali-linux-3840x2160-18058.jpg"],"3":["jasmin perfume","very smelly body perfume...",{"UAE":99.0,"India":111.0},"kali-linux-3840x2160-18058.jpg"],"4":["oarchid perfume","nice perfume",{"UAE":22.0,"India":333.0},"kali-linux-3840x2160-18058.jpg"]};

function loadTable(data) {
    let products=null;
    const token = sessionStorage.getItem("jwt");
   
     $.ajax({
            url: geturl()+"/list_products_edit_product/",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            contentType: "application/json",
            data: JSON.stringify({ category: data }),
            success: function (response) {
               products=response;
               let tbody = "";
               $.each(products, function(key, product) {
                   tbody += `<tr data-id="${key}">
                       <td><input type="text" class="form-control name" value="${product[0]}" disabled></td>
                       <td><textarea disabled class="form-control desc">${product[1]}</textarea></td>
                       <td><textarea disabled class="form-control price">${JSON.stringify(product[2])}</textarea></td>
                       <td class="text-center">
                           <img src="${product[3]}" class="img-thumbnail" alt="Product Image">
                       </td>   
                       <td class="text-center">
                           <button class="btn btn-danger delete">Delete</button>
                       </td>
                   </tr>`;
               });  
           
               $("#productTable tbody").html(tbody);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching text:", error);
                alert("Error fetching text. Please try again.");
            }
        });

   
}

