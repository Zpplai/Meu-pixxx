export function toggleLoader(show){

    const loader =
    document.getElementById("loader");

    if(!loader) return;

    if(show){

        loader.classList.remove("hidden");

    }else{

        loader.classList.add("hidden");
    }
}