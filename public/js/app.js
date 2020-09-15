const dlt = document.querySelector(".delete")
const update = document.querySelector(".update")
function insertUrlParam(key, value){
    if(history.replaceState){
        let searchParams = new URLSearchParams(window.location.search)
        searchParams.set(key, value)
        let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString()
        window.history.replaceState({path : newUrl}, '', newUrl)
    }
}

function x(id){
    const row = document.getElementById(id)
    row.remove()
    fetch('/tasks/delete/' + id, {
        method : 'DELETE'
    })    
}
function complete(){
    insertUrlParam('completed', 'true')
    window.location.reload()
}
function incomplete(){
    insertUrlParam('completed', 'false')
    window.location.reload()
}
function filterOff(){
   window.location.href = window.location.href.split('?')[0]
}
const select = document.getElementById('sortby')
function changeOpt(){
    const val = select.options[select.selectedIndex].value
    if(val == select.options[1].value){
        complete()
    }
    else if(val === select.options[2].value){
        incomplete()
    }
    else{
        filterOff()
    }
}

    if(window.location.search.includes('completed=false')){
    select.options[2].selected = true
    }
    else if(window.location.search.includes('completed=true')){
        select.options[1].selected = true
        }    
    else{
    select.options[0].selected = true
    }

    document.querySelectorAll('.complete').forEach((completed) => {
        if(completed.textContent == 'true'){
            completed.innerHTML = "<img src=\"/images/tick.svg\" height=\"25px\">"
        }
        else{
            completed.innerHTML = "<img src=\"/images/cross.svg\" height=\"25px\">"
        }
    })