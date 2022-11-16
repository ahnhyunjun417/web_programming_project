async function mySearch(){
    let minPrice = document.getElementById("minPrice");
    let maxPrice = document.getElementById("maxPrice");

    if (minPrice.value > maxPrice.value){
        console.log()
        alert("최소 희망 가격이 최대 희망 가격보다 클 수 없습니다.");
        return ;
    }
    let mySearchForm = document.getElementById("mySearchEngineForm");
    mySearchForm.submit();
}

async function showBidders(productId){
    let myModal = document.getElementById("myModal");
    let myModalBody = document.getElementById("myModalBody");

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

    let arr = [3, 4, 5];
    for(let i = 0 ; i < arr.length ; i++){
        console.log(i);
        table = table + '<tr> <th scope="row">' + i.toString() + '</th>';
        table = table + '<td>' + "david0417" + '</td>';
        table = table + '<td>' + "안현준이다임마어쩌라고" + '</td>';
        table = table + '<td>' + "10000" + '</td>';
        table = table + '<td>' + "2022-11-15" + '</td>';
        table = table + '</tr>';
        console.log(table);
    }

    table = table + '</tbody> </table>';
    myModalBody.innerHTML= table;

}