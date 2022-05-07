// code to handle queries
const searchQuery = document.getElementById("itemsearch");
const searchConceptDiv = document.getElementById("searchConceptDiv");
const chooser = document.getElementById("chooser");
const polite = "&mailto=nicholas.george32@gmail.com";


function openAlexSearch(term){
    // search concepts via openalex
    let api_call = "http://api.openalex.org/autocomplete/concepts?q=" + term + polite;
    jsonres = fetch(api_call,{method: 'GET'})
        .then(function(response){return response.json();});
    return jsonres;
}


function updateInfoDiv(data){
    console.log("Updating div");
    if (!data){
        console.log("No data, clearing");
        // remove all items
        chooser.innerHTML="";
        chooser.style.visibility = "hidden";
        searchConceptDiv.innerHTML = "";
        searchConceptDiv.style.visibility = "hidden";
        return;
    }
    chooser.style.visibility= "visible";
    searchConceptDiv.style.visibility = "visible"
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
    searchConcept();
    return;
}

function searchConcept(){
    console.log("Current selection is " + chooser.value);
    conceptRes = fetch(chooser.value + polite, {method: 'GET'})
        .then((res) => {return res.json()})
        .then((resjson) => {updateSearchConceptDiv(resjson)});
}

function updateSearchConceptDiv(response){
    searchConceptDiv.innerHTML = "";
    console.log(response.description);
    let heading = document.createElement("h2");
    heading.innerHTML = response.display_name;
    let description = document.createElement("p");
    description.innerHTML = response.description;
    let plot = document.createElement("div");
    plot.id = "plotlyCitations";
    plot.innerHTML = "test";
    searchConceptDiv.append(heading, description, plot);
}


// setup event listeners and clear fields

searchQuery.value = "";

searchQuery.addEventListener("keyup", function (evt) {
    openAlexSearch(searchQuery.value)
        .then((message)=> {updateInfoDiv(message.results)});    
});

chooser.addEventListener("change", function(evt){
    searchConcept()
});
