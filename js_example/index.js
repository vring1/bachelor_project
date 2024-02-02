function myFunction()
{
    console.log('Hello, world!');
}


function changeContent() {
    
    document.getElementById('demo').innerHTML = 'New Content!';   
}

function changeContentBack() {
    document.getElementById('demo').innerHTML = 'THIS IS THE CONTENT IN THE BEGINNING';
    
}
function openNewWindow() {
    window.open("https://www.google.com");    
}
//document.getElementById("change_content_button").addEventListener("click", function() {
//    alert("Button clicked!");
//});

function fetchDataFromAPILink()
{
    const apiLinkInput = document.getElementById('api_link');
    console.log(apiLinkInput);
    console.log(apiLinkInput.value);
    const apiLink = apiLinkInput.value;

    // ellers brug dette link: https://api.publicapis.org/entries
    if (apiLink.trim() !== '') {
    fetch(apiLink)
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
    } else
    {
        alert('API link is empty, will use https://api.publicapis.org/entries instead');
        console.error('API link is empty');
        fetch('https://api.publicapis.org/entries')
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
    }
}

 
setTimeout(function() {
    console.log("Delayed function executed!");
}, 2000); // Execute after 2 seconds





document.getElementById("change_content_button").addEventListener("dblclick", function() {
    alert("Button DOUBLE-clicked!");
});



