function geturl() {
    url = localStorage.getItem("fasturl");
    return url;
}

function getweburl() {
    url = localStorage.getItem("weburl");
    return url;
}



function add_new_product(){
    const token = sessionStorage.getItem("jwt");
    let formData = new FormData();
    formData.append("product_name", $("#product_name").val());
    formData.append("product_description", $("#product_description").val());
    formData.append("india_price", $("#india_price").val());
    formData.append("uae_price", $("#uae_price").val());
    formData.append("category", $("#styledSelect").val());
    formData.append("product_img", $("#product_img")[0].files[0]);
    console.log(formData);
    $.ajax({
        url: geturl()+"/add_new_product/",
        type: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            console.log(response);
            alert("Product Insert Successful!");
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            alert("Error occure");
        }
    });
    
}

loadCategories();


$(document).ready(function () {
    $(document).change("#product_img",function(event){
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function(e) {
                $("#preview").attr("src", e.target.result).show();
            };
            reader.readAsDataURL(file);
        }
    });

    // const token = sessionStorage.getItem("jwt");
    // $.ajax({
    //     url: geturl()+"/protected",
    //     type: "GET",
    //     headers: {
    //         "Authorization": "Bearer " + token
    //     },
    //     success: function (response) {
    //         console.log("Response:", response);
    //     },
    //     error: function (xhr) {
    //         console.error("Error:", xhr.responseJSON.detail);
    //         window.location.href = `${getweburl()}/admin`;
    //     }
    // });

    //fetch product categorys into table----------------------------

    //------------------------------------------------------------------------
    function loadPage(page) {
        let content = $("#content-area");

        if (page === "home") {
            window.location.href = `${getweburl()}`;
        } else if (page === "product_category") {

            product_category = `
              <div class="container">
                        <h2 class="text-center">📂 Product Categories</h2>
                        <div class="input-group mb-3">
                        <input type="text" id="newCategory" class="form-control" placeholder="Add New Category">
                        <button class="btn btn-success" onclick="addCategory()">➕ Add</button>
                    </div>
                        
                        <!-- Category Table -->
                        <table class="table table-bordered table-striped">
                            <thead class="table-primary">
                                <tr>
                                    <th>Product Categories</th>
                                </tr>
                            </thead>
                            <tbody id="categoryTableBody">
                                <tr><td>Loading categories...</td></tr>
                            </tbody>
                        </table>
                
                </div>
            `
            content.html(product_category);
            loadCategories();
        }

        else if(page === "add_product"){
            addproduct=`
               <div class="col-md-8" style="align-content: center;">
                    <div class="card h-100">
                        <div class="card-header py-3">
                            <h5 class="mb-0">Add New Product</h5>
                        </div>
                        <div class="card-body">
                            <form>
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <input type="text" id="product_name" class="form-control" placeholder="Product Name">
                                    </div>
                                
                                </div>
                                <div class="col-md-6">
                                    <textarea id="product_description" class="form-control mb-4" rows="3" placeholder="enter product description..."></textarea>
    
                                </div><br>
                                <div class="col-md-6">
                                <input type="number" id="india_price" class="form-control mb-4" placeholder="Price IN INDIA">
                                </div>
                                <div class="col-md-6">
                                    <input type="number" id="uae_price" class="form-control mb-4" placeholder="Price IN UAE">
                                    </div>
                               <div><br>
                                    <select class="form-select form-select-lg" id="styledSelect">
                                        <option selected>Select Categories</option>
                                    </select>
                                </div><br><br>
                                <div class="mb-3">
                                    <label for="product_img" class="form-label fw-bold">Upload Product Image:</label>
                                    <input type="file" class="form-control" id="product_img" name="product_img" accept="image/*">
                                    <img id="preview" alt="Image Preview">
                                </div><br><br>

                                
    
                                <button id="addproduct" type="button" class="btn btn-primary w-100" onclick="add_new_product()">Add Product</button>
                            </form>
                        </div>
                    </div>
                </div>
            `
            content.html(addproduct);
            load_addproject_Categories();
        }

        else if(page==="edit_product"){
            
            edit_product=`
            <div>filter product:  
            <select class="form-select form-select-lg edit_product_category" id="styledSelect">
                <option selected>Select Categories</option>
            </select>
            <br><br>
             <div>
                 <table id="productTable">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Description</th>
                            <th>Prices (JSON)</th>
                            <th>Image</th>
                            <th>Actions</th>
                           
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            </div>
           
            `
            content.html(edit_product);
            load_addproject_Categories();
        }
        else if (page === "settings") {
            content.html("<h3>⚙️ Settings</h3><p>Manage your settings here.</p>");
        }
    }


    $(".sidebar a").click(function (event) {
        event.preventDefault();
        let page = $(this).attr("onclick").match(/'([^']+)'/)[1]; 
        loadPage(page);
    });


    $("#logout").click(function () {
        sessionStorage.removeItem("jwt");
        window.location.href = "/login";
    });
});


function editCategory(id) {
    const currentName = $(`#cat-${id}`).text();
    const newName = prompt("Edit category:", currentName);
    if (!newName || newName.trim() === "") return;
    alert(`${id}`+`${newName}`);
   
    $.ajax({
        url: geturl() + `/update_category/${id}`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ category: newName }),
        success: function () {
            alert("Category updated successfully!");
            $(`#cat-${id}`).text(newName); 
        },
        error: function () {
            alert("Failed to update category. Please try again.");
        }
    });
}


function deleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const token = sessionStorage.getItem("jwt");
    $.ajax({
        url: geturl() + `/delete_category/`,
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        contentType: "application/json",
        data: JSON.stringify({ id: id }),
       
        success: function () {
            alert("Category deleted successfully!");    
            $(`#row-${id}`).remove();
        },
        error: function () {
            alert("Failed to delete category. Please try again.");
        }
    });
}



function load_addproject_Categories(){
    $.ajax({
        url: geturl() + "/list_category",
        method: "GET",
        success: function (data) {
            const selectElement = $("#styledSelect");
            selectElement.empty(); // Clear existing options
            // Add new options dynamically
            data.forEach(option => {
                selectElement.append(
                    `<option value="${option.categories}">${option.categories}</option>`
                );
            });
        },
        error: function () {
            alert("Failed to load options. Please try again.");
        }
    });
}



function loadCategories() {

    $.ajax({
        url: geturl() + "/list_category", 
        method: "GET",
        success: function (data) {
            const tableBody = $("#categoryTableBody");
            tableBody.empty(); 

            if (data.length === 0) {
                tableBody.append("<tr><td colspan='2'>No categories available</td></tr>");
            } else {
                data.forEach(option => {
                    tableBody.append(`
                        <tr id="row-${option.id}">
                            <td><span id="cat-${option.id}">${option.categories}</span></td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="editCategory(${option.id})">✏️ Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${option.id})">🗑️ Delete</button>
                            </td>
                        </tr>
                    `);
                });
            }
        },
        error: function () {
            alert("Failed to load categories. Please try again.");
        }
    });
}



function addCategory() {
    const newCategory = $("#newCategory").val().trim(); 
    if (!newCategory) {
        alert("Please enter a valid category name.");
        return; 
    }
    const token = sessionStorage.getItem("jwt");
    $.ajax({
        url: geturl() + "/insert_category/", 
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        contentType: "application/json",
        data: JSON.stringify({ category: newCategory }),
        success: function () {
            alert("Category added successfully!");
            $("#newCategory").val(""); 
            loadCategories(); 
        },
        error: function () {
            alert("Failed to add category. Please try again.");
        }
    });
}
