
// Modal
var modal = document.getElementById("instruction");
var btn = document.getElementById("how-to-play-btn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


const degreeSequenceInput = "1,2,3,2";
let degreeSequence = degreeSequenceInput.split(',').map(Number);
let started = false;
let currentNodeIndex = 0; // Start with the first node

document.getElementById('start-btn').addEventListener('click', function() {
    if (!started) {
        started = true;
        this.textContent = "Clear";
        generateGraph(degreeSequence); // Show all nodes initially as hidden
        revealAllNodes(); // Show all nodes at once
    } else {
        // Reset the graph
        resetGraph();
        generateGraph(degreeSequence); // Regenerate the graph
    }
});

document.getElementById('next-btn').addEventListener('click', function() {
    if (started && currentNodeIndex < degreeSequence.length) {
        revealNode(currentNodeIndex);
        currentNodeIndex++;
    }
});

document.getElementById('done-btn').addEventListener('click', function() {
    checkDegreeSequence();
});

let selectedNode = null;
let link;
let node;
let label;
let nodes = [];
let links = [];
let simulation;

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
        originalDegree: degree, // Keep the original degree for display
        connections: 0, // Track the number of connections
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
        .force("collide", d3.forceCollide(25)) // Prevent nodes from overlapping
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
        .style("visibility", "hidden") // Hide all nodes initially
        .on("click", onNodeClick)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
/*
//number showing on the nodes.
    label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("dy", 4)
        .attr("text-anchor", "middle")
        .text(d => d.originalDegree)
        .style("visibility", "hidden"); // Hide all labels initially
*/

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
            .attr("y", d => d.y);
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

            if ( /*selectedNode.connections < selectedNode.originalDegree && d.connections < d.originalDegree && */ !linkExists) {
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
            } else if (linkExists) {
                alert("These two nodes are already connected.");
                selectedNode = null;
                d3.selectAll("circle").attr("fill", "#4CAF50");
            } /*else {
                alert("One of the nodes has reached its maximum connections.");
                selectedNode = null;
                d3.selectAll("circle").attr("fill", "#4CAF50");
            }
            */
        }
    }

    function updateLinks() {
        link = link.data(links);
        link.exit().remove();
        link = link.enter().append("line").merge(link)
            .attr("stroke", "#000")
            .attr("stroke-width", 2);
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
    document.getElementById('start-btn').textContent = "Start";
    document.getElementById('add-node-btn').textContent = "Next Node"; // Reset the add-node button text
}