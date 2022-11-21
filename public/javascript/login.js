function signup(){
    alert("회원가입 페이지로 이동합니다.");
}

function login(){
    let pwText = document.getElementById("floatingPassword");
    let userIdText = document.getElementById("floatingInput");

    if(userIdText.value == ""){
        alert("아이디를 입력해주세요.");
        return ;
    }
    else if(pwText.value == ""){
        alert("비밀번호를 입력해주세요.");
        return ;
    }
    else{
        $.ajax({
            url: "/login",
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                id: userIdText.value,
                password: pwText.value,
            }),
            success: function(res){
                if(res.success){
                    if(res.authority == 1){
                        location.replace('http://127.0.0.1:3000/buy/');
                        return;
                    }
                    if(res.authority == 2){
                        location.replace('http://127.0.0.1:3000/sell/');
                        return;
                    }
                    if(res.authority == 3){
                        location.replace('http://127.0.0.1:3000/admin/');
                        return;
                    }
                }
                else{
                    alert(res.reason);
                }
            },
            error: function(res){
                alert("시스템 오류가 발생했습니다. 다시 로그인 요청 바랍니다.");
            }
        });
    }
}