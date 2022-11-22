async function mySearch(){
  try{
      let searchText = document.getElementsByName("searchText")[0];
      let minPrice = document.getElementById("minPrice");
      let maxPrice = document.getElementById("maxPrice");
      let orderList = document.getElementsByName("order");

      let order;
      orderList.forEach((node) => {
          if(node.checked){
              order = node.value;
          }
      });

      if(minPrice.value && maxPrice.value){
          if (minPrice.value > maxPrice.value){
              console.log()
              alert("최소 희망 가격이 최대 희망 가격보다 클 수 없습니다.");
              return ;
          }
      }
      
      let searchUrl = "http://127.0.0.1:3000/sell/me/search?pageNumber=1&pageSize=12&searchText=";
      if(searchText.value){
          searchUrl += searchText.value;
      }
      searchUrl += "&minPrice=";
      if(minPrice.value){
          searchUrl += minPrice.value;
      }
      searchUrl += "&maxPrice=";
      if(maxPrice.value){
          searchUrl += maxPrice.value;
      }
      searchUrl += "&order=";
      if(order){
          searchUrl += order;
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
                      <img src='/images/'" + res.content[i].image + "class='card-img-top myThumbnail' alt='" + res.content[i].name +"'>\
                      <div class='card-body'>\
                      <h5 class='card-title text-truncate'>" + res.content[i].name + "</h5>\
                      <p class='card-text'><i class='fa-solid fa-heart'></i>" + res.content[i].stars + "</p>\
                      <a href='http://127.0.0.1:3000/sell/item/" + res.content[i].id + "' class='btn btn-warning'>수정하기</a>";
                  if(res.content[i].isAuction == "경매 판매"){
                    itemCards += "<a class='btn btn-secondary' data-bs-toggle='modal' data-bs-target='#myModal' onclick='showBidders('"+ res.content[i].id.toString() + "')'> 경매 현황</a>";
                  }
                  itemCards += "</div>\
                      <ul class='list-group list-group-flush'>\
                      <li class='list-group-item text-truncate'>" + res.content[i].price + "</li> \
                      <li class='list-group-item text-truncate'>" + res.content[i].status + "</li> \
                      <li class='list-group-item text-truncate'>" + res.content[i].location + "</li> \
                      </ul> \
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

async function movePage(pageNumber){
  try{
      let searchText = document.getElementsByName("searchText")[0];
      let minPrice = document.getElementById("minPrice");
      let maxPrice = document.getElementById("maxPrice");
      let orderList = document.getElementsByName("order");

      let order;
      orderList.forEach((node) => {
          if(node.checked){
              order = node.value;
          }
      });

      if(minPrice.value && maxPrice.value){
          if (minPrice.value > maxPrice.value){
              console.log()
              alert("최소 희망 가격이 최대 희망 가격보다 클 수 없습니다.");
              return ;
          }
      }
      
      let searchUrl = "/sell/me/search?pageNumber=" + pageNumber.toString() + "&pageSize=12&searchText=";
      if(searchText.value){
          searchUrl += searchText.value;
      }
      searchUrl += "&minPrice=";
      if(minPrice.value){
          searchUrl += minPrice.value;
      }
      searchUrl += "&maxPrice=";
      if(maxPrice.value){
          searchUrl += maxPrice.value;
      }
      searchUrl += "&order=";
      if(order){
          searchUrl += order;
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
                      <img src='/images/'" + res.content[i].image + "class='card-img-top myThumbnail' alt='" + res.content[i].name +"'>\
                      <div class='card-body'>\
                      <h5 class='card-title text-truncate'>" + res.content[i].name + "</h5>\
                      <p class='card-text'><i class='fa-solid fa-heart'></i>" + res.content[i].stars + "</p>\
                      <a href='http://127.0.0.1:3000/sell/item/" + res.content[i].id + "' class='btn btn-warning'>수정하기</a>";
                  if(res.content[i].isAuction == "경매 판매"){
                    itemCards += "<a class='btn btn-secondary' data-bs-toggle='modal' data-bs-target='#myModal' onclick='showBidders('"+ res.content[i].id.toString() + "')'> 경매 현황</a>";
                  }
                  itemCards += "</div>\
                      <ul class='list-group list-group-flush'>\
                      <li class='list-group-item text-truncate'>" + res.content[i].price + "</li> \
                      <li class='list-group-item text-truncate'>" + res.content[i].status + "</li> \
                      <li class='list-group-item text-truncate'>" + res.content[i].location + "</li> \
                      </ul> \
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

async function showBidders(productId){
    $.ajax({
      url: "http://127.0.0.1:3000/sell/item/" + productId.toString() + "/bidders",
      type: "get",
      dataType: "json",
      success: async function(res){

        if(res.content.length < 1){
          $("#myModalBody").empty();
        $("#myModalBody").text("아직 경매에 참여한 사람이 없습니다.");
          return ;
        }

        table = '<table class="table"> \
        <thead>\
          <tr>\
            <th scope="col">#</th>\
            <th scope="col">ID</th>\
            <th scope="col">Name</th>\
            <th scope="col">Price</th>\
            <th scope="col">Time</th>\
          </tr>\
        </thead>\
        <tbody>';
        for(let i = 0 ; i < res.content.length ; i++){
          table = table + '<tr> <th scope="row" class="text-truncate">' + i.toString() + '</th>';
          table = table + '<td class="text-truncate">' + res.content[i].userId + '</td>';
          table = table + '<td class="text-truncate">' + res.content[i].name + '</td>';
          table = table + '<td class="text-truncate">' + res.content[i].price + '</td>';
          table = table + '<td class="text-truncate">' + res.content[i].time + '</td>';
          table = table + '</tr>';
        }

        table = table + '</tbody> </table>';
        $("#myModalBody").empty();
        $("#myModalBody").html(table);

        return;
      },
      error: async function(res){
          alert("시스템 오류가 발생했습니다. 다시 요청해주세요!!");
      }
  });

}