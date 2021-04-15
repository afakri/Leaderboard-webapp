let dropdownBtn = document.querySelector('.menu-btn');
let menuContent = document.querySelector('.menu-content');
let menuItems = document.getElementsByClassName('links')
window.addEventListener('scroll', () => {
    const nav = document.getElementsByClassName("navbar")[0];
    const items = document.getElementsByTagName("h4");

    const button = document.getElementsByTagName("button")[0];
    const scrolled = window.scrollY;
    if (scrolled > 0) {
        button.classList.add("newbutton")
        items[0].classList.add("newli")
        items[1].classList.add("newli")
        items[2].classList.add("newli")
        items[3].classList.add("newli")
        nav.classList.add("sticky")
    } else {
        button.classList.remove("newbutton")
        nav.classList.remove("sticky")
        items[0].classList.remove("newli")
        items[1].classList.remove("newli")
        items[2].classList.remove("newli")
        items[3].classList.remove("newli")
    }

});

// competition button drop-down
dropdownBtn.addEventListener('click', () => {
    if (menuContent.style.display === "") {
        menuContent.style.display = "block";
    } else {
        menuContent.style.display = "";
    }
})

const comp_names = []
const competitions = await getCompetitions();

//replacing "_" with spaces
competitions.forEach(comp => {
    let name = comp.competition_name
    comp_names.push(name)
    const elem = document.createElement("a")
    elem.classList.add("links")
    elem.append(name.replace(/_/g, " "))
    menuContent.appendChild(elem)
})

// Only renders when there's at least one competition
// The first one in the array is the first to be rendered by default
if (comp_names.length > 0) {
    let comp_name = comp_names[0]
    const events = await getEvents(comp_name)

    const scoreTables = await tableMaker(comp_name, events)

    //sort by name so its easier to create the rows
    scoreTables.forEach(table => {
        table.sort(function(a, b) {
            if (a.athlete_name > b.athlete_name) return 1;
            if (a.athlete_name < b.athlete_name) return -1;
            return 0;
        })
    })


    //Method that makes the html tables
    scoreTable(events, scoreTables)
        //Makes every column sortable when you click on the column header
    document.querySelectorAll(".table-content th").forEach(headerCell => {
        headerCell.addEventListener("click", () => {
            const tableElement = headerCell.parentElement.parentElement;
            const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
            const currentIsAscending = headerCell.classList.contains("th-sort-asc");
            sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
        });
    });

    //adding the onClick functionality for the items of the dropdown menu for the competitions
    for (var i = 0; i < menuItems.length; i++) {
        let name = menuItems[i].innerHTML
        menuItems[i].onclick = async function() {
            menuContent.style.display = "";
            let table = document.getElementsByClassName('table-content')[0]
            if (table != null) {
                table.remove()
            }
            let comp_name = name.replace(/ /g, "_")
            const events = await getEvents(comp_name)
            console.log(events)

            const scoreTables = await tableMaker(comp_name, events)

            scoreTables.forEach(table => {
                table.sort(function(a, b) {
                    if (a.athlete_name > b.athlete_name) return 1;
                    if (a.athlete_name < b.athlete_name) return -1;
                    return 0;
                })
            })

            scoreTable(events, scoreTables)

            document.querySelectorAll(".table-content th").forEach(headerCell => {
                headerCell.addEventListener("click", () => {
                    const tableElement = headerCell.parentElement.parentElement;
                    const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
                    const currentIsAscending = headerCell.classList.contains("th-sort-asc");
                    sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
                });
            });
        };
    }

}




async function tableMaker(comp_name, events) {

    const scoreTables = []
    const scoringMethods = []

    for (var i = 0; i < events.length; i++) {
        scoreTables[i] = await getScores(events[i].event_name, comp_name)
        if (scoreTables[i].length == 0) {
            scoreTables.pop();
            events.splice(i, 1)
            if (i == events.length) {
                break;
            }

        }
        const method = []
        method.push(events[i].main_score)
        method.push(events[i].main_tie_break)
        method.push(events[i].secondary_score)
        method.push(events[i].secondary_tie_break)
        scoringMethods.push(method)
    }


    for (var i = 0; i < scoreTables.length; i++) {

        setScores(scoreTables[i], scoringMethods[i])
    }

    return scoreTables

}


