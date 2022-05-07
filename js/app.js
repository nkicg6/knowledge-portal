// code to handle queries
function openAlexSearch(term){
    // search concepts via openalex
    let api_call = "http://api.openalex.org/autocomplete/concepts?q="+term;
    jsonres = fetch(api_call,{method: 'GET'})
        .then(function(response){return response.json();});
    return jsonres;
}


function updateInfoDiv(data){
    console.log("Updating div");
    let chooser = document.getElementById("chooser");
    if (!data){
        console.log("No data, clearing");
        // remove all items
        chooser.innerHTML="";
        chooser.style.visibility = "hidden";
        return;
    }
    chooser.style.visibility= "visible";
    // remove all items
    chooser.innerHTML="";
    for (let i = 0; i < data.length; i++){
        current = document.createElement("option");
        fmtId = data[i].id.replace("https://", "https://api.");
        current.value = fmtId;
        current.text = data[i].display_name;
        chooser.appendChild(current);
    }
    chooser.selectedIndex = 0;
    // call other functions here
    // attach listener to the new selection
    // make selection
    return;
}



// setup action listeners
const searchQuery = document.querySelector("#itemsearch");
searchQuery.addEventListener("keyup", function (evt) {
    var searchres = openAlexSearch(searchQuery.value)
        //.then((message) => {message.map(parseResponse)});
    //searches.map(parseResponse);
        .then((message)=> {updateInfoDiv(message.results)});    
});

