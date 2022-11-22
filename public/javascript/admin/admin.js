async function mySearch(){
    try{
        let searchText = document.getElementsByName("searchText")[0];
        let adminCheck = document.getElementById("inlineRadio1");
        let sellerCheck = document.getElementById("inlineRadio2");
        let buyerCheck = document.getElementById("inlineRadio3");
        
        let searchUrl = "http://127.0.0.1:3000/admin/users/search?pageNumber=1&pageSize=12&searchText=";
        if(searchText.value){
            searchUrl += searchText.value;
        }
        searchUrl += "&adminCheck=";
        if(adminCheck.checked){
            searchUrl += "true";
        }
        else{
            searchUrl += "false";
        }
        searchUrl += "&sellerCheck=";
        if(sellerCheck.checked){
            searchUrl += "true";
        }
        else{
            searchUrl += "false";
        }
        searchUrl += "&buyerCheck=";
        if(buyerCheck.checked){
            searchUrl += "true";
        }
        else{
            searchUrl += "false";
        }

        $.ajax({
            url: searchUrl,
            type: "get",
            dataType: "json",
            success: function(res){
                $("#itemListTitle").empty();
                $("#itemListTitle").text("검색결과 총 " + res.totalItems.toString() + "건의 결과 입니다.");

                $("#currentPage").empty();
                $("#currentPage").text(res.pageNumber.toString());
                if(res.pageNumber < 2){
                    $("#prevPage1").attr("disabled", true);
                    $('#prevPage2').attr('onclick', '').unbind('click');
                }
                else{
                    $("#prevPage1").attr("disabled", false);
                    $('#prevPage2').attr('onclick', 'movePage('+ res.prevPage.toString() +')');
                }

                if(res.pageNumber < res.totalPages){
                    $("#nextPage1").attr("disabled", false);
                    $('#nextPage2').attr('onclick', 'movePage('+ res.nextPage.toString() +')');
                }
                else{
                    $("#nextPage1").attr("disabled", true);
                    $('#nextPage2').attr('onclick', '').unbind('click');
                }

                let itemCards = "";
                
                for(let i = 0 ; i < res.content.length; i++){
                    itemCards += "<div class='card myItemCard' style='width: 18rem;'>\
                        <div class='card-body'>\
                        <h5 class='card-title text-truncate'>이름: " + res.content[i].name.toString() + "</h5>\
                        <p class='card-text text-truncate'>ID: " + res.content[i].userId.toString() + "</p>\
                        <p class='card-text text-truncate'>분류: " + res.content[i].authority.toString() + "</p>\
                        <a href='http://127.0.0.1:3000/admin/user/" + res.content[i].id.toString() + "' class='btn btn-warning'>사용자 정보 수정</a>\
                        </div>\
                        </div>";
                }
                
                $("#itemList").empty();
                $("#itemList").append(itemCards);
            },
            error: async function(res){
                alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
            }
        });
    }catch(err){
        alert(err);
    }   
}

