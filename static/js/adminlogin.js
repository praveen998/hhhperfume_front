
function geturl(){
    url=localStorage.getItem("fasturl");
    return url;
}



$(document).ready(function () {

// const jwttoken = sessionStorage.getItem("jwt");
// $.ajax({
//   url: "http://127.0.0.1:8000/protected",
//   type: "GET",
//   headers: {
//       "Authorization": "Bearer " + jwttoken
//   },
//   success: function(response) {
//       console.log("Response:", response);
//       window.location.href = geturl()+`/dashboard`;
//   },
//   error: function(xhr) {
//       console.error("Error:", xhr.responseJSON.detail);
//   }
// });


    $("#loginbutton").click(function (event) {
        event.preventDefault(); // Prevent form from submitting traditionally
  
        let Username = $("#Username").val();
        let Password = $("#Password").val();
  
        $.ajax({
          url: geturl()+"/adminauth", // FastAPI backend endpoint
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({ username: Username, password: Password }),
          success: function (response) {
            alert("Login Successful: " + response.message);
            sessionStorage.setItem("jwt",response.token);
            console.log(response);
            window.location.href = geturl()+`/dashboard`;
            
          },

          error: function (xhr, status, error) {
            alert("Login Failed: " + xhr.responseText);
            console.error(xhr, status, error);
          },
        });
      });
 

      $("#checkjwt").click(function(e){
        e.preventDefault();
        const token = sessionStorage.getItem("jwt");

        $.ajax({
            url: "http://127.0.0.1:8000/protected",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(response) {
                console.log("Response:", response);
                $("#check").text(response.message);
            },
            error: function(xhr) {
                console.error("Error:", xhr.responseJSON.detail);
                $("#check").text(xhr.responseJSON.detail);
            }
        });

      });
   // retrieve_buynow_storage()
});



