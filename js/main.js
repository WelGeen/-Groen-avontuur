const input = document.querySelector("#file");
const body = document.querySelector("body");
const title_elem_review = document.querySelector(".result");
const title_elem_information = document.querySelector("#result");
const description_elem = document.querySelector("#description");
const image = document.getElementById("output");
const submitButton = document.getElementById("submit");
const wrongAnswer = document.getElementById("wrongAnswer");

// Door dit event kun je afbeelding laten zien na toevoegen afbeelding
var loadFile = function (event) {
    image.src = URL.createObjectURL(event.target.files[0]);
};

// Functie die begint wanneer het input veld #file veranderd
input.addEventListener("change", () => {
    title_elem_review.innerHTML = "Naam laden...";
    const file = input.files[0];

    var formdata = new FormData();
    formdata.append("image", file);

    var requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
    };

    // Connectie maken met de API
    fetch("https://identify.biodiversityanalysis.nl/v1/observation/identify", requestOptions)
        .then((response) => response.json())
        .then((data) => {
            body.classList.add("active-review");
            var name = getWikipediaData(data.predictions[0].taxon.name);
        })
        .catch((error) => console.log("error", error));
});

// Naam die uit de API van biodiversityanalysis komt naar het nederlands vertalen
function getWikipediaData(search) {
    var api = "https://nl.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro&explaintext&redirects=1&titles=" + search;
    fetch(api)
        .then((response) => response.json())
        .then((response) => {
            response = response.query.pages;
            var pageid = Object.keys(response)[0];
            var title = response[pageid].title;
            title_elem_review.innerHTML = title;
            title_elem_information.innerHTML = title;
        })
        .catch((error) => console.log("error", error));
}

// Functie om een beschrijving op te halen aan de hand van de naam die komt uit de eerder gemaakte foto
function generateDescription(title) {
    // Tijdelijke laad tekst toevoegen
    document.getElementById("description").innerHTML = "Beschrijving laden...";
    const prompt = `Geeft een korte samenvatting van 100 tekens van ${title}.`;
    fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer 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",
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            // prompt: prompt,
            temperature: 1,
            max_tokens: 1000,
            n: 1,
            // stop: ["\n"],
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        }),
    })
        .then((data) => {
            return data.json();
        })
        .then((data) => {
            // Laad tekst weghalen en nieuwe content plaatsen
            document.getElementById("description").innerHTML = " ";
            document.getElementById("description").innerHTML = data.choices[0]["message"]["content"];
        })
        .catch((error) => console.log("error", error));
}

// Functie om een vraag op te halen aan de hand van de naam die komt uit de eerder gemaakte foto
function generateQuestions(extract) {
    // Tijdelijke laad tekst toevoegen
    document.getElementById("answers").innerHTML = "Vraag bedenken...";
    const prompt = `Maak een educative vraag voor kinderen over ${extract} tussen de 6 en 12 jaar. Het moet een multiple choice zijn. Geef dit terug op de volgende manier:<h2>{De vraag}</h2><ul><li> <label id="a_text"><input type="radio" name="answer" value="a" class="answer" />{Antwoord}</label></li><li><label id="b_text"><input type="radio" name="answer" value="b" class="answer" />{Antwoord}</label></li><li><label id="c_text"><input type="radio" name="answer" value="c" class="answer" />{Antwoord}</label></li><li><label id="d_text"><input type="radio" name="answer" value="d" class="answer" />{Antwoord}</label></li><span id="correct-answer" class="display-none" data-answer="{Letter van het juiste antwoord}"></span></ul>`;
    fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer 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",
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            // prompt: prompt,
            temperature: 1,
            max_tokens: 1000,
            n: 1,
            // stop: ["\n"],
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        }),
    })
        .then((data) => {
            return data.json();
        })
        .then((data) => {
            // Laad tekst weghalen en nieuwe content plaatsen
            document.getElementById("answers").innerHTML = "";
            // Button klikbaar maken
            submitButton.classList.add("visible");
            document.getElementById("answers").innerHTML = data.choices[0]["message"]["content"];
        })
        .catch((error) => console.log("error", error));
}

// Functie die door alle "Antwoorden" heen loopt om en kijkt welke geselecteerd is
const getSelected = () => {
    var radios = document.getElementsByName("answer");
    var result = "";
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            // De value van het geselecteerde antwood doorsturen naar de andere functie
            result = radios[i].value;
            break;
        }
    }
    return result;
};

// Juiste antwoord ophalen uit de span
const getAnswer = () => {
    var span = document.getElementById("correct-answer");
    var answer = "";
    answer = span.getAttribute("data-answer");
    return answer;
};

// Bij een klik op de antwoord opslaan button het anwoord vergelijken met het geselecteede antwoord
submitButton.addEventListener("click", () => {
    const selectedAnswer = getSelected();
    const answer = getAnswer();
    if (selectedAnswer) {
        if (answer == selectedAnswer) {
            // Bij succes een succes pagina tonen
            wrongAnswer.classList.remove("visible");
            document.body.classList.remove("active-question");
            document.body.classList.add("active-correct");
        } else {
            // Bij falen een placholder tekst tonen
            wrongAnswer.classList.add("visible");
        }
    }
});

// Klikken op de prev button
document.getElementById("save").addEventListener("click", function () {
    document.body.classList.remove("active-review");
    title = title_elem_review.innerHTML;
    generateDescription(title);
    document.body.classList.add("active-information");
});

document.getElementById("gotoquestion").addEventListener("click", function () {
    document.body.classList.remove("active-information");
    title = title_elem_review.innerHTML;
    generateQuestions(title);
    document.body.classList.add("active-question");
});

document.getElementById("prev-review").addEventListener("click", function () {
    document.body.classList.remove("active-review");
});

document.getElementById("prev-information").addEventListener("click", function () {
    document.body.classList.remove("active-information");
    document.body.classList.add("active-review");
});

document.getElementById("prev-question").addEventListener("click", function () {
    document.body.classList.remove("active-question");
    document.body.classList.add("active-information");
});

document.getElementById("prev-correct").addEventListener("click", function () {
    document.body.classList.remove("active-correct");
});

document.getElementById("tohome").addEventListener("click", function () {
    document.body.classList.remove("active-correct");
});

// Functie om de grootte van de pagina te controleren en de klasse toe te voegen
function checkPageSize() {
    var pageSize = window.innerWidth || document.documentElement.clientWidth;
    var activeAlert = document.querySelector(".active-alert");
    if (pageSize > 1024) {
        body.className = "";
        document.body.classList.add("active-alert");
    } else {
        document.body.classList.remove("active-alert");
    }
}

// Bij het laden van de pagina
window.addEventListener("load", checkPageSize);

// Bij het wijzigen van de grootte van de pagina
window.addEventListener("resize", checkPageSize);