async function movePage(pageNumber){
    try{
        let searchText = document.getElementsByName("searchText")[0];
        let adminCheck = document.getElementById("inlineRadio1");
        let sellerCheck = document.getElementById("inlineRadio2");
        let buyerCheck = document.getElementById("inlineRadio3");
        
        let searchUrl = "http://127.0.0.1:3000/admin/users/search?pageNumber=" + pageNumber.toString() + "&pageSize=12&searchText=";
        if(searchText.value){
            searchUrl += searchText.value;
        }
        searchUrl += "&adminCheck=";
        if(adminCheck.checked){
            searchUrl += "true";
        }
        else{
            searchUrl += "false";
        }
        searchUrl += "&sellerCheck=";
        if(sellerCheck.checked){
            searchUrl += "true";
        }
        else{
            searchUrl += "false";
        }
        searchUrl += "&buyerCheck=";
        if(buyerCheck.checked){
            searchUrl += "true";
        }
        else{
            searchUrl += "false";
        }

        $.ajax({
            url: searchUrl,
            type: "get",
            dataType: "json",
            success: async function(res){
                $("#itemListTitle").empty();
                $("#itemListTitle").text("검색결과 총 " + res.totalItems.toString() + "건의 결과 입니다.");

                $("#currentPage").empty();
                $("#currentPage").text(res.pageNumber.toString());
                if(res.pageNumber < 2){
                    $("#prevPage1").attr("disabled", true);
                    $('#prevPage2').attr('onclick', '').unbind('click');
                }
                else{
                    $("#prevPage1").attr("disabled", false);
                    $('#prevPage2').attr('onclick', 'movePage('+ res.prevPage.toString() +')');
                }

                if(res.pageNumber < res.totalPages){
                    $("#nextPage1").attr("disabled", false);
                    $('#nextPage2').attr('onclick', 'movePage('+ res.nextPage.toString() +')');
                }
                else{
                    $("#nextPage1").attr("disabled", true);
                    $('#nextPage2').attr('onclick', '').unbind('click');
                }

                let itemCards = "";
                for(let i = 0 ; i < res.content.length; i++){
                    itemCards += "<div class='card myItemCard' style='width: 18rem;'>\
                        <div class='card-body'>\
                        <h5 class='card-title text-truncate'>이름: " + res.content[i].name + "</h5>\
                        <p class='card-text text-truncate'>ID: " + res.content[i].userId + "</p>\
                        <p class='card-text text-truncate'>분류: " + res.content[i].authority + "</p>\
                        <a href='http://127.0.0.1:3000/admin/user/" + res.content[i].id + "' class='btn btn-warning'>사용자 정보 수정</a>\
                        </div>\
                        </div>"
                }

                $("#itemList").empty();
                $("#itemList").html(itemCards);
            },
            error: async function(res){
                alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
            }
        });
    }catch(err){
        alert(err);
    }
}

async function idChecker(userId){
    let checker = /^[A-Za-z0-9_-]{4,20}$/;
    let userIdDiv = document.getElementById("userIdDiv");
    let userIdText = document.getElementById("floatingInput");

    if(!checker.test(userId)){
        alert("아이디는 영어, 숫자, 언더바/하이픈 4~20자리만 허용됩니다.");
        userIdText.classList.remove("is-valid");
        userIdText.classList.add("is-invalid");

        let div1 = userIdDiv.getElementsByClassName("valid-feedback")[0];
        if(div1){
            div1.remove();
        }

        let div2 = userIdDiv.getElementsByClassName("invalid-feedback")[0];
        if(!div2){
            const newDiv = document.createElement('div');
            newDiv.className = "invalid-feedback";
            newDiv.innerHTML = "사용할 수 없는 아이디 입니다.";
            userIdDiv.appendChild(newDiv);
        }
        return ;
    }
    else{
        $.ajax({
            url: "/validId",
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({id: userId}),
            success: function(res){
                alert("아이디 중복 검사를 실시합니다.")
                let userIdDiv = document.getElementById("userIdDiv");
                let userIdText = document.getElementById("floatingInput");
                if(res.success){
                    userIdText.classList.remove("is-invalid");
                    userIdText.classList.add("is-valid");
        
                    let div1 = userIdDiv.getElementsByClassName("invalid-feedback")[0];
                    if(div1){
                        div1.remove();
                    }
        
                    let div2 = userIdDiv.getElementsByClassName("valid-feedback")[0];
                    if(!div2){
                        const newDiv = document.createElement('div');
                        newDiv.className = "valid-feedback";
                        newDiv.innerHTML = "사용할 수 있는 아이디 입니다.";
                        userIdDiv.appendChild(newDiv);
                    }
                }
                else{
                    userIdText.classList.remove("is-valid");
                    userIdText.classList.add("is-invalid");
        
                    let div1 = userIdDiv.getElementsByClassName("valid-feedback")[0];
                    if(div1){
                        div1.remove();
                    }
        
                    let div2 = userIdDiv.getElementsByClassName("invalid-feedback")[0];
                    if(!div2){
                        const newDiv = document.createElement('div');
                        newDiv.className = "invalid-feedback";
                        newDiv.innerHTML = "사용할 수 없는 아이디 입니다.";
                        userIdDiv.appendChild(newDiv);
                    }
                }
            }
        });
        
    }
}