//makes the table from the events and the scores
function scoreTable(events, scoreTables) {
    const section = document.getElementById("table")
    const scores = document.createElement("div")
    scores.classList.add("scores")
    const table = document.createElement("table")
    scores.appendChild(table)
    table.className = "table-content"
    const row = document.createElement("tr")
    table.appendChild(row)
    const tbody = document.createElement("tbody")
    const athlete_name = document.createElement("th")
    const points = document.createElement("th")
    points.append("Points")
    athlete_name.append("Athlete Name")
    row.appendChild(athlete_name)
    row.appendChild(points)
    for (var i = 0; i < scoreTables.length; i++) {
        const event = document.createElement("th")
        event.append(events[i].event_name.replace(/_/g, " "))
        row.appendChild(event)
    }
    var count = 0
    if (scoreTables.length > 0) {
        count = scoreTables[0].length;
        for (var i = 0; i < count; i++) {
            const row1 = document.createElement("tr")
            const name1 = document.createElement("td")
            const points = document.createElement("td")
            row1.appendChild(name1)
            row1.appendChild(points)
            name1.append(scoreTables[0][i].athlete_name)
            let score = 0
            scoreTables.forEach(table => {
                const rank = document.createElement("td")
                row1.appendChild(rank)
                let main = table[i].main
                let tie_break = table[i].tie_break
                if (tie_break === null) tie_break = "";
                let secondary = table[i].secondary
                if (secondary === null) secondary = "";
                let tie_break_secondary = table[i].tie_break_secondary
                if (tie_break_secondary === null) tie_break_secondary = "";
                rank.append(`${table[i].rank} ( ${main} ${tie_break} ${secondary} ${tie_break_secondary} )`)
                score += Number(table[i].rank)

            })
            points.append(score)
            tbody.appendChild(row1)
        }
    }

    table.appendChild(tbody)
    section.appendChild(table)

}



// Getter for the competitions
async function getCompetitions() {
    try {
        const result = await fetch(`http://leaderboard-project.xyz/api/competitions`, { method: "GET" })
        const comps = await result.json();
        return comps
    } catch (error) {
        console.log(error)
    }
}





//Getter for the events
async function getEvents(comp_name) {
    try {
        const result = await fetch(`http://leaderboard-project.xyz/api/events/${comp_name}`, { method: "GET" })
        const events = await result.json();
        return events
    } catch (error) {
        console.log(error)
    }
}

//Getter for the scores data
async function getScores(event_name, comp_name) {
    try {
        const result = await fetch(`http://leaderboard-project.xyz/scores/competition/${comp_name}/event/${event_name}`, { method: "GET" })
        const scores = await result.json();
        return scores
    } catch (error) {
        console.log(error)
    }

}

//Method that sorts the columns
function sortTableByColumn(table, column, asc = true) {
    const dirModifier = asc ? 1 : -1;

    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll("tr"));

    // Sort each row
    if (column != 0) {
        const sortedRows = rows.sort((a, b) => {
            const aColText = a.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim();
            const bColText = b.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim();
            const asplit = Number(aColText.split(" ")[0])
            const bsplit = Number(bColText.split(" ")[0])
            return asplit > bsplit ? (1 * dirModifier) : (-1 * dirModifier);
        });
        // Remove all existing TRs from the table
        while (tBody.firstChild) {
            tBody.removeChild(tBody.firstChild);
        }

        // Re-add the newly sorted rows
        tBody.append(...sortedRows);

        // Remember how the column is currently sorted
        table.querySelectorAll("th").forEach(th => th.classList.remove("th-sort-asc", "th-sort-desc"));
        table.querySelector(`th:nth-child(${ column + 1})`).classList.toggle("th-sort-asc", asc);
        table.querySelector(`th:nth-child(${ column + 1})`).classList.toggle("th-sort-desc", !asc);
    } else {
        const sortedRows = rows.sort((a, b) => {
            const aColText = a.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim();
            const bColText = b.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim();
            return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
        });
        // Remove all existing TRs from the table
        while (tBody.firstChild) {
            tBody.removeChild(tBody.firstChild);
        }

        // Re-add the newly sorted rows
        tBody.append(...sortedRows);

        // Remember how the column is currently sorted
        table.querySelectorAll("th").forEach(th => th.classList.remove("th-sort-asc", "th-sort-desc"));
        table.querySelector(`th:nth-child(${ column + 1})`).classList.toggle("th-sort-asc", asc);
        table.querySelector(`th:nth-child(${ column + 1})`).classList.toggle("th-sort-desc", !asc);
    }



}










//method that ranks the athletes 
function setScores(scores, method) {

    GetSortOrder(scores, method)
    var rank = 1
    for (var i = 0; i < scores.length; i++) {
        if (!scores[i].hasOwnProperty('rank')) {
            scores[i].rank = rank
        }
        if (i < scores.length - 1) {
            if (scores[i].main === scores[i + 1].main && scores[i].tie_break === scores[i + 1].tie_break &&
                scores[i].secondary === scores[i + 1].secondary &&
                scores[i].tie_break_secondary === scores[i + 1].tie_break_secondary) {
                scores[i + 1].rank = scores[i].rank
            }
        }
        rank++
    }



}

