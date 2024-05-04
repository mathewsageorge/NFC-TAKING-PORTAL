const $status = document.getElementById("status");
const $log = document.getElementById("log");
const $teacher = document.getElementById("teacher");
const $period = document.getElementById("period");
const $subject = document.getElementById("subject");
const $recordInfo = document.getElementById("record-info");

const currentTime = () => {
    return new Date().toString().slice(0, -31);
};

let currentStatus = "in";

// This object will store the serial numbers that have been read
let readSerialNumbers = {};

let nfcTapCount = 0; // Initialize NFC tap counter

const updateNfcTapCount = () => {
    const $nfcTapCountDisplay = document.getElementById("nfc-tap-count");
    $nfcTapCountDisplay.textContent = `Total Present: ${nfcTapCount}`;
};

const handleNewRecord = async (serialNumber, logData, time, teacher, period, subject) => {
    if (readSerialNumbers[serialNumber]) {
        alert("This serial number has already been read!");
        return; // Stop further execution if serial number is already read
    } else {
        readSerialNumbers[serialNumber] = true;
    }
    try {
        await fetch('https://nfc-attendance-taking-portal.onrender.com/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                serialNumber,
                logData,
                time,
                teacher,
                period,
                subject,
            }),
        });
        updateRecordInfo(serialNumber, logData, time, teacher, period, subject);
        nfcTapCount++; // Increment NFC tap count
        updateNfcTapCount(); // Update the display with the new count
    } catch (error) {
        console.error('Failed to save record on the server:', error);
        alert('Failed to save record on the server.');
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const startClassBtn = document.getElementById("start-class-btn");
    if (startClassBtn) {
        startClassBtn.addEventListener("click", async () => {
            if (!$teacher.value) {
                alert("Please select a teacher before starting the class.");
                return; // Stop further execution if no teacher is selected
            }

            if (confirm("Are you sure you want to start the class for " + $subject.value + "?")) {
                try {
                    const response = await fetch('https://nfc-attendance-taking-portal.onrender.com/start-class', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            subject: $subject.value,
                            teacher: $teacher.value,
                            period: $period.value, // Make sure this is being captured
                            readSerialNumbers: readSerialNumbers // Include this in the body
                        }),
                    });
                    const result = await response.text();
                    alert(result);
                } catch (error) {
                    console.error('Error starting class:', error);
                    alert('Failed to start class.');
                }
            }
        });
    } else {
        console.error("Start Class button not found.");
    }

    // Create and append the NFC tap count display element
    const $nfcTapCountDisplay = document.createElement("div");
    $nfcTapCountDisplay.id = "nfc-tap-count";
    $nfcTapCountDisplay.style.marginTop = "10px";
    document.body.appendChild($nfcTapCountDisplay);
    updateNfcTapCount(); // Initial display update
});

function filterSubjects() {
    const teacherSelect = document.getElementById('teacher');
    const subjectSelect = document.getElementById('subject');
    const selectedTeacher = teacherSelect.value;

    // Define which subjects each teacher teaches
    const subjectsByTeacher = {
        'JINI': ['CGIPS6', 'DESIGNS4'], // Corrected teacher values and subjects
        'ANITHA': ['AADS6', 'OSS4'], // Example subjects for ANITHA MISS
        'NIMITHA': ['IEFTS6', 'COAS4'] // Example subjects for NIMITHA MISS
    };

    // Clear current subjects
    subjectSelect.innerHTML = '';

    // Check if a teacher is selected
    if (selectedTeacher) {
        // Get subjects for the selected teacher and create new options
        const subjects = subjectsByTeacher[selectedTeacher] || [];
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    } else {
        // If no teacher is selected, add a default 'Select Subject' option
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select Subject';
        subjectSelect.appendChild(defaultOption);
    }
}

if (!window.NDEFReader) {
    $status.innerHTML = "<h4>NFC Unsupported!</h4>";
}

const activateNFC = () => {
    const ndef = new NDEFReader();

    ndef.scan()
        .then(() => {
            $status.innerHTML = "<h4>Bring an NFC tag towards the back of your phone...</h4>";
        })
        .catch((err) => {
            console.log("Scan Error:", err);
            alert(err);
        });

    ndef.onreadingerror = (e) => {
        $status.innerHTML = "<h4>Read Error</h4>" + currentTime();
        console.log(e);
    };

    ndef.onreading = async(e) => {
        const time = currentTime();
        const { serialNumber } = e;
        const teacher = $teacher.value;
        const period = $period.value;
        const subject = $subject.value;
    
        if (!teacher) {
            alert("Please select a teacher before tapping the NFC tag.");
            $status.innerHTML = "<h4>Please select a teacher.</h4>";
            return; // Stop further execution if no teacher is selected
        }
    
        let textRecord = e.message.records.find(record => record.recordType === "text");
        let textContent = "";
        if (textRecord) {
            textContent = new TextDecoder().decode(textRecord.data);
        }
    
        $status.innerHTML = `<h4>Last Read</h4>${serialNumber}<br>${textContent}<br>${currentTime()}`;
        await handleNewRecord(serialNumber, currentStatus, time, teacher, period, subject);
        console.log(e);
    };
};

const updateRecordInfo = (serialNumber, logData, time, teacher, period, subject) => {
    $recordInfo.innerHTML = `
        <h4>Record Information:</h4>
        <p>Serial Number: ${serialNumber}</p>
        <p>Time: ${time}</p>
        <p>Teacher: ${teacher}</p>
        <p>Period: ${period}</p>
        <p>Subject: ${subject}</p>
    `;
};

document.getElementById("start-btn").onclick = (e) => {
    activateNFC();
};

document.getElementById("check-in").onchange = (e) => {
    e.target.checked && (currentStatus = "in");
};

document.getElementById("check-out").onchange = (e) => {
    e.target.checked && (currentStatus = "out");
};

$subject.addEventListener("change", (e) => {
    updateRecordInfo(
        "", 
        currentStatus,
        currentTime(),
        $teacher.value,
        $period.value,
        e.target.value
    );
});
