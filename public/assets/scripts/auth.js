$(document).ready(function () {
    $("#registrationForm").on("submit", function (event) {
        event.preventDefault()
        $(".validation-error").empty()
        let formData = $(this).serializeArray()
        $.ajax({
            url: "/registration",
            type: "POST",
            data: formData,
            success: function (res) {
                alert(res.message)
                // $(this).trigger("reset")
                window.location.href = "/login"
            },
            error: function (xhr, status, error) {
                var response = xhr.responseJSON.errors

                if (response && Object.keys(response).length > 0) {
                    response.forEach(error => {

                        for (const key in error) {
                            $(`.error-${key}`).append(`<li>${error[key]}</li>`)
                            $(`.error-${key}`).attr("style", "display: block !important")
                            $(`#${key}`).css("border-color", "red")

                            setTimeout(() => {
                                $(`#${key}`).css("border-color", "")
                                $(`.error-${key}`).css("display", "")
                                $(`.error-${key}`).empty()
                            }, 10000)
                        }
                    })
                }
            }
        })
    })

    $("#loginForm").on("submit", function (event) {
        event.preventDefault()
        $(".validation-error").empty()
        var formData = $(this).serializeArray()

        $.ajax({
            url: "/authentication",
            type: "POST",
            data: formData,
            success: function (res) {
                window.location.href = "/dashboard"
            },
            error: function (xhr, status, error) {
                const response = xhr.responseJSON.errors
                if (response && Object.keys(response).length > 0) {
                    response.forEach(error => {
                        for (const index in error) {
                            $(`.error-${index}`).append(`<li >${error[index]}</li>`)
                            $(`.error-${index}`).attr("style", "display: block !important")
                            $(`#${index}`).css("border-color", "red")
                            
                            setTimeout(() => {
                                $(`#${index}`).css("border-color", "")
                                $(`.error-${index}`).css("display", "")
                                $(`.error-${index}`).empty()
                            }, 10000)
                        }
                    })
                }

            }
        });
    })
})