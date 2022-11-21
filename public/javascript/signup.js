let mySignupForm = document.getElementById("mySignupForm");
let userIdDiv = document.getElementById("userIdDiv");
let pwDiv = document.getElementById("pwDiv");
let pwCheckDiv = document.getElementById("pwCheckDiv");

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

async function rePwChecker(){
    let pwCheckDiv = document.getElementById("pwCheckDiv");
    let pwCheckText = document.getElementById("floatingRePassword");
    let pwText = document.getElementById("floatingPassword");

    if(pwCheckText.value != pwText.value){
        pwCheckText.classList.remove("is-valid");
        pwCheckText.classList.add("is-invalid");

        let div1 = pwCheckDiv.getElementsByClassName("valid-feedback")[0];
        if(div1){
            div1.remove();
        }

        let div2 = pwCheckDiv.getElementsByClassName("invalid-feedback")[0];
        if(!div2){
            const newDiv = document.createElement('div');
            newDiv.className = "invalid-feedback";
            newDiv.innerHTML = "비밀번호가 일치하지 않습니다.";
            pwCheckDiv.appendChild(newDiv);
        }
        return ;
    }else{
        pwCheckText.classList.remove("is-invalid");
        pwCheckText.classList.add("is-valid");

        let div1 = pwCheckDiv.getElementsByClassName("invalid-feedback")[0];
        if(div1){
            div1.remove();
        }

        let div2 = pwCheckDiv.getElementsByClassName("valid-feedback")[0];
        if(!div2){
            const newDiv = document.createElement('div');
            newDiv.className = "valid-feedback";
            newDiv.innerHTML = "비밀번호가 일치합니다.";
            pwCheckDiv.appendChild(newDiv);
        }
        return ;
    }
}

async function tryRegister(){
    let invalidItem = document.getElementsByClassName("is-invalid")[0];
    let pwCheckText = document.getElementById("floatingRePassword");
    let pwText = document.getElementById("floatingPassword");
    let userIdText = document.getElementById("floatingInput");
    let userName = document.getElementById("floatingName");
    let userAuthority = document.getElementById("userAuthority");

    if(invalidItem){
        alert("입력사항을 다시 확인해주세요.");
    }
    else if(userIdText.value == ""){
        alert("아이디를 입력해주세요.");
    }
    else if(pwText.value == ""){
        alert("비밀번호를 입력해주세요.");
    }
    else if(pwCheckText.value == ""){
        alert("비밀번호를 재확인해주세요.");
    }
    else if(userName.value == ""){
        alert("이름을 입력해주세요.");
    }
    else{
        $.ajax({
            url: "/register",
            type: "post",
            contentType: "application/json",
            data: JSON.stringify({
                userId: userIdText.value,
                password: pwText.value,
                name: userName.value,
                authority: userAuthority.value
            }),
            success: function(res){
                if(res.success){
                    alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
                    location.replace('http://127.0.0.1:3000/login');
                }
                else{
                    alert("중복된 아이디가 사용 중 입니다.");
                }
            },
            error: function(res){
                alert("시스템 오류가 발생했습니다. 다시 회원가입을 진행해주세요ㅠㅠ");
            }
        });
    }
}

