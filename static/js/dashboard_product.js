function geturl() {
    url = localStorage.getItem("fasturl");
    return url;
}

function getweburl() {
    url = localStorage.getItem("weburl");
    return url;
}


function load_add_project_category(){
  
$.ajax({
    url: geturl()+"/list_category",
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

});


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
        // headers: {
        //     "Authorization": "Bearer " + token
        // },
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
