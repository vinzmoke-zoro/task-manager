const name = document.getElementById("name")
const age = document.getElementById("age")
const email = document.getElementById("email")
const pass = document.getElementById("pass")
function update(){
    fetch(window.location.href, {
        method : 'PATCH',
        body : JSON.stringify({
           name : name.value,
           age : age.value,
           password : pass.value
        }),
        headers : {
            "Content-type" : "application/json;charset=UTF-8"
        }
    }).then(response => response.json()).then(json => console.log(json))
}

function deleteavatar(){
    fetch('/users/me/avatar', {
        method : 'DELETE'
    })
    window.location.reload()
}
    function pic(){
        const img = document.querySelector("img")
          img.src= "/images/no_avatar2.png"
      }
