async function deleteProduct(productId){
    $.ajax({
        url: "http://127.0.0.1:3000/sell/item/" + productId.toString(),
        type: "delete",
        dataType: "json",
        success: async function(res){
            if(res.success){
                alert("상품을 성공적으로 삭제하였습니다.");
                location.replace('http://127.0.0.1:3000/sell/me');
            }
            else{
                alert("상품을 삭제할 수 없습니다.");
                location.replace('http://127.0.0.1:3000/sell/me');
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });
}

async function deleteProductByAdmin(productId){
    $.ajax({
        url: "http://127.0.0.1:3000/admin/item/" + productId.toString(),
        type: "delete",
        dataType: "json",
        success: async function(res){
            if(res.success){
                alert("상품을 성공적으로 삭제하였습니다.");
                location.replace('http://127.0.0.1:3000/admin/');
            }
            else{
                alert("상품을 삭제할 수 없습니다.");
                location.replace('http://127.0.0.1:3000/admin/');
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });
}

// 여기부터는 구매자 관련 함수
async function addWish(productId){
    $.ajax({
        url: "http://127.0.0.1:3000/buy/wish/" + productId.toString(),
        type: "post",
        contentType: "application/json",
        dataType: "json",
        success: async function(res){
            if(res.success){
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/buy/item/' + productId.toString());
            }
            else{
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/buy/item/' + productId.toString());
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });
}

async function deleteWish(productId){
    $.ajax({
        url: "http://127.0.0.1:3000/buy/wish/" + productId.toString(),
        type: "delete",
        contentType: "application/json",
        dataType: "json",
        success: async function(res){
            if(res.success){
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/buy/item/' + productId.toString());
            }
            else{
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/buy/item/' + productId.toString());
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });
}

async function buy(productId){
    $.ajax({
        url: "http://127.0.0.1:3000/buy/item/" + productId.toString(),
        type: "post",
        contentType: "application/json",
        dataType: "json",
        success: async function(res){
            if(res.success){
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/buy/item/' + productId.toString());
            }
            else{
                alert(res.reason);
                location.replace('http://127.0.0.1:3000/buy/item/' + productId.toString());
            }
        },
        error: async function(res){
            alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
        }
    });
}

async function bid(productId, price){
    let newPrice = document.getElementById("floatingAuction");
    if(price < newPrice.value){
        $.ajax({
            url: "http://127.0.0.1:3000/buy/item/" + productId.toString(),
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({"price": newPrice.value}),
            success: async function(res){
                if(res.success){
                    alert(res.reason);
                    location.replace('http://127.0.0.1:3000/buy/item/' + productId.toString());
                }
                else{
                    alert(res.reason);
                    location.replace('http://127.0.0.1:3000/buy/item/' + productId.toString());
                }
            },
            error: async function(res){
                alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
            }
        });
    }
    else{
        alert("새로운 입찰 금액은 현재 최고 입찰가보다 커야합니다.");
    }
}