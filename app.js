const http = require('http');
const url = require('url');

const availableTimes = {
    Monday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Tuesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Wednesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "4:00", "4:30"],
    Thursday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Friday: ["1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
};

const appointments = [
    {name: "James", day: "Wednesday", time: "3:30" },
    {name: "Lillie", day: "Friday", time: "1:00" }
];

let serverObj = http.createServer(function(req, res) {
       console.log(req.url);
        let urlObj = url.parse(req.url,true);

            switch (urlObj.pathname) {
                   case  "/schedule":
			if (hasRequiredParams(urlObj.query, ['name', 'day', 'time'])) {
                             schedule(urlObj.query,res);
			} else {
				error(res, 400, "Missing required parameters: name, day, time");
			}
                          break;

                    case "/cancel":
			if (hasRequiredParams(urlObj.query, ['name', 'day', 'time'])) {
                            cancel(urlObj.query,res);
				} else {
				    error(res, 400, "Missing required parameters: name, day, time");
				}
                              break;

		    case "/check":
			if (hasRequiredParams(urlObj.query, ['day', 'time'])) {
			    checkAvailability(urlObj.query, res);
			} else {
			   error(res, 400, "Missing required parameters: day, time");
			}
			break;
                   default:
                            error(res, 404 , "Pathname unknown");

       }

 /*            
          if (urlObj.pathname == "/schedule")
                schedule();
           else if (urlObj.pathname == "/cancel")
                 cancel();
             else
                 error();*/
            }
});

function hasRequiredParams(query, requiredParams) {
	for (let param of requiredParams) {
	     if (!query[param]) {
		return false;
		}
	}
	return true;
}

function sendResponse(res, status, message) {
	res.writeHead(status, {'Content-Type': 'text/plain'});
	res.write(message);
	res.end();
}
function schedule(qObj,res) {
	const {name, day, time} = qObj;

	if (!availableTimes[day]) {
		error(res, 400, "Invalid day");
		return;
	}

	if (availableTimes[day].includes(time)) {
		availableTimes[day] = availableTimes[day].filter(t => t !== time);

		appointments.push({name, day, time});

		sendResponse(res, 200, "Appointment scheduled successfully");
	} else {
		error(res, 400, "Time slot not available");
	}
     }

      /* if (availableTimes[qObj.day].some(function(time)
                     {if time  == qObj.time
                        return true;
                     else 
                        return false;
                      }))*/

	function cancel(qObj, res) {
		const {name, day, time} = qObj;

		const appointmentIndex = appointments.findIndex(appt =>
			appt.name === name && appt.day === day && appt.time ===time
		};

		if (appointmentIndex !== -1) {
			appointments.splice(appointmentIndex, 1);

		if (availableTimes[day]) {
		    availableTimes[day].push(time);
		    availableTimes[day].sort();
	}

	sendResponse(res, 200, "Appointment has been canceled");
   } else {
		error(res, 400, "Appointment not found");
	}
}

function checkAvailability(qObj, res) {
    const {day, time} = qObj;

	if (!availableTimes[day]) {
	    error(res, 400, "Invalid day");
	    return;
	}

	if (availableTimes[day].includes(time)) {
		sendResponse(res, 200, "Time slot is available");
	} else {
		sendResponse(res, 200, "Time slot is not available");
	}
}

function error(res, status, message) {
	sendResponse(res, status, 'Error: ${message}');
}




serverObj.listen(80,function(){
         console.log("listening on port 80");
});