async function pwChecker(pw){
    let checker = /(?=.*[a-zA-ZS])(?=.*?[#?!@$%^&*-]).{6,24}/;
    let pwDiv = document.getElementById("pwDiv");
    let pwText = document.getElementById("floatingPassword");

    if(!checker.test(pw)){
        alert("비밀번호는 영어, 숫자, 특수문자(!,@,#,$,%,^,&,*,-) 6~24자리만 허용합니다. 특수문자가 하나 이상 포함되어 있어야 합니다.");
        pwText.classList.remove("is-valid");
        pwText.classList.add("is-invalid");

        let div1 = pwDiv.getElementsByClassName("valid-feedback")[0];
        if(div1){
            div1.remove();
        }

        let div2 = pwDiv.getElementsByClassName("invalid-feedback")[0];
        if(!div2){
            const newDiv = document.createElement('div');
            newDiv.className = "invalid-feedback";
            newDiv.innerHTML = "사용할 수 없는 비밀번호 입니다.";
            pwDiv.appendChild(newDiv);
        }
        return ;
    }else{
        pwText.classList.remove("is-invalid");
        pwText.classList.add("is-valid");

        let div1 = pwDiv.getElementsByClassName("invalid-feedback")[0];
        if(div1){
            div1.remove();
        }

        let div2 = pwDiv.getElementsByClassName("valid-feedback")[0];
        if(!div2){
            const newDiv = document.createElement('div');
            newDiv.className = "valid-feedback";
            newDiv.innerHTML = "사용할 수 있는 비밀번호 입니다.";
            pwDiv.appendChild(newDiv);
        }
        return ;
    }
}

async function tryEdit(id){
    let invalidItem = document.getElementsByClassName("is-invalid")[0];
    let pwText = document.getElementById("floatingPassword");
    let userIdText = document.getElementById("floatingInput");
    let userName = document.getElementById("floatingName");
    let userType = document.getElementById("userType");
    let userStatus = document.getElementById("userStatus");

    if(invalidItem){
        alert("입력사항을 다시 확인해주세요.");
    }
    else if(userIdText.value == ""){
        alert("아이디를 입력해주세요.");
    }
    else if(userName.value == ""){
        alert("이름을 입력해주세요.");
    }
    else{
        $.ajax({
            url: "http://127.0.0.1:3000/admin/user/" + id.toString(),
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                userId: userIdText.value,
                password: pwText.value,
                name: userName.value,
                userType: userType.value,
                userStatus: userStatus.value,
            }),
            success: function(res){
                if(res.success){
                    alert(res.reason);
                    location.replace('http://127.0.0.1:3000/admin/users');
                }
                else{
                    alert(res.reason);
                }
            },
            error: function(res){
                alert("시스템 오류가 발생했습니다. 다시 회원가입을 진행해주세요ㅠㅠ");
            }
        });
    }
}

async function tryDelete(id){
    $.ajax({
        url: "http://127.0.0.1:3000/admin/user/" + id.toString(),
        type: "delete",
        dataType: "json",
        success: async function(res){
            if(res.success){
                alert("상품을 성공적으로 삭제하였습니다.");
                location.replace('http://127.0.0.1:3000/admin/users');
            }
            else{
                alert("상품을 삭제할 수 없습니다.");
                location.replace('http://127.0.0.1:3000/admin/users');
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });
}