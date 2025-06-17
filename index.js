// modal
var modal = document.getElementById("instruction");

// get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// open the modal
document.getElementById('how-to-play-btn').onclick = function() {
  modal.style.display = "block";
}

// close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// when user clicks anywhere outside of the modal, close modal
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Degree Sequence stuff

const degreeSequenceInput = "1,2,3,2";
let degreeSequence = degreeSequenceInput.split(',').map(Number);
let started = false;

// set timer to 60 seconds
localStorage.setItem('timer', 60);

let countdownInterval; 
let timeRemaining =  localStorage.getItem('timer');; 

window.onload = function() {
    let storedTime = parseInt(localStorage.getItem('timer'));
    timeRemaining = (isNaN(storedTime) || storedTime <= 0) ? 60 : storedTime;

    const timerElement = document.getElementById("timer");

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

   function startCountdown() {
        timerElement.textContent = formatTime(timeRemaining); // display

        countdownInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                localStorage.setItem('timer', timeRemaining); // update storage, but it'll preserve the time when left the page
                timerElement.textContent = formatTime(timeRemaining);
            } else {
                clearInterval(countdownInterval);
                localStorage.setItem('timeout', 'true');
                window.location.href = `result.html`;
            }
        }, 1000);
    }

    startCountdown();
    generateGraph(degreeSequence);
    revealAllNodes();
    label.style("visibility", "visible");
};

document.getElementById('check-btn').addEventListener('click', function() {
    checkDegreeSequence();
});

let selectedNode = null;
let link;
let node;
let label;
let nodes = [];
let links = [];
let simulation;

document.getElementById('undo-btn').addEventListener('click', function() {
    if (links.length > 0) {
        const lastLink = links.pop();

        lastLink.source.connections--;
        lastLink.target.connections--;

        link = link.data(links, d => `${d.source.id}-${d.target.id}`);

        // remove old links
        link.exit().remove();

        const linkEnter = link.enter().append("line")
            .attr("stroke", "#000")
            .attr("stroke-width", 2);

        link = linkEnter.merge(link);

        simulation.force("link").links(links);
        simulation.alpha(1).restart();

    } else {
        alert("No more!!");
    }
});


function generateGraph(initialDegreeSequence) {
    const width = 800;
    const height = 400;

    const svg = d3.select("#graph-container")
        .html("") // Clear previous graph
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    nodes = initialDegreeSequence.map((degree, index) => ({
        id: index,
        degree: degree,
        originalDegree: degree, // keep the original degree for display
        connections: 0, // track the number of connections
        x: width / 2,
        y: height / 2
    }));

    links = [];

    simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(0.1))
        .force("y", d3.forceY(height / 2).strength(0.1))
        .force("collide", d3.forceCollide(25)) // prevent nodes from overlapping
        .on("tick", ticked);

    link = svg.append("g")
        .attr("class", "links")
        .selectAll("line");

    node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 20)
        .attr("fill", "#4CAF50")
        .style("visibility", "hidden") // hide all nodes initially
        .on("click", onNodeClick)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


//number showing on the nodes.
    label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("dy", 4)
        .attr("text-anchor", "middle")
        .text(d => d.connections)  // initial text shows current connections
        .style("pointer-events", "none"); // so clicks pass through labels



    function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    label
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .text(d => d.connections);  // update label text dynamically
}


    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function onNodeClick(event, d) {
        if (selectedNode === null) {
            selectedNode = d;
            d3.select(this).attr("fill", "#FF0000"); // Highlight selected node
        } else if (selectedNode === d) {
            selectedNode = null;
            d3.select(this).attr("fill", "#4CAF50"); // Unselect the node
        } else {
            // Check if link already exists
            const linkExists = links.some(link => 
                (link.source === selectedNode && link.target === d) ||
                (link.source === d && link.target === selectedNode)
            );

            if (!linkExists) {
                // Create a link between selectedNode and clicked node
                links.push({ source: selectedNode, target: d });
                selectedNode.connections++;
                d.connections++;
                selectedNode = null;

                // Update the visualization
                updateLinks();

                simulation.force("link").links(links);
                simulation.alpha(1).restart();

                // Reset node colors
                d3.selectAll("circle").attr("fill", "#4CAF50");
            } else {
                alert("These two nodes are already connected.");
                selectedNode = null;
                d3.selectAll("circle").attr("fill", "#4CAF50");
            }
        }
    }

    function updateLinks() {
        console.log("Updating links, current links length:", links.length);
    
        link = link.data(links, d => `${d.source.id}-${d.target.id}`);
        link.exit().remove();

        let enter = link.enter().append("line")
            .attr("stroke", "#000")
            .attr("stroke-width", 2);

        link = enter.merge(link);

        console.log("Number of lines in DOM after update:", document.querySelectorAll(".links line").length);
    }   


    simulation.on("tick", () => {
        nodes.forEach(d => {
            d.x = Math.max(20, Math.min(width - 20, d.x));
            d.y = Math.max(20, Math.min(height - 20, d.y));
        });

        ticked();
    });

    updateLinks(); // Initialize link update to draw initial state
}


function revealAllNodes() {
    node.style("visibility", "visible");  // Make all nodes visible
    label.style("visibility", "visible");  // Make all labels visible
}

/*
//not used function
//reveal a node one by one.
function revealNode(index) {
    node.filter((d, i) => i === index)
        .style("visibility", "visible");

    label.filter((d, i) => i === index)
        .style("visibility", "visible");

    // Change the text on the add-node button after the last node is revealed
    if (index === degreeSequence.length - 1) {
        document.getElementById('add-node-btn').textContent = "No More Node";
    }
}
*/

function checkDegreeSequence() {
    const message = document.getElementById('message');
    const nodeDegrees = nodes.map(n => n.connections).sort();
    const expectedDegrees = degreeSequence.slice().sort(); // Sort to compare unordered sequences

    const allCorrect = JSON.stringify(nodeDegrees) === JSON.stringify(expectedDegrees);
    
    if (allCorrect) {
        message.textContent = "Correct!";
        message.style.color = "green";

        // Stop the timer if the user is correct
        clearInterval(countdownInterval);

        // Calculate points based on remaining time
        const points = timeRemaining * 10;  // Each second left gives 10 points (adjust scoring as needed)

        // Store the points in localStorage and clear the timeout flag
        localStorage.setItem('points', points);
        localStorage.setItem('timeout', 'false');  // No timeout

        // Redirect to result page
        window.location.href = `result.html`;
    } else {
        message.textContent = "Try Again!";
        message.style.color = "red";
    }
}


function resetGraph() {
    d3.select("#graph-container").html("");
    nodes = [];
    links = [];
    currentNodeIndex = 0;
    selectedNode = null;
    started = false;
}
