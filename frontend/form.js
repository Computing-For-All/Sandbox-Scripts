// NOTE: This could be migrated to script.js, but placed here temporarily for compartmentalization of scripts
let form = document.querySelector('#editForm');
let levels = document.querySelectorAll('#classLevels');
let button = document.querySelector('#generateButton');
let content = document.querySelector('#generatedLevels');
let submit = document.querySelector('#submitBtn');

let levelsArray = [];

// Takes user input from class levels (comma separated) and generates fields for each level
function generateLevels(e) {
    e.preventDefault();
    levelsArray = levels[0].value.split(',');
    console.log(levelsArray);

    content.innerHTML = '';
    for(let i = 0; i < levelsArray.length; i++) {
        content.innerHTML += 
        `<div class="mb-3">
            <label for="exampleFormControlTextarea1" class="form-label">${levelsArray[i]}</label>
            <textarea class="form-control" id="class${levelsArray[i]}" rows="3" placeholder="Comma separated list of students"></textarea>
        </div>`;
    }
}

button.addEventListener('click', generateLevels);

// TODO: Submit button logic not made, this may be best to incorporate with the script.js for output