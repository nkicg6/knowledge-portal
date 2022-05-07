// code to handle queries
function openAlexSearch(term){
    let api_call = "http://api.openalex.org/autocomplete/concepts?q="+term;
    jsonres = fetch(api_call,{method: 'GET'})
        .then(function(response){return response.json();});
    return jsonres;
}


function parseResponse(arr){
    if (!arr){
        updateInfoDiv("<p>No results</p>");
    }
    console.log(arr.length);
    let html_res = '<ul id="searchResults">';
    for (let i = 0; i < arr.length; i++){
        html_res += '<ul class="singleItem">';
        let id = arr[i].id;
        let name = arr[i].display_name;
        html_res += '<li><a href="' + id + '">' + name + '</a></li></ul>';
    }
    html_res += "</ul>";
    console.log(html_res);
    updateInfoDiv(html_res);
}

function updateInfoDiv(data){
    console.log("Updating div");
    let rightdiv = document.getElementById("right");
    //console.log(rightdiv);
    rightdiv.innerHTML = data;
    console.log(rightdiv);
    
}


const searchQuery = document.querySelector("#itemsearch");
searchQuery.addEventListener("keyup", function (evt) {
    var searchres = openAlexSearch(searchQuery.value)
        //.then((message) => {message.map(parseResponse)});
    //searches.map(parseResponse);
        .then((message)=> {parseResponse(message.results)});    
});

