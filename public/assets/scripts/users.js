$(document).ready(function () {

    socket.on("getOnlineStatus", data => {
        $(`#${data.currentUserId}-status`).removeClass("offline")
        $(`#${data.currentUserId}-status`).addClass("online")
        $(`#${data.currentUserId}-status`).attr("title", "Online")
        $(`#${data.currentUserId}-status-text`).text("Online")
        $(`.${data.currentUserId}-user-status`).text("Online")
    })

    socket.on("getOfflineStatus", data => {
        $(`#${data.currentUserId}-status`).removeClass("online")
        $(`#${data.currentUserId}-status`).addClass("offline")
        $(`#${data.currentUserId}-status`).attr("title", "Offline")
        $(`#${data.currentUserId}-status-text`).text("Offline")
        $(`.${data.currentUserId}-user-status`).text("Offline")

    })

    //Catch an event to load chat history
    socket.on("user:loadChatHistory", data => {
        $(".chat-messages").html("")
        let chats = data.chatHistory
        let addClass, contentClass, person
        chats.forEach(chat => {
            if (chat.sender_id._id == senderId) {
                addClass = "chat-message-right"
                contentClass = "message-content"
                person = "Me"
            } else {
                addClass = "chat-message-left"
                contentClass = "message-content-left"
                person = "You"
            }
            let sharedImg = (chat.image && chat.image.length > 0) ? `<img src="${chat.image}" class="shared-image">` : ''
            let html = `<li class="${addClass}">
                            <div style="text-align: center;">
                                <img src="${chat.sender_id.avatar}" class="rounded-circle mr-1" width="40" height="40">
                                <div class="text-muted small text-nowrap mt-2 message-data-time" style="color: #8e8e8e;">${moment(chat.createdAt).format("HH:mm a")}</div>
                            </div>
                            <div class="${contentClass}">
                                ${sharedImg}
                                <div class="message-text">${chat.message}</div>
                                <div class="message-data">
                                    <span class="message-data-time">${moment(chat.createdAt).format("MMM Do")} | </span>
                                    <span class="message-data-time">${person}</span>
                                </div>
                            </div>
                        </li>`
            $(".chat-messages").append(html)
            scrollDownChat()
        })
    })

    //Catch an event for showing to receiver chat message
    socket.on("user:showSendMessage", chat => {
        console.log(chat.data.messageInfo, 123)
        let message = chat.data.messageInfo.msg
        let senderInfo = chat.data.messageInfo.senderInfo
        if (message.receiver_id == senderId) {
            let contentClass = (message.sender_id != senderId) ? "message-content-left" : ""
            let sharedImg = (message.image && message.image.length > 0) ? `<img src="${message.image}" class="shared-image">` : ''

            let html = `<div class="chat-message-left pb-4">
                            <div style="text-align: center;">
                                <img src="${senderInfo.avatar}" class="rounded-circle mr-1" width="40" height="40">
                                <div class="text-muted small text-nowrap mt-2 message-data-time" style="color: #8e8e8e;">${moment(message.createdAt).format("HH:mm a")}</div>
                            </div>
                            <div class="${contentClass}">
                                ${sharedImg}
                                <div class="message-text">${message.message}</div>
                                <div class="message-data">
                                    <span class="message-data-time">${moment(message.createdAt).format("MMM Do")} | </span>
                                    <span class="message-data-time">Me</span>
                                </div>
                            </div>
                        </li>`
            $(".chat-messages").append(html)
            //Re-Order users on user list
            showUsers(senderId)
            scrollDownChat()
        }
    })

    //Trigger event when user is typing
    $("#message").on('input', function () {
        socket.emit("chat:userTypingStatus", { isTyping: true, user: senderId })
        // typingTimeout = setTimeout(() => {

        // })
    })

    //listen and show other user, that other user is typing
    socket.on("chat:showTypingStatus", function (data) {
        console.log(socket.id, '000000')
        // if(data.isTyping){
        //     $("#userStatus").text("Typing...")
        // } else {
        //     $("#userStatus").text("")
        // }
    })

    //Toggle Emoji Popup
    $("#emojiButton").on('click', function (event) {
        event.stopPropagation()
        $("#emojiPicker").toggle("display")
    })

    //Enable send button if input field is not empty
    $(".sendMessageField").on("input", function () {
        let inputMsg = $(this).val()
        checkInputField(inputMsg)
    })

    // Handle emoji selection
    $('#emojiPicker').on('emoji-click', function (event) {
        // Get the selected emoji
        var emoji = event.detail.unicode;
        // $("#emojiPicker").hide()
        $('.sendMessageField').val($('.sendMessageField').val() + emoji)
        let inputMsg = $(".sendMessageField").val()
        checkInputField(inputMsg)
    });

    //Check if input field is empty or not and remove white space from string.
    const checkInputField = inputObj => {
        let messageObj = inputObj.replace(/\s/g, '')
        messageObj.length > 0 ? $(".sendMessageBtn").show() : $(".sendMessageBtn").hide()
    }




    //Convert image to Base64 Encoded string, after selecting photo to share.
    let sharedBase64Image
    let imageObj
    $("#shareImage").on("change", function (eventImg) {
        let reader
        imageObj = this.files[0]
        maxSize = 1024 * 1024
        if (imageObj) {
            if (!imageObj.type.startsWith("image")) {
                alert("Please upload valid image.")
                imageObj = undefined
                return
            }

            if (maxSize < imageObj.size) {
                alert("Please upload smaller image.")
                imageObj = undefined
                return
            }

            reader = new FileReader()
            reader.onload = event => {
                sharedBase64Image = event.target.result
                // console.log(55, sharedBase64Image)
                $('#imagePreview').attr('src', sharedBase64Image);
            }
        }

        reader.readAsDataURL(imageObj)
        $(".chat-messages").show("style", "display: flex !important;")
        $(".media-wrapper").attr("style", "display: flex !important;")
        $(".sendMessageBtn").show()
        $(".chat-messages").hide()
        $("#mediaMenuPopup").hide()
        $(".close-button").show()

    })

    //Reset image preview
    $(".close-button").on("click", function () {
        imageObj = undefined
        $(".chat-messages").show()
        $(".close-button").hide()
        $(".media-wrapper").hide()
    })

    //Send message to user.
    //Store image & documents.
    $("#sendMessageForm").submit(function (event) {
        event.preventDefault()
        let message = $("#message").val()
        let receiver_id = $("#message").attr("receiver-id")
        $("#emojiPicker").hide()
        // let image = $("#shareImage").files;
        $.ajax({
            url: "/send/message",
            type: "POST",
            data: { senderId, message, receiver_id, sharedBase64Image },
            success: function (res) {
                if (res.success) {
                    $("#sendMessageForm").trigger("reset")
                    imageObj = undefined
                    $(".chat-messages").show()
                    $(".close-button").hide()
                    $(".media-wrapper").hide()
                    let chat = res.userMsg
                    console.log(chat, 123)
                    let sharedImg = (chat.msg.image && chat.msg.image.length > 0) ? `<img src="${chat.msg.image}" class="shared-image">` : ''
                    let html = `<div class="chat-message-right pb-4">
                            <div style="text-align: center;">
                                <img src="${chat.senderInfo.avatar}" class="rounded-circle mr-1" width="40" height="40">
                                <div class="text-muted small text-nowrap mt-2 message-data-time" style="color: #8e8e8e;">${moment(chat.msg.createdAt).format("HH:mm a")}</div>
                            </div>
                            <div class="message-content">
                                ${sharedImg}
                                <div class="message-text">${chat.msg.message}</div>
                                <div class="message-data">
                                    <span class="message-data-time">${moment(chat.msg.createdAt).format("MMM Do")} | </span>
                                    <span class="message-data-time">Me</span>
                                </div>
                            </div>
                        </div>`
                    $(".chat-messages").append(html)
                    scrollDownChat()
                    //Re-Order users on user list
                    showUsers(senderId)

                    //Through an event to send message
                    let messageInfo = chat
                    socket.emit("user:sendMessage", { messageInfo })
                } else {
                    alert(res.message)
                }
            }
        })
    })



    //Prevent form from beign submit after button click for modal
    $("#uploadAvatarBtn").on("click", function (event) {
        event.preventDefault()
    })

    // Initialize cropper outside the change event handler
    let cropper;

    $("#uploadAvatar").on("change", function (event) {
        //reset cropper before selecting another image.
        (cropper) ? cropper.destroy() : ""
        var input = event.target
        let avatarError = $(`.error-crop-avatar`)
        let uploadAvatar = $(`#uploadAvatar`)
        const inputFile = $(this)[0].files[0]
        const maxSize = 1 * 1024 * 1024; // 1mb
        if (inputFile) {
            if (!inputFile.type.startsWith("image/")) {
                avatarError.append(`<li>Please select valid image</li>`)
                avatarError.attr("style", "display: block !important")
                uploadAvatar.css("border-color", "red")
                input.value = "";

                setTimeout(() => {
                    avatarError.empty()
                    uploadAvatar.css("border-color", "")
                }, 10000)

                return
            }

            if (maxSize < inputFile.size) {
                // alert('Please select smaller image than 1mb')
                avatarError.append(`<li>Please select smaller image than 1MB</li>`)
                avatarError.attr("style", "display: block !important")
                uploadAvatar.css("border-color", "red")
                input.value = "";

                setTimeout(() => {
                    avatarError.empty()
                    uploadAvatar.css("border-color", "")
                }, 10000)
                return
            }

            let cropAvatar = $("#cropAvatar")[0];
            cropper = new Cropper(cropAvatar, {
                aspectRatio: 1,
                viewMode: 3,
                preview: '.preview',
                crop(event) {
                    let croppedData = {
                        x: event.detail.x,
                        y: event.detail.y,
                        width: event.detail.width,
                        height: event.detail.height,
                        rotate: event.detail.rotate,
                        scaleX: event.detail.scaleX,
                        scaleY: event.detail.scaleY,
                    };
                    // console.log(croppedData);
                },
            });

            var image;
            const imageObj = this.files;
            var imageExt = imageObj[0].name.split(".").pop()
            $("#avatar_extension").val(imageExt)
            $("#avatar_name").val(imageObj[0].name)

            if (imageObj && imageObj.length) {
                image = imageObj[0];
            }

            if (/^image\/\w+/.test(image.type)) {
                let reader = new FileReader();
                reader.readAsDataURL(image);
                reader.onload = () => {
                    cropper.replace(reader.result);
                };
            }
        }
    });

    //Close Modal and fetch base64 string of image to form
    $("#cropAvatarForm").submit(function (event) {
        event.preventDefault()
        $("#imageCropperModal").modal("hide")
        $("#avatar").val(useCroppedData)
        $("#userAvatar").prop("src", useCroppedData)
        $("#cropAvatarForm").trigger("reset")
    })

    // function to use cropped data
    function useCroppedData() {
        if (cropper) {
            let croppedCanvas = cropper.getCroppedCanvas();

            let croppedDataURL = croppedCanvas.toDataURL("image/jpeg")
            return croppedDataURL;
        }
    }

    //Update user profile
    $("#updateUserProfile").submit(function (event) {
        event.preventDefault()
        $(".validation-error").empty()
        const formData = $(this).serializeArray();
        $.ajax({
            url: "/profile",
            type: "POST",
            data: formData,
            success: function (res) {
                $("#avatar_extension").val("")
                $("#avatar_name").val("")
                let errors = res.error

                if (errors != undefined) {
                    errors.forEach(error => {
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
                } else {
                    alert("Profile has been updated.")
                    let avatar = res.profile.avatar
                    resetAvatarModal()
                    $("#avatar").val("")
                    $("#userAvatar").attr("src", avatar)
                    $("#aboutAvatar").attr("src", avatar)
                    $("#avatarThumbnail").attr("src", avatar)
                }
            },
            error: function (xhr, status, error) {
                console.log("Error", error)
            }
        });
    })

    //Reset form after closing modal with close button.
    const resetAvatarModal = () => {
        $("#imageCropperModal").modal("hide")
        if (cropper) {
            cropper.destroy()
        }
        $("#cropAvatarForm").trigger("reset")
    }

    //Reset modal
    $("#closeBtn").on("click", function () {
        resetAvatarModal()
    })

    // Trigger file input when mediaButton is clicked
    $('#mediaButton').on('click', function () {
        $('#fileInput').click();
    });

    // Handle file selection
    $('#fileInput').on('change', function () {
        // You can handle the selected file here (e.g., preview, upload, etc.)
        const selectedFile = $(this).prop('files')[0];
        // console.log(selectedFile);
        console.log(selectedFile)
    });

    // Toggle the display property of the Media Menu Pop-up
    $('#mediaButton').on('click', function (event) {
        event.stopPropagation()
        $('#mediaMenuPopup').toggle();
    });

    // Toggle the display property of the WhatsApp Web Attachment Pop-up
    $('#fileAttachmentMenu').on('click', function () {
        $('#fileUploadPopup').toggle();
    });

    $(".imageContainer").on("click", function () {
        $("#shareImage").trigger("click")
    })

    $(".fileContainer").on("click", function () {
        $("#shareFile").trigger("click")
    })

    $(".sendMessageField").on("keypress", function (event) {
        if (event.target.name == "message") {

            let receiver_id = $("#message").attr("receiver-id")

            //Through an event to show user typing status 
            socket.emit("notify:getUserTyping", { sender_id: senderId, receiver_id })
        }
    })

    //Trigger event when search user through modal
    $("#searchUserModal").on("input", function (event) {

        let query = $(this).val().replace(/[&\/\\#,+()$~%.'":*^@?<>{}%]/g, '').trim()
        searchUserAndUpdate(query, ".users-list-modal")
    })

    //Trigger event when search user through list
    $("#searchUser").on("input", function (event) {

        let query = $(this).val().replace(/[&\/\\#,+()$~%.'":*^@?<>{}%]/g, '').trim()
        searchUserAndUpdate(query, ".users-list")
    })

    //Search user with name and update html
    function searchUserAndUpdate(query, elementSelector) {
        $(elementSelector).empty()
        $.ajax({
            url: "/search-users",
            type: "POST",
            data: { query },
            success: function (res) {
                let users = res.data
                let $container = $(elementSelector); // Select the container
                let $newContent = $("<div></div>");
                users.forEach(user => {
                    let name = `${user.first_name} ${user.last_name}`
                    let username = capitalizeString(name)
                    let html = `
                            <a href="#" class="conversation-list list-group-item list-group-item-action border-0
                            user-list" data-user="${user._id}" data-name="${username}">
                                <div class="d-flex align-items-start">
                                    <img src="${user.avatar}" class="avatar-thumbnail mr-1" width="45" height="45">
                                    <div class="flex-grow-1 ml-3">
                                        ${username}
                                        <div class="small">
                                            <span id="${user._id}-status"
                                                class="fas fa-circle chat-online ${user.isOnline ? 'chat-online' : 'chat-offline'}">
                                            </span>
                                            <span id="${user._id}-status-text">
                                                ${user.isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>`
                    $newContent.append(html);
                })

                $container.fadeOut(200, function () {
                    $container.empty().append($newContent.html()).fadeIn(200);
                });
            }
        })
    }

    //Show all existing users on modal
    $("#getAllUsers").on("click", function (event) {
        event.preventDefault()
        $(".users-list-modal").empty()
        $.ajax({
            url: "/users",
            type: "POST",
            success: function (res) {
                let users = res.users
                if (users.length > 0) {
                    users.forEach(user => {
                        let fullname = capitalizeString(user.first_name + " " + user.last_name)
                        let html = `<a href="#" class="conversation-list list-group-item list-group-item-action border-0
                        user-list" data-user="${user._id}" data-name="${fullname}">
                            <div class="d-flex align-items-start">
                                <img src="${user.avatar}" class="avatar-thumbnail mr-1" width="45"
                                    height="45">
                                <div class="flex-grow-1 ml-3">
                                    ${fullname}
                                        <div class="small">
                                            <span id="${user._id}-status"
                                                class="fas fa-circle ${user.isOnline ? "chat-online" : "chat-offline"}">
                                            </span>
                                            <span id="${user._id}-status-text">
                                                ${user.isOnline ? "Online" : "Offline"}
                                            </span>
                                        </div>
                                </div>
                            </div>
                        </a>`

                        $(".users-list-modal").append(html)
                    })
                }
            }
        })
    })

    //Capitalize initials of string
    function capitalizeString(string) {
        return string.split(" ").map(str => {
            return str.charAt(0).toUpperCase() + str.slice(1)
        }).join(" ")
    }

    //Re-Order users on user list
    function showUsers() {
        $.ajax({
            url: "/reorder/user-list",
            type: "POST",
            success: function (res) {
                $(".users-list").empty()
                let users = res.users
                users.forEach(user => {
                    let fullname = capitalizeString(user.userInfo.first_name + ' ' + user.userInfo.last_name)
                    let html = `
                            <a href="#" class="conversation-list list-group-item list-group-item-action border-0
                                user-list" 
                                data-user="${user.userInfo._id}" data-name="${fullname}">
                                <div class="d-flex align-items-start">
                                <img src="${user.userInfo.avatar}" class="avatar-thumbnail mr-1" 
                                width="45" height="45">
                                <div class="flex-grow-1 ml-3">
                                    ${fullname}
                                        <div class="small">
                                            <span id="${user.userInfo._id}-status"
                                                class="fas fa-circle ${user.userInfo.isOnline ? 'chat-online' : 'chat-offline'} ">
                                            </span>
                                            <span id="${user.userInfo._id}-status-text">
                                                ${user.userInfo.isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                </div>
                            </div>
                        </a>`
                    $(".users-list").append(html)
                })
            }
        })
    }
})

//Click on user to start chat.
$(document).on("click", ".user-list", function () {
    let receiver_id = $(this).attr("data-user")
    let username = $(this).attr("data-name")
    let avatar = $(this).attr("data-avatar")

    // $(".chatbox-element").css("visibility", "visible")
    $("#chatBox").children().show()
    $("#mediaMenuPopup").hide()
    $(".chatbox-welcome").hide()
    $("#allUsers").modal("hide")

    $("#message").attr("receiver-id", receiver_id)
    $("#usernameChat").text(username)
    $(".profile-avatar").attr("src", avatar)
    $("#userStatus").addClass(`${receiver_id}-user-status`)

    //Through an event to load conversation
    socket.emit("user:chatHistory", { receiver_id, sender_id: senderId })
    scrollDownChat()
})

$(document).on("click", function (event) {
    if (!$(event.target).closest("#mediaMenuPopup").length) {
        $("#mediaMenuPopup").hide()
    }

    if (!$(event.target).closest("#emojiPicker").length &&
        !$(event.target).closest("[data-ref='rootElement']").length &&
        !$(event.target).closest("#message").length ||
        $(event.target).is("#message")) {
        $("#emojiPicker").hide()
    }
})