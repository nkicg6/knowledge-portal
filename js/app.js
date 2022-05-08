// code to handle queries
const topPublicationsDiv = document.getElementById("topPublicationsDiv");
const realtedConceptDiv = document.getElementById("relatedConceptDiv");
const searchQuery = document.getElementById("itemsearch");
const searchConceptDiv = document.getElementById("searchConceptDiv");
const chooser = document.getElementById("chooser");
const polite = "&mailto=nicholas.george32@gmail.com";

const divList = [topPublicationsDiv, relatedConceptDiv, chooser, searchConceptDiv];

// API calls to api.OpenAlex.org
function openAlexSearch(term){
    // search concepts via openalex
    let api_call = "http://api.openalex.org/autocomplete/concepts?q=" + term + polite;
    jsonres = fetch(api_call,{method: 'GET'})
        .then(function(response){return response.json();});
    return jsonres;
}

function searchConcept(){
    // request info for the concept ID selected to fill info div
    console.log("Current selection is " + chooser.value);
    conceptRes = fetch(chooser.value + polite, {method: 'GET'})
        .then((res) => {return res.json()})
        .then((resjson) => {updateSearchConceptDiv(resjson)});
}

async function searchTopWorks(){
    let worksUrl = chooser.value.replace("https://api.openalex.org/", "https://api.openalex.org/works?filter=concepts.id:") + "&sort=cited_by_count:desc" + polite;
    console.log("Works url: " + worksUrl);
    worksResponse = fetch(worksUrl, {method: 'GET'})
        .then(function(response){return response.json();});
    return worksResponse;
}

function updateInfoDiv(data){
    // Update The main Info Div with the plots and derived info
    console.log("Updating main information div");
    if (!data){
        console.log("No data, clearing");
        // remove all items
        for (let i = 0; i < divList.length; i++){
            divList[i].innerHTML = "";
            divList[i].style.visibility = "hidden";
        }
        // chooser.innerHTML="";
        // chooser.style.visibility = "hidden";
        // searchConceptDiv.innerHTML = "";
        // searchConceptDiv.style.visibility = "hidden";
        return;
    }
    // remove all items before drawing again
    chooser.innerHTML="";

    for (let i = 0; i < data.length; i++){
        current = document.createElement("option");
        fmtId = data[i].id.replace("https://", "https://api.");
        current.value = fmtId;
        current.text = data[i].display_name;
        chooser.appendChild(current);
    }
    chooser.style.visibility= "visible";
    searchConceptDiv.style.visibility = "visible"
    chooser.selectedIndex = 0;
    searchConcept();
    return;
}


function parseCitations(response){
    let countsPerYear = response.counts_by_year
    let worksx = [];
    let worksy = [];
    for (let i = 0; i < countsPerYear.length; i++){
        worksx.push(countsPerYear[i].year);
        worksy.push(countsPerYear[i].works_count);
    }
    return {"x":worksx.reverse(), "y":worksy.reverse()};
}

function plotData(datapoints){
    console.log("plotting");
    Plotly.newPlot(document.getElementById("plotlyCitations"), [datapoints]);
}

function updateRelatedConceptsDiv(response){
    console.log("Updating related concepts div");
    relatedConceptDiv.innerHTML="";
    let conceptHeading = document.createElement("h2");
    conceptHeading.innerHTML = "Concepts related to '" + response.display_name + "'";
    let conceptExplain = document.createElement("p");
    conceptExplain.innerHTML = "Click a concept to search (not yet implemented...)";
    let conceptList = document.createElement("ul");
    conceptList.size = 10;
    conceptList.id = "relatedConceptList";
    conceptList.style.height = "150px";
    conceptList.style.overflow = "scroll";
    let related = response.related_concepts;
    for (let i = 0; i < related.length; i++){
        conceptItem = document.createElement("li");
        conceptItem.value = related[i].id;
        conceptLink = document.createElement("a");
        conceptLink.target = "_blank";
        conceptLink.rel="noopener";
        conceptLink.href = related[i].id;
        conceptLink.innerHTML = related[i].display_name + " (" + Math.round(related[i].score) + "%)";
        conceptItem.appendChild(conceptLink);
        conceptList.appendChild(conceptItem);        
    }
    relatedConceptDiv.append(conceptHeading, conceptExplain, conceptList);
    relatedConceptDiv.style.visibility = "visible";
}

function formatPublicationRow(workItem){
    topPublicationsDiv.innerHTML = "";
    rowBase = document.createElement("tr");
    // publication title and link
    titleCol = document.createElement("td");
    publicationLink = document.createElement("a");
    publicationLink.href = workItem.ids.doi;
    publicationLink.target = "_blank";
    publicationLink.rel = "noopener";
    publicationLink.innerHTML = workItem.display_name;
    titleCol.appendChild(publicationLink);
    // Year Published
    yearPublished = document.createElement("td");
    yearPublished.innerHTML = workItem.publication_year;
    // Citations
    citations = document.createElement("td");
    citations.innerHTML = workItem.cited_by_count;
    rowBase.append(titleCol, yearPublished, citations);
    return rowBase;
}

async function updateTopPublications(){
    console.log("Updating top publications div");
    let topWorksResponse = await searchTopWorks();
    let topWorksResults = topWorksResponse.results;
    let publicationsTable = document.createElement("table");
    publicationsTable.innerHTML = "<tr><th>Title</th><th>Year Published</th><th>Citations</th></tr>"
    publicationsTable.id = "publicationsTable";
    for (i= 0; i < topWorksResults.length; i++){
        row  = formatPublicationRow(topWorksResults[i]);
        publicationsTable.appendChild(row);
    }
    topPublicationsDiv.append(publicationsTable);
    topPublicationsDiv.style.visibility ="visible";
}


function updateSearchConceptDiv(response){
    searchConceptDiv.innerHTML = "";
    searchConceptDiv.style.visibility = "visible";
    let heading = document.createElement("h2");
    heading.innerHTML = response.display_name;
    let description = document.createElement("p");
    description.innerHTML = response.description;
    let plot = document.createElement("div");
    plot.id = "plotlyCitations";
    citationsplot = parseCitations(response);
    searchConceptDiv.append(heading, description, plot);
    plotData(citationsplot);
    updateRelatedConceptsDiv(response);
    updateTopPublications();
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
