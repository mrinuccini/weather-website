// La position choisit par l'utilisateur
let currentPosition = {
    'lat': 48.51,
    'lon': 2.20
};

// Les jours de la semaine (nombre -> string)
const days = {
    '0': 'Dim',
    '1': 'Lun',
    '2': 'Mar',
    '3': 'Mer',
    '4': 'Jeu',
    '5': 'Ven',
    '6': 'Sam'
};

// Les mois de l'année (nombre -> string)
const months = {
    '1': 'Janv',
    '2': 'Févr',
    '3': 'Mars',
    '4': 'Avr',
    '5': 'Mai',
    '6': 'Juin',
    '7': 'Juillet',
    '8': 'Août',
    '9': 'Sept',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Déc',
};

// On traduit la qualité de l'air en un nombre
const airQuality = {
    1: 'Très bonne 👍',
    2: 'Bonne 👍',
    3: 'Médiocre',
    4: 'Mauvaise 👎',
    5: 'Très mauvaise 👎',
};

// Quand le document est pret on demande a l'utilisateur pour la géolocalisation
$(function(){
    // On récupère l'image du jour de la NASA
    FetchDailyImage().then((result) => {
        console.log(result);
        document.getElementById("dailyImage").src = result["url"];
        document.getElementById("dailyImageTitle").innerHTML = result["title"]
        document.getElementById("dailyImageDescription").innerHTML = result["explanation"];
    });

    // Si le naviguateur supporte la géolocalisation
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(position) // On récupère la position de l'utilisateur
        {
            currentPosition['lon'] = position.coords.longitude;
            currentPosition['lat'] = position.coords.latitude;
        }, function() // si il y a une erreur, on informe l'utilisateur
        {
            console.log("There was an error trying to geolocate user.");
        }); 
     }
    
    // Change le label du jour pour avoir la bonne date
    let currentDate = new Date();

    console.log(currentDate.getDay());
    output = currentDate.getHours() + ':' + currentDate.getMinutes() + ', ' + days[currentDate.getDay()] + ', ' + months[currentDate.getMonth() + 1] + ' ' + currentDate.getDate() + ', ' + currentDate.getFullYear();

    document.getElementById("mainDate").innerHTML = output;
});

// Récupère la longitude et la latitude d'une ville en fonction de son nom
var FetchCoordinates = async function(cityName) {
    // On envoie les données a openweathermap
    const response = await fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&appid=c60390ff5c695b66c5030487969cc117', {
        method: 'GET'
    })
    
    // On lit et renvoie la réponse
    const responseJSON = await response.json();
    return responseJSON;
}

// Pour récupérer la météo a partir de la position de l'utilisateur
var FetchWeather = async function () {
    // On appelle l'API pour récupérer la météo
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + currentPosition["lat"] + '&lon=' + currentPosition["lon"] + '&units=metric&appid=c60390ff5c695b66c5030487969cc117&lang=fr', {
        method: 'GET',
    });

    // On renvoie le JSON contenant les info météo de base
    const weatherJSON = await response.json();
    return weatherJSON;
}

// Pour récupérer la pollution de l'air a partir de la positon de l'utilisateur
var FetchPollution = async function() {
    // On appelle l'API pour récupérer la pollution
    const response = await fetch('http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=' + currentPosition["lat"] + '&lon=' + currentPosition["lon"] + '&units=metric&appid=c60390ff5c695b66c5030487969cc117&lang=fr', {
        method: 'GET',
    });

    // On renvoie le JSON contenant les info de pollution
    const pollutionJSON = await response.json();
    return pollutionJSON;
}

// Pour récupérer l'image du jour de la NASA
var FetchDailyImage = async function()
{
    // On appelle l'API pour récupérer l'image du jour
    const response = await fetch('https://api.nasa.gov/planetary/apod?' + 'api_key=Qhp5HR7zs4NASV5vvIsWO5NYTXQDBczGqeraW3ay', {
        method: 'GET',
    });

    // On renvoie le JSON avec l'image, son titre et sa description
    const dailyImageJSON = await response.json();
    return dailyImageJSON;
}

