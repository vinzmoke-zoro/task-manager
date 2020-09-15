const title = document.getElementById('title')
const description = document.getElementById('description')
const no = document.getElementById('false')
const yes = document.getElementById('true')
const x = window.location.href.split('update/')
const idx = x[1].split("?")
const id = idx[0]
fetch('/tasks/' + id).then(response => response.json()).then((data) => {
    title.value = data.title
    description.value = data.description
    if(data.completed == true){
        yes.checked = true
    }
    else{
        no.checked = true
    }
})
function update(){
     fetch(window.location.href, {
         method : 'PATCH',
         body : JSON.stringify({
            title : title.value,
            description : description.value,
            completed : yes.checked
         }),
         headers : {
             "Content-type" : "application/json;charset=UTF-8"
         }
     }).then(response => response.json()).then(json => console.log(json))
}