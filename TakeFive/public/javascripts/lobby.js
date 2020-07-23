function create(create) {
    document.getElementById('pname').style.display = "block";
    if (!create) {
        document.getElementById('gcode').style.display = "block";
        document.getElementById('createButton').style.display = "none";
        document.getElementById('joinButton').onclick = function() {console.log('JOIN');};
    } else {
        document.getElementById('joinButton').style.display = "none";
        document.getElementById('createButton').onclick = function() {console.log('CREATE');};
    }
    document.getElementById('backButton').style.display = "block";
}

function back() {
    // Hide inputs and back button
    document.getElementById('pname').style.display = "none";
    document.getElementById('gcode').style.display = "none";
    document.getElementById('backButton').style.display = "none";
    // Restore button functionality
    document.getElementById('joinButton').onclick = function() {create(false);};
    document.getElementById('createButton').onclick = function() {create(true);};
    // Show both buttons again
    document.getElementById('joinButton').style.display = "block";
    document.getElementById('createButton').style.display = "block";
}