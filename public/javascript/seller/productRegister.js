async function tryDelete(productId){
    $.ajax({
        url: "http://127.0.0.1:3000/sell/item" + productId.toString(),
        type: "delete",
        dataType: "json",
        success: async function(res){
            if(res.success){
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/sell/item/' + res.productId.toString());
            }
            else{
                alert(res.reason);
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });
}

async function tryFinishBidding(productId){
    $.ajax({
        url: "http://127.0.0.1:3000/sell/item" + productId.toString(),
        type: "patch",
        dataType: "json",
        success: async function(res){
            if(res.success){
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/sell/item/' + res.productId.toString());
            }
            else{
                alert(res.reason);
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });
}

async function tryEdit(productId){
    let nameText = document.getElementById("floatingName");
    let locationText = document.getElementById("floatingLocation");
    let phoneText = document.getElementById("floatingPhone");
    let priceText = document.getElementById("floatingPrice");
    let images = document.getElementById("inputGroupFile03");

    let types = document.getElementsByName("isAuction");

    let isAuction;
    types.forEach((node) => {
        if(node.checked){
            isAuction = node.value;
        }
    });

    if(nameText.value == ""){
        alert("상품 이름은 필수 입력사항 입니다.");
        return ;
    }
    if(locationText.value == ""){
        alert("거래 장소 위치는 필수 입력사항 입니다.");
        return ;
    }
    if(phoneText.value == ""){
        alert("전화 번호 연락처는 필수 입력사항 입니다.");
        return ;
    }
    if(priceText.value == "" && isAuction == "false"){
        alert("일반 판매 상품은 가격이 필수 입력사항 입니다.");
        return ;
    }
    if(images.files.length > 3){
        alert("최대 이미지 개수는 3개입니다.");
        return ;
    }

    if(isAuction == "true" && priceText.value == ""){
        priceText.value = 0;
    }

    $.ajax({
        url: "http://127.0.0.1:3000/sell/item" + productId.toString(),
        enctype: 'multipart/form-data',
        type: "post",
        dataType: "json",
        contentType: false,
        processData: false,
        cache: false,
        data: JSON.stringify({
            "name": nameText.value,
            "location": locationText.value,
            "phone": phoneText.value,
            "price": priceText.value,
            "isAuction": isAuction,
            "image": images.files
        }),
        success: async function(res){
            if(res.success){
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/sell/item/' + res.productId.toString());
            }
            else{
                alert(res.reason);
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });

}

async function tryRegister(){
    let nameText = document.getElementById("floatingName");
    let locationText = document.getElementById("floatingLocation");
    let phoneText = document.getElementById("floatingPhone");
    let priceText = document.getElementById("floatingPrice");
    let images = document.getElementById("inputGroupFile03");

    let types = document.getElementsByName("isAuction");

    let isAuction;
    types.forEach((node) => {
        if(node.checked){
            isAuction = node.value;
        }
    });

    if(nameText.value == ""){
        alert("상품 이름은 필수 입력사항 입니다.");
        return ;
    }
    if(locationText.value == ""){
        alert("거래 장소 위치는 필수 입력사항 입니다.");
        return ;
    }
    if(phoneText.value == ""){
        alert("전화 번호 연락처는 필수 입력사항 입니다.");
        return ;
    }
    if(priceText.value == "" && isAuction == "false"){
        alert("일반 판매 상품은 가격이 필수 입력사항 입니다.");
        return ;
    }
    if(images.files.length == 0){
        alert("상품 이미지는 반드시 하나 이상 있어야 합니다.");
        return ;
    }
    if(images.files.length > 3){
        alert("최대 이미지 개수는 3개입니다.");
        return ;
    }

    if(isAuction == "true" && priceText.value == ""){
        priceText.value = 0;
    }

    $.ajax({
        url: "http://127.0.0.1:3000/sell/register",
        enctype: 'multipart/form-data',
        type: "post",
        dataType: "json",
        contentType: false,
        processData: false,
        cache: false,
        data: JSON.stringify({
            "name": nameText.value,
            "location": locationText.value,
            "phone": phoneText.value,
            "price": priceText.value,
            "isAuction": isAuction,
            "image": images.files
        }),
        success: async function(res){
            if(res.success){
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/sell/item/' + res.productId.toString());
            }
            else{
                alert(res.reason);
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });

}
