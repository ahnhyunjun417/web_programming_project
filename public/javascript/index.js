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