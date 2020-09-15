function deleteuser(){
    fetch('/users/me', {
        method : 'DELETE'
    })
}
function pic(){
  const img = document.querySelector("img")
    img.src= "/images/no_avatar2.png"
}