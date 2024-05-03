$(document).ready(function () {

    $("#logoutBtn").on("click", function () {
        $.ajax({
            url: "/logout",
            type: "POST",
            success: function (res) {
                window.location.href = "/login"
            }
        })
    })
    
    const timerSession = JSON.parse(localStorage.getItem('timerSession'));
    if (timerSession) {
        const { startTime, remainingTime } = timerSession;
        const elapsedTime = Math.floor((new Date() - new Date(startTime)) / 1000);
        const updatedRemainingTime = Math.max(remainingTime - elapsedTime, 0);
        
        // Start the timer with the updated remaining time
        if (updatedRemainingTime > 0) {
            startTimer(updatedRemainingTime);
        } else {
            localStorage.removeItem("timerSession") // Clear timer session if time has elapsed
            // clearTimerSession(); 
        }
    }

    let timeInterval
    $("#shareVerificationBtn").on("click", function (e) {
        e.preventDefault()
        let emailId = $("#email_id").val()
        // alert()
        $("#showTimer").hide()
        $(this).prop("disabled", true)
        
        $.ajax({
            url: "/share-verification-link",
            type: "POST",
            data: { emailId },
            success: function (res) {
                console.log(res.data)
                if (res.data.accepted.length >= 1) {
                    startTimer(20) // 120 seconds = 2 minutes
                }
            }
        })
    })


})
    function startTimer(remainingTime) {
        const showTimer = $('#showTimer');
        const resendButton = $('#shareVerificationBtn');

        // Show the timer
        showTimer.show();

        // Start the timer
        const timerInterval = setInterval(() => {
            if (remainingTime <= 0) {
                // Stop the timer
                clearInterval(timerInterval);

                // Enable the resend button
                resendButton.prop('disabled', false);

                // Reset the timer display
                showTimer.hide();

                localStorage.removeItem('timerSession')
            } else {
                // Display remaining time
                updateTimerDisplay(remainingTime)


                // Decrease remaining time
                remainingTime--;
                const startTime = new Date().toISOString()
                localStorage.setItem('timerSession', JSON.stringify({ startTime, remainingTime }))
            }
        }, 1000); // Update every second
    }

    function updateTimerDisplay(remainingTime) {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        $('#showTimer').text(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }

    
