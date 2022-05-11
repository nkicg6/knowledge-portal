
const polite = "&mailto=nicholas.george32@gmail.com";
const conceptSearchInput = document.getElementById("conceptSearchInput");
const conceptSelectChooser = document.getElementById("conceptSelectChooser");
const relatedConceptChooser = document.getElementById("relatedConceptChooser");
const conceptDescriptionDiv = document.getElementById("conceptDescriptionDiv");
const topPublicationsDiv = document.getElementById("topPublicationsDiv");
const relatedConceptDiv = document.getElementById("relatedConceptDiv");
const plotDiv = document.getElementById("plotDiv");
// list of all elements that will be cleared and/or made invisible upon update
const hideAndClear = [conceptSelectChooser, relatedConceptChooser, conceptDescriptionDiv, topPublicationsDiv, plotDiv];
const hideOnly = [relatedConceptDiv];



function makeResultsInvisible(){
    for (let i = 0; i < hideAndClear.length; i++){
        hideAndClear[i].style.visibility = "hidden";
        hideAndClear[i].innerHTML = "";
    }
    for (let i = 0; i < hideOnly.length; i++){
        hideOnly[i].style.visibility = "hidden";
    }
    return;
}

function makeResultsVisible(){
    let allDiv = hideAndClear.concat(hideOnly);
    for (let i = 0; i < allDiv.length; i++){
        allDiv[i].style.visibility = "visible";
    }
    return;
}

async function findConceptSearch(term){
    // search concept fragments via openalex
    // returns array of top 10 related concepts
    if (!term){
        return;
    }
    let api_call = "http://api.openalex.org/autocomplete/concepts?q=" + term + polite;
    let jsonres = fetch(api_call,{method: 'GET'})
        .then(function(response){return response.json();});
    return jsonres;
}

async function searchConcept(){
    console.log("Current selection is " + conceptSelectChooser.value);
    let targetConceptJson = await fetch(conceptSelectChooser.value + polite, {method: 'GET'})
        .then((res) => {return res.json()});
    return targetConceptJson;
}

async function searchTopWorks(){
    let worksUrl = conceptSelectChooser.value.replace("https://api.openalex.org/", "https://api.openalex.org/works?filter=concepts.id:") + "&sort=cited_by_count:desc" + polite;
    console.log("Works url: " + worksUrl);
    let worksResponse = fetch(worksUrl, {method: 'GET'})
        .then(function(response){return response.json();});
    return worksResponse;
}


function findPublicationLink(workItem){
    // return the url to the work, preferring pmid, then doi, then openalex
    if (workItem.ids.pmid){
        return workItem.ids.pmid;
    }
    if (workItem.ids.doi){
        return workItem.ids.doi;
    }
    return workItem.ids.openalex;
}

function formatPublicationRow(workItem){
    topPublicationsDiv.innerHTML = "";
    rowBase = document.createElement("tr");
    // publication title and link
    titleCol = document.createElement("td");
    publicationLink = document.createElement("a");
    publicationLink.href = findPublicationLink(workItem);
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
    rowBase.append(titleCol, citations, yearPublished);
    return rowBase;
}

function updateTopPublications(topPubsResponse){
    let results = topPubsResponse.results;
    let papersHeading = document.createElement("h2");
    papersHeading.id = "papersHeading";
    papersHeading.innerHTML = "Top Cited Publications";
    let publicationsTable = document.createElement("table");
    publicationsTable.innerHTML = "<tr><th>Title</th><th>Citations</th><th>Published</th></tr>"
    publicationsTable.id = "publicationsTable";
    for (i = 0; i< results.length; i++){
        let row = formatPublicationRow(results[i]);
        publicationsTable.appendChild(row);
    }
    topPublicationsDiv.append(papersHeading, publicationsTable);
}

function drawConceptChooser(conceptJson){
    let fragment = document.createDocumentFragment();
    for (let i = 0; i < conceptJson.length; i++){
        current = document.createElement("option");
        fmtId = conceptJson[i].id.replace("https://", "https://api.");
        current.value = fmtId;
        current.text = conceptJson[i].display_name;
        fragment.appendChild(current);
    }
    conceptSelectChooser.appendChild(fragment);
    conceptSelectChooser.selectedIndex = 0;
}

function drawRelatedConceptDiv(targetConceptJson){
    relatedConceptChooser.innerHTML="";
    conceptDescriptionDiv.innerHTML = "";
    let conceptHeading = document.createElement("h2");
    conceptHeading.innerHTML = "Concept:<br />'<em>" + targetConceptJson.display_name + "</em>'";
    let fragment = document.createDocumentFragment();
    let related = targetConceptJson.related_concepts;
    for (let i = 0; i < related.length; i++){
        current = document.createElement("option");
        current.value = related[i].display_name;
        current.text = related[i].display_name + " (" + Math.round(related[i].score) + "%)";
        fragment.appendChild(current);
    }
    relatedConceptDiv.style.visibility = "visible";
    relatedConceptChooser.appendChild(fragment);
    conceptDescriptionDiv.appendChild(conceptHeading);
}

function parseCitations(response){
    let countsPerYear = response.counts_by_year;
    let worksx = [];
    let worksy = [];
    for (let i = 1; i < countsPerYear.length; i++){ // skip most recent year
        worksx.push(countsPerYear[i].year);
        worksy.push(countsPerYear[i].works_count);
    }
    return {"x":worksx.reverse(), "y":worksy.reverse()};
}

function plotlyPlotData(datapoints){
    plotDiv.innerHTML = "";
    console.log("plotting");
    let plot = document.createElement("div");
    plot.id = "plotlyCitations"
    plotDiv.appendChild(plot);
    Plotly.newPlot(plot, [datapoints],{margin: { t: 0 }});
}

function updatePlotDiv(topWorksResponse){
    let datapoints = parseCitations(topWorksResponse);
    plotlyPlotData(datapoints);
}

async function updateChildren(targetConceptJson){
    drawRelatedConceptDiv(targetConceptJson);
    let topWorks = await searchTopWorks();
    updateTopPublications(topWorks);
    updatePlotDiv(targetConceptJson);
    // other updates
    makeResultsVisible();
}

async function updateAll(conceptJson){
    makeResultsInvisible();
    relatedConceptDiv.style.visibility = "hidden";
    drawConceptChooser(conceptJson);
    let targetConceptJson = await searchConcept();
    // this should be another function below updateChildren() ---
    updateChildren(targetConceptJson);
}


// setup event listeners and clear fields

conceptSearchInput.value = "";

conceptSearchInput.addEventListener("keyup", function(evt){
    if (!conceptSearchInput.value){
        console.log("No input, clearing page");
        makeResultsInvisible();
        return;
    }
    findConceptSearch(conceptSearchInput.value)
        .then((message) => {updateAll(message.results)});
});

conceptSelectChooser.addEventListener("change", function(evt){
    searchConcept().then((message)=> {updateChildren(message)});
    
})

relatedConceptChooser.addEventListener("change", function(evt){
    let newTarget = relatedConceptChooser.value;
    conceptSearchInput.value = newTarget;
    findConceptSearch(conceptSearchInput.value)
        .then((message) => {updateAll(message.results)});
});
