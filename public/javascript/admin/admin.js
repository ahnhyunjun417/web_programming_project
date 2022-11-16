async function mySearch(){
    let admin = document.getElementsByName("adminCheck")[0];
    let seller = document.getElementsByName("sellerCheck")[0];
    let buyer = document.getElementsByName("buyerCheck")[0];

    console.log(admin.checked);
    console.log(seller.checked);
    console.log(buyer.checked);
    
    // 여기서 인제 admin, seller, buyer check 된거 토대로
    // json으로 만들어서 보내면 될듯
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
        alert("아이디 중복 검사를 실시합니다.")
        if("아이디 중복 검사 성공"){
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
        return ;
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

async function tryEdit(){
    let invalidItem = document.getElementsByClassName("is-invalid")[0];
    if(invalidItem){
        alert("입력사항을 다시 확인해주세요.");
    }
    else{
        document.getElementById("myEditForm").submit();
    }
}