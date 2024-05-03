$(document).ready(function () {
    //Catch an event to load chat history
    socket.on("group:loadChatHistory", data => {
        $(".chat-messages").html("")
        let chats = data.chatHistory
        chats.forEach(chat => {
            // console.log(chat, 1111)
            senderInfo = chat.sender_id
            if (chat.sender_id._id == senderId) {
                addClass = "chat-message-right"
                contentClass = "message-content"
            } else {
                addClass = "chat-message-left"
                contentClass = "message-content-left"
            }
            let sharedImg = (chat.image && chat.image.length > 0) ? `<img src="${chat.image}" class="shared-image">` : ''

            let html = `<li class="${addClass}">
                            <div style="text-align: center;">
                                <img src="${senderInfo.avatar}" class="rounded-circle mr-1" width="40" height="40">
                                <div class="text-muted small text-nowrap mt-2 message-data-time" style="color: #8e8e8e;">${moment(chat.createdAt).format("HH:mm a")}</div>
                            </div>
                            <div class="${contentClass}">
                                ${sharedImg}
                                <div class="message-text">${chat.message}</div>
                                <div class="message-data">
                                    <span class="message-data-time">${moment(chat.createdAt).format("MMM Do")} | </span>
                                    <span class="message-data-name">${senderInfo.first_name[0].toUpperCase()}${senderInfo.first_name.slice(1)}</span>
                                </div>
                            </div>
                        </li>`
            $(".chat-messages").append(html)
            scrollDownChat()
        })
    })

    //Catch an event for showing chat message
    // socket.on("user:showSendMessage", chat => {
    //     if (chat.data.receiver_id == senderId) {
    //         let html = `
    //                 <div class="chat-message-left pb-4">
    //                     <div>
    //                         <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
    //                         <div class="text-muted small text-nowrap mt-2"> am</div>
    //                     </div>
    //                     <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
    //                         <div class="font-weight-bold mb-1">You</div>
    //                         ${chat.data.message}
    //                     </div>
    //                 </div>`
    //         $(".chat-messages").append(html)
    //         scrollDownChat()
    //     }
    // })

    //Catch an event to show new group message
    socket.on("group:showNewMessage", chat => {

        let currentUserId = senderId
        let receivedMsg = chat.sentMessage.groupMsg
        let senderInfo = chat.sentMessage.senderInfo
        let sharedImg = (receivedMsg.image && receivedMsg.image.length > 0) ? `<img src="${receivedMsg.image}" class="shared-image">` : ''

        if(currentUserId != receivedMsg.sender_id){
            let html = `<li class="chat-message-left">
                        <div style="text-align: center;">
                            <img src="${senderInfo.avatar}" class="rounded-circle mr-1" width="40" height="40">
                            <div class="text-muted small text-nowrap mt-2 message-data-time" style="color: #8e8e8e;">${moment(receivedMsg.createdAt).format("HH:mm a")}</div>
                        </div>
                        <div class="message-content-left">
                            ${sharedImg}
                            <div class="message-text">${receivedMsg.message}</div>
                            <div class="message-data">
                                <span class="message-data-time">${moment(receivedMsg.createdAt).format("MMM Do")} | </span>
                                <span class="message-data-name">${senderInfo.first_name[0].toUpperCase()}${senderInfo.first_name.slice(1)}</span>
                            </div>
                        </div>
                    </li>`
                    $(".chat-messages").append(html)
                    scrollDownChat()
        }
    })

    //Click on group to start chat.
    $(".group-list").click(function () {
        let group_id = $(this).attr("data-group")
        let groupname = $(this).attr("data-name")
        let groupImage = $(this).attr("data-image")
        let group_name = capitalizeString(groupname)

        $("#chatBox").children().show()
        $(".chatbox-welcome").hide()
        $("#mediaMenuPopup").hide()
        $(".chatbox-element").css("visibility", "visible")
        $("#message").attr("group-id", group_id)
        $("#groupImage").attr("src", groupImage)
        $("#groupName").text(group_name)

        //Through an event to load conversation
        socket.emit("group:chatHistory", { group_id, sender_id: senderId })
        scrollDownChat()
    })

    //Send message to user. 
    $("#createGroupForm").submit(function (event) {
        event.preventDefault();
        let formdata = new FormData(this);
        // let formdata = $(this).serializeArray()
        // formdata.append("name", $("#name").val());
        $.ajax({
            url: "/group/store",
            type: "POST",
            data: formdata,
            processData: false,
            contentType: false,
            success: function (res) {
                console.log(3333, res)
                if (res.success) {
                    $("#createGroupForm").trigger("reset")
                    $("#createGroupModal").modal("hide")
                    // location.reload()
                } else {
                    // alert(res.message)
                }
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    });

    //Copy group link, so other user can join.
    $(".shareGroupLink").click(function () {
        let groupId = $(this).attr("data-group")
        let group_name_string = $(this).attr("group-name")
        let groupName = capitalizeString(group_name_string)
        $(this).prepend("<span class='copiedText'>Copied</span>")
        let url = `${window.location.host}/join-group/${groupId}`
        $("#groupLabel").text(groupName)
        $("#groupLink").val(url)
        let tempInput = $("<input>")
        $("body").append(tempInput)
        tempInput.val(url).select()
        document.execCommand("copy")
        tempInput.remove()

        setTimeout(() => {
            $(".copiedText").remove()
        }, 3000)
    })

    // Trigger file input when mediaButton is clicked
    $('#mediaButton').on('click', function () {
        $('#fileInput').click();
    });

    // Toggle the display property of the Media Menu Pop-up
    $('#mediaButton').on('click', function (event) {
        event.stopPropagation()
        $('#mediaMenuPopup').toggle();
    });

    $(".imageContainer").on("click", function () {
        $("#shareImage").trigger("click")
    })

    //Convert image to Base64 Encoded string, after selecting photo to share.
    var sharedBase64Image
    var imageObj
    $("#shareImage").on("change", function () {
        let reader
        imageObj = this.files[0]
        if (imageObj) {
            reader = new FileReader()
            reader.onload = event => {
                sharedBase64Image = event.target.result
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

    //Show chat message to current user group
    $("#sendGroupMessageForm").submit(function (event) {
        event.preventDefault()
        let message = $("#message").val()
        let group_id = $("#message").attr("group-id")
        let url = $(this).attr("action")
        $.ajax({
            url,
            type: "POST",
            data: { group_id, message, sharedBase64Image },
            success: function (res) {
                console.log(res, 111)
                if (res.success) {

                    //Clear all variables and forms
                    $("#sendGroupMessageForm").trigger("reset")
                    imageObj = undefined
                    sharedBase64Image = ""
                    $(".chat-messages").show()
                    $(".close-button").hide()
                    $(".media-wrapper").hide()
                    $("#imagePreview").removeAttr("src")
                    $("#sendGroupMessageForm").trigger("reset")

                    let message = res.groupMsg.message
                    let first_name = res.senderInfo.first_name
                    let avatar = res.senderInfo.avatar
                    let sharedImg = (res.groupMsg.image && res.groupMsg.image.length > 0) ? `<img src="${res.groupMsg.image}" class="shared-image">` : ''


                    let html = `<li class="chat-message-right">
                        <div style="text-align: center;">
                            <img src="${avatar}" class="rounded-circle mr-1" width="40" height="40">
                            <div class="text-muted small text-nowrap mt-2 message-data-time" style="color: #8e8e8e;">${moment(res.groupMsg.createdAt).format("HH:mm a")}</div>
                        </div>
                        <div class="message-content">
                            ${sharedImg}
                            <div class="message-text">${message}</div>
                            <div class="message-data">
                                <span class="message-data-time">${moment(res.groupMsg.createdAt).format("MMM Do")} | </span>
                                <span class="message-data-name">${first_name[0].toUpperCase()}${first_name.slice(1)}</span>
                            </div>
                        </div>
                    </li>`
                    $(".chat-messages").append(html)
                    scrollDownChat()
                    let sentMessage = res
                    socket.emit("group:newMessage", { sentMessage })
                } else {
                    alert(res.message)
                }
            }
        })
    })

    //Toggle Emoji Popup
    $("#emojiButton").on('click', function (event) {
        event.stopPropagation()
        $("#emojiPicker").toggle("display")
    })

    // Handle emoji selection
    $('#emojiPicker').on('emoji-click', function (event) {
        // Get the selected emoji
        var emoji = event.detail.unicode;
        // $("#emojiPicker").hide()
        $('.sendMessageField').val($('.sendMessageField').val() + emoji)
        let inputMsg = $(".sendMessageField").val()
        sharedBase64Image = undefined
        checkInputField(inputMsg, sharedBase64Image)
    });

    $("#message").on("click", function(event) {
        $("#emojiPicker").hide()
        $("#mediaMenuPopup").hide()
    })

    //Check if input field is empty or not and remove white space from string.
    const checkInputField = (inputObj, image) => {
        let messageObj = inputObj.replace(/\s/g, '')
        
        console.log(messageObj, messageObj.length, image, image == "", 123)
        if(messageObj.length > 0 || image != undefined){
            $(".sendMessageBtn").show()
        }else{
            $(".sendMessageBtn").hide()
        }

        if(image == undefined){
            sharedBase64Image = undefined
        }
    }

    //Reset image preview
    $(".close-button").on("click", function () {
        imageObj = undefined
        $(".chat-messages").show()
        $(".close-button").hide()
        $(".media-wrapper").hide()
        
        let inputMsg = $("#message").val()
        let image = undefined
        checkInputField(inputMsg, image)
    })

    //Enable send button if input field is not empty
    $(".sendMessageField").on("input", function () {
        let inputMsg = $(this).val()
        checkInputField(inputMsg, sharedBase64Image)
    })

    //Join group with shared link.
    $("#joinGroupBtn").click(function () {
        let groupId = $(this).attr("data-group")
        $(this).attr("disabled", "disabled")
        $.ajax({
            url: "/join-group",
            type: "POST",
            data: { groupId },
            success: function (res) {
                if (res.success) {
                    location.reload()
                } else {
                    alert(res.message)
                    $(this).text("Join")
                    $(this).removeAttr("disabled")
                }
            }
        })
    })

    function capitalizeString(string) {
        return string.split(" ").map(str => {
            return str.charAt(0).toUpperCase() + str.slice(1)
        }).join(" ")
    }

})