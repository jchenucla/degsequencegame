document.getElementById('start-btn').addEventListener('click', function() {
    const degreeSequenceInput = "4,3,3,2,1";
    const degreeSequence = degreeSequenceInput.split(',').map(Number);
    generateGraph(degreeSequence);
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

function generateGraph(degreeSequence) {
    const width = 800;
    const height = 400;

    const svg = d3.select("#graph-container")
        .html("") // Clear previous graph
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    nodes = degreeSequence.map((degree, index) => ({
        id: index,
        degree: degree,
        originalDegree: degree, // Keep the original degree for display
        connections: 0 // Track the number of connections
    }));

    links = [];

    const simulation = d3.forceSimulation(nodes)
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
        .on("click", onNodeClick)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("dy", 4)
        .attr("text-anchor", "middle")
        .text(d => d.originalDegree);

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
            if (selectedNode.connections < selectedNode.originalDegree && d.connections < d.originalDegree) {
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
                alert("One of the nodes has reached its maximum connections.");
                selectedNode = null;
                d3.selectAll("circle").attr("fill", "#4CAF50");
            }
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

function checkDegreeSequence() {
    const message = document.getElementById('message');
    const allCorrect = nodes.every(node => node.connections === node.originalDegree);

    if (allCorrect) {
        message.textContent = "Degree sequence is completed.";
        message.style.color = "green";
    } else {
        message.textContent = "Degree sequence is not completed. Please check the connections.";
        message.style.color = "red";
    }
}
