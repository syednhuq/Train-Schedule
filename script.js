// Reference to firebase
var database = firebase.database(),

// Setting initial variables
name = "",
trainName = "",
destination = "",
time = "",
frequency = "",
nextTrain = "",
minutesAway = "";

// Onclick - submit
$("#submit").on("click", function(event) {
  event.preventDefault();
  computeValues();
});

	function computeValues() {
	// Function to capture values from text boxes
	trainName = $("#trainName").val().trim();
	destination = $("#destination").val().trim();
	time = $("#time").val().trim();
	frequency = $("#frequency").val().trim();
	
	// Add preceding '0' if ':' is at indexOf(1)
	if (time.match(/\D/).index === 1) { 
		time = "0" + time;
	}

	// Format current time
	var currentTime = moment().format("YYYY-MM-DD HH:mm"),
	// Convert time entered to match current time format
	convertedTime = moment().format("YYYY-MM-DD") + " " + time;

	// Set variable with next train time and correct for midnight
	function nextTrainTime() {
		nextTrain = moment(convertedTime).format("HH:mm A");
		if (nextTrain === "00:00 AM") {
			nextTrain = "12:00 AM";
		}
	}

	// Calculate next arrival
	if (convertedTime > currentTime) {
		nextTrain = time;
		minutesAway = moment(convertedTime).diff(moment(currentTime), "minutes");
		nextTrainTime();
	}
	else {
		while (convertedTime < currentTime) {
			// Increment start time by frequency
			var incrementTime = moment(convertedTime).add(frequency, "minutes"),
			// Capture matching '_d' retult and format
			newTime = moment(incrementTime._d).format("YYYY-MM-DD HH:mm");
			// Change converted time to new incremented time
			convertedTime = newTime;
		}
		nextTrainTime();
		// Set variable with difference of next train and current time
		minutesAway = moment(convertedTime).diff(moment(currentTime), "minutes");
	}
	
	// Convert minutesAway to hour:minute format
	if (minutesAway > 60) {
	// Add hours
		if (minutesAway%60 === 0) { 
			minutesAway = Math.floor(minutesAway/60) + " hours"
		}
		else {
			minutesAway = Math.floor(minutesAway/60) + "h " + minutesAway%60 + "m";
		}
	}

	// Add minutes
	else { 
		minutesAway = minutesAway + " minutes";
	}

	// Convert frequency to hour:minute format
	if (frequency > 60) {
	// Add hours
		if (frequency%60 === 0) { 
			frequency = Math.floor(frequency/60) + " hours"
		}
		else {
			frequency = Math.floor(frequency/60) + "h " + frequency%60 + "m";
		}
	}
	// Add minutes
	else { 
		frequency = frequency + " minutes";
	}

	// Convert military time to standard time before output
	var hourConv = Math.abs(nextTrain.substr(0, 2));
	if (hourConv > 12) {
		hourConv = hourConv - 12;
		nextTrain = hourConv + nextTrain.substr(2);
	}

	// Push to database
	database.ref().push({
		trainName: trainName,
		destination: destination,
		frequency: frequency,
		nextTrain: nextTrain,
		minutesAway: minutesAway
	});
} 

// Revise existing content with new data
$("#revise").on("click", function(event) {
// Save train name entered value
	trainName = $("#trainName").val().trim(); 
  	var ref = firebase.database().ref().orderByKey();
	ref.once("value").then(function(snapshot) {
	    snapshot.forEach(function(childSnapshot) {
	    // Save train name database values
	    	var childData = childSnapshot.val().trainName; 
	    	// When entered value matches firebase value
			if (trainName === childData) { 
			// Remove the entire object
				childSnapshot.ref.remove(); 
				// Run to create new data
				computeValues(); 
			}
	  	});
	});
});

// Delete a single object from the database based on train name
$("#delete").on("click", function(event) {
// Save train name entered value
  	trainName = $("#trainName").val().trim(); 
   	var ref = firebase.database().ref().orderByKey();
	ref.once("value").then(function(snapshot) {
	    snapshot.forEach(function(childSnapshot) {
	    // Save train name database values
	     	var childData = childSnapshot.val().trainName; 
	     	// Entered value matches firebase value 
			if (trainName === childData) { 
			// Remove the entire object
				childSnapshot.ref.remove(); 
			}
	  	});
	});
});

// Clear database completely
$("#clear").on("click", function(event) {
// Save the database root
	var rootRef = firebase.database().ref(); 
	// Remove all database contents
	rootRef.remove(); 
});

// Display current values (requires 'type="submit"' on html buttons for real time updating)
database.ref().on("child_added", function(childSnapshot) {
	//Append lastest results
	$("#trainSchedule").append("<tr>" +
	"<td>" + childSnapshot.val().trainName + "</td>" +
	"<td>" + childSnapshot.val().destination + "</td>" +
	"<td>" + childSnapshot.val().frequency + "</td>" +
	"<td>" + childSnapshot.val().nextTrain + "</td>" +
	"<td>" + childSnapshot.val().minutesAway + "</td>" +
	"</tr>"
	);

	// Clear variables
	nextTrain = "";
	minutesAway = "";

// Error function
}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
});