// When the search button is clicked
function UpdateWeather()
{
    console.log("Started fetching process...");
    // Update the position label
    document.getElementById("currentPosition").innerHTML = "📍 " + document.getElementById("cityInput").value;

    // update the currentPosition and fetch the weather
    FetchCoordinates(document.getElementById("cityInput").value).then((result) => {
        console.log("Fetched coordinates...");
        currentPosition["lat"] = result[0]["lat"]
        currentPosition["lon"] = result[0]["lon"]

        // Fetch the weather using the coordinates we got from the user
        FetchWeather().then((result) => {   
            console.log("Fetched weather..."); 
            console.log(result);

            document.getElementById("tempText").innerHTML = result["main"]["temp"] + '°C';
            let weatherDescription = result["weather"][0]["description"]
            weatherDescription = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
            document.getElementById("weatherDescription").innerHTML = weatherDescription
            document.getElementById("weatherIcon").src = "http://openweathermap.org/img/wn/" + result["weather"][0]["icon"] + "@2x.png"
            document.getElementById("frogImage").src = "assets/Frog/" + result["weather"][0]["icon"] + ".jpg";
            
            document.getElementById("ressenti").innerHTML = result["main"]["feels_like"] + '°C';
            document.getElementById("min-temp").innerHTML = result["main"]["temp_min"] + '°C';
            document.getElementById("max-temp").innerHTML = result["main"]["temp_max"] + '°C';
            document.getElementById("humidity").innerHTML = result["main"]["humidity"] + '%';
            document.getElementById("wind-speed").innerHTML = result["wind"]["speed"] + 'km/h';

            //Generate the graphs
            GenerateGraphs(result);
        });

        // Fetch The Pollution Data
        FetchPollution().then((pollutionResult) => {
            let airPollutionList = pollutionResult["list"][0];

            document.getElementById("carbonMonoxydeLevel").innerHTML = airPollutionList["components"]["co"] + "µg/m3";
            document.getElementById("azoteMonoxydeLevel").innerHTML = airPollutionList["components"]["no"] + "µg/m3";
            document.getElementById("dioxydeAzoteLevel").innerHTML = airPollutionList["components"]["no2"] + "µg/m3";
            document.getElementById("ozoneLevel").innerHTML = airPollutionList["components"]["o3"] + "µg/m3";

            document.getElementById("dioxydeDeSoufreLevel").innerHTML = airPollutionList["components"]["so2"] + "µg/m3";
            document.getElementById("pm25Level").innerHTML = airPollutionList["components"]["pm2_5"] + "µg/m3";
            document.getElementById("pm10Level").innerHTML = airPollutionList["components"]["pm10"] + "µg/m3";
            document.getElementById("ammoniacLevel").innerHTML = airPollutionList["components"]["nh3"] + "µg/m3";

            document.getElementById("airQuality").innerHTML = airPollutionList["main"]["aqi"];
            document.getElementById("airQualityDescription").innerHTML = airQuality[airPollutionList["main"]["aqi"]];
        });
    });

    console.log("Fetching process compleated..."); 
}

// Use to generate the graphs at the "Données Avancées" scection
function GenerateGraphs(weatherJSON)
{
    /* Update the Humidity Graph */
    var dashboardChart = new Chart("humidityChart", {
        type: 'doughnut',
        data: {
            labels: ["", ""],
            datasets: [{
                data: [weatherJSON["main"]["humidity"], 100-weatherJSON["main"]["humidity"]],
                backgroundColor: [
                    '#D55534',
                    '#83B4B3',
                ]
            }],
            borderWidth: 5
        },
        options: {
            rotation: 1 * Math.PI,            
            circumference: 1 * Math.PI,
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            },
            cutoutPercentage: 80,
            maintainAspectRatio: false,
        }
    });

    document.getElementById("humidityChartLevel").innerHTML = weatherJSON["main"]["humidity"] + '%';
    document.getElementById("humidityChartLevelDescription").innerHTML = 60 >= Number(weatherJSON["main"]["humidity"]) && Number(weatherJSON["main"]["humidity"]) >= 40 ? "Bon 👍" : "Mauvaise 👎";

    /* Updated the wind Graph */
    let degres = [];
    let values = [];
    for(var deg = 0; deg <= 360; deg++)
    {
        if(weatherJSON["wind"]["deg"] == deg)
        {
            degres.push(String(deg) + "°");
            values.push(weatherJSON["wind"]["speed"]);
        }else
        {
            degres.push("");
            values.push(0);
        }
    }


    var dashboardChart = new Chart("windChart", {
        type: 'radar',
        data: {
            labels: degres,
            datasets: [{
                data: values,
                backgroundColor: '#D55534',
                borderColor: "#83B4B3"
            }]
        },
        options: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            },
            cutoutPercentage: 80,
            maintainAspectRatio: false,
        }
    });

    document.getElementById("windChartInfo").innerHTML = weatherJSON["wind"]["speed"] + 'km/h';

    /* Update the visibility Graph and Description */
    var dashboardChart = new Chart("visibilityChart", {
        type: 'doughnut',
        data: {
            labels: ["", ""],
            datasets: [{
                data: [weatherJSON["visibility"], 10000-weatherJSON["visibility"]],
                backgroundColor: [
                    '#D55534',
                    '#83B4B3',
                ]
            }],
            borderWidth: 5
        },
        options: {
            rotation: 1 * Math.PI,            
            circumference: 1 * Math.PI,
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            },
            cutoutPercentage: 80,
            maintainAspectRatio: false,
        }
    });

    document.getElementById("visibilityChartLevel").innerHTML = weatherJSON["visibility"] / 1000 + 'km';

    if(weatherJSON["visibility"] > 8000)
    {
        document.getElementById("visibilityChartLevelDescription").innerHTML = "Excellente 👍";
    }else if(weatherJSON["visibility"] > 6000)
    {
        document.getElementById("visibilityChartLevelDescription").innerHTML = "Bonne 👍";
    }else if(weatherJSON["visibility"] > 4000)
    {
        document.getElementById("visibilityChartLevelDescription").innerHTML = "Médiocre";
    }else if(weatherJSON["visibility"] > 2000)
    {
        document.getElementById("visibilityChartLevelDescription").innerHTML = "Mauvaise 👎";
    }else
    {
        document.getElementById("visibilityChartLevelDescription").innerHTML = "Très Mauvaise 👎";
    }

    let sunRise = new Date(weatherJSON["sys"]["sunrise"] * 1000);
    let sunSet = new Date(weatherJSON["sys"]["sunset"]* 1000);

    /* Set the sunset and sun rise time */
    document.getElementById("sunRiseTime").innerHTML = sunRise.getHours() + ":" + sunRise.getMinutes();
    document.getElementById("sunSetTime").innerHTML = sunSet.getHours() + ":" + sunSet.getMinutes();
}