//sorts the athletes based on the main-score tie-break etc..
//Not proud of how it looks
function GetSortOrder(array, method) {

    return array.sort(function(a, b) {
        if (method[0] === "COUNT ASC" || method[0] === "TIME ASC") {
            if (sortASC(a["main"], b["main"]) === 1) return 1;
            if (sortASC(a["main"], b["main"]) === -1) return -1;
            if (method[1] === null) return;
            if (method[1] === "COUNT ASC" || method[1] === "TIME ASC") {
                if (sortASC(a["tie_break"], b["tie_break"]) === 1) return 1;
                if (sortASC(a["tie_break"], b["tie_break"]) === -1) return -1;
                if (method[2] === null) return;
                if (method[2] === "COUNT ASC" || method[2] === "TIME ASC") {
                    if (sortASC(a["secondary"], b["secondary"]) === 1) return 1;
                    if (sortASC(a["secondary"], b["secondary"]) === -1) return -1;
                    if (method[3] === null) return;
                    if (method[3] === "COUNT ASC" || method[3] === "TIME ASC") {
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    } else {
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    }
                } else {
                    if (sortDESC(a["secondary"], b["secondary"]) === 1) return 1;
                    if (sortDESC(a["secondary"], b["secondary"]) === -1) return -1;
                    if (method[3] === null) return;
                    if (method[3] === "COUNT ASC" || method[3] === "TIME ASC") {
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    } else {
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    }
                }
            } else {
                if (sortDESC(a["tie_break"], b["tie_break"]) === 1) return 1;
                if (sortDESC(a["tie_break"], b["tie_break"]) === -1) return -1;
                if (method[2] === null) return;
                if (method[2] === "COUNT ASC" || method[2] === "TIME ASC") {
                    if (sortASC(a["secondary"], b["secondary"]) === 1) return 1;
                    if (sortASC(a["secondary"], b["secondary"]) === -1) return -1;
                    if (method[3] === null) return;
                    if (method[3] === "COUNT ASC" || method[3] === "TIME ASC") {
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    } else {
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    }
                } else {
                    if (sortDESC(a["secondary"], b["secondary"]) === 1) return 1;
                    if (sortDESC(a["secondary"], b["secondary"]) === -1) return -1;
                    if (method[3] === null) return;
                    if (method[3] === "COUNT ASC" || method[3] === "TIME ASC") {
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    } else {
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    }
                }
            }

        } else {
            if (sortDESC(a["main"], b["main"]) === 1) return 1;
            if (sortDESC(a["main"], b["main"]) === -1) return -1;
            if (method[1] === null) return;
            if (method[1] === "COUNT ASC" || method[1] === "TIME ASC") {
                if (sortASC(a["tie_break"], b["tie_break"]) === 1) return 1;
                if (sortASC(a["tie_break"], b["tie_break"]) === -1) return -1;
                if (method[2] === null) return;
                if (method[2] === "COUNT ASC" || method[2] === "TIME ASC") {
                    if (sortASC(a["secondary"], b["secondary"]) === 1) return 1;
                    if (sortASC(a["secondary"], b["secondary"]) === -1) return -1;

                    if (method[3] === null) return;
                    if (method[3] === "COUNT ASC" || method[3] === "TIME ASC") {
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    } else {
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    }
                } else {
                    if (sortDESC(a["secondary"], b["secondary"]) === 1) return 1;
                    if (sortDESC(a["secondary"], b["secondary"]) === -1) return -1;
                    if (method[3] === null) return;
                    if (method[3] === "COUNT ASC" || method[3] === "TIME ASC") {
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    } else {
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    }
                }
            } else {
                if (sortDESC(a["tie_break"], b["tie_break"]) === 1) return 1;
                if (sortDESC(a["tie_break"], b["tie_break"]) === -1) return -1;
                if (method[2] === null) return;
                if (method[2] === "COUNT ASC" || method[2] === "TIME ASC") {
                    if (sortASC(a["secondary"], b["secondary"]) === 1) return 1;
                    if (sortASC(a["secondary"], b["secondary"]) === -1) return -1;
                    if (method[3] === null) return;
                    if (method[3] === "COUNT ASC" || method[3] === "TIME ASC") {
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    } else {
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    }
                } else {
                    if (sortDESC(a["secondary"], b["secondary"]) === 1) return 1;
                    if (sortDESC(a["secondary"], b["secondary"]) === -1) return -1;
                    if (method[3] === null) return;
                    if (method[3] === "COUNT ASC" || method[3] === "TIME ASC") {
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortASC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    } else {
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === 1) return 1;
                        if (sortDESC(a["tie_break_secondary"], b["tie_break_secondary"]) === -1) return -1;
                    }
                }
            }


        }



    })
}

function sortASC(a, b) {
    if (a.includes(":")) {
        if (a > b) return 1
        if (a < b) return -1
    } else {
        if (Number(a) > Number(b)) return 1
        if (Number(a) < Number(b)) return -1
    }

}

function sortDESC(a, b) {
    return -sortASC(a, b)
}
