// Total number of Pokémon to be loaded
const pokemonCount = 1008;
// Number of Pokémon to load per batch
const pokemonPerLoad = 537;
// Object to store all loaded Pokémon data
var pokedex = {};
// Keep track of how many Pokémon have been loaded
var currentLoadedCount = 0;

// Function that runs when the window finishes loading
window.onload = async function() 
{
    // Load the first batch of Pokémon
    await loadMorePokemon();
    
    // Log the loaded Pokémon data to the console
    console.log(pokedex);
}

// Function to load more Pokémon
async function loadMorePokemon()
{
    // Calculate the range of Pokémon to load
    let start = currentLoadedCount + 1;
    let end = Math.min(start + pokemonPerLoad - 1, pokemonCount);
    
    // Add loading indicator
    let loadingIndicator = document.createElement("p");
    loadingIndicator.id = "loading-indicator";
    loadingIndicator.innerText = "Loading...";
    document.getElementById("pokemon-list").appendChild(loadingIndicator);
    
    // Fetch the Pokémon data
    await getPokemonBulk(start, end);
    
    // Remove loading indicator
    document.getElementById("loading-indicator").remove();
    
    // Create and append DOM elements for each loaded Pokémon
    for (let i = start; i <= end; i++) {
        let pokemon = document.createElement("div");
        pokemon.id = i;
        pokemon.innerText = i.toString() + ". " + pokedex[i]["name"].toUpperCase();
        pokemon.classList.add("pokemon-name");
        pokemon.addEventListener("click", updatePokemon);
        document.getElementById("pokemon-list").append(pokemon);
    }
    
    // If this is the first load, set the initial Pokémon description
    if (currentLoadedCount === 0) {
        document.getElementById("pokemon-description").innerText = pokedex[1]["desc"];
        updatePokemon.call(document.getElementById("1"));
    }
    
    // Update the count of loaded Pokémon
    currentLoadedCount = end;
    
    // Manage the "Load More" button
    let loadMoreButton = document.getElementById("load-more-button");
    if (currentLoadedCount < pokemonCount) {
        if (!loadMoreButton) {
            loadMoreButton = document.createElement("button");
            loadMoreButton.id = "load-more-button";
            loadMoreButton.innerText = "Load More";
            loadMoreButton.addEventListener("click", loadMorePokemon);
        }
        document.getElementById("pokemon-list").appendChild(loadMoreButton);
    } else if (loadMoreButton) {
        loadMoreButton.remove();
    }

    // Scroll to show the newly added Pokémon
    let pokemonList = document.getElementById("pokemon-list");
    pokemonList.scrollTop = pokemonList.scrollHeight - pokemonList.clientHeight;
}

async function getPokemonBulk(start, end)
{
    // Create an array of promises for fetching Pokémon data
    let promises = [];
    for (let i = start; i <= end; i++) {
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`));
    }
    
    try {
        // Wait for all promises to resolve
        let responses = await Promise.all(promises);
        
        // Check if any response is not ok
        for (let response of responses) {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        let pokemons = await Promise.all(responses.map(res => res.json()));
        
        // Create an array of promises for fetching Pokémon descriptions
        let descPromises = pokemons.map(pokemon => fetch(pokemon.species.url));
        let descResponses = await Promise.all(descPromises);
        
        // Check if any description response is not ok
        for (let response of descResponses) {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        let descriptions = await Promise.all(descResponses.map(res => res.json()));
        
        // Process the fetched data and store it in the pokedex object
        for (let i = 0; i < pokemons.length; i++) {
            let pokemon = pokemons[i];
            let description = descriptions[i];
            
            let pokemonName = pokemon.name;
            let pokemonType = pokemon.types;
            let pokemonImg = pokemon.sprites.front_default;
            let pokemonDesc = description.flavor_text_entries[0].flavor_text;
            
            pokedex[pokemon.id] = {
                "name": pokemonName, 
                "img": pokemonImg, 
                "types": pokemonType, 
                "desc": pokemonDesc
            };
        }
    } catch (error) {
        console.error("Failed to fetch Pokémon data:", error);
        alert("Failed to load Pokémon data. Please try again later.");
        
        // Remove the loading indicator if it exists
        let loadingIndicator = document.getElementById("loading-indicator");
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Revert the currentLoadedCount
        currentLoadedCount = start - 1;
    }
}

// Function to update the displayed Pokémon information
function updatePokemon() {
    // Update the Pokémon image
    document.getElementById("pokemon-img").src = pokedex[this.id]["img"];

    // Clear previous type information
    let typesDiv = document.getElementById("pokemon-types");
    typesDiv.innerHTML = '';

    // Add new type information
    let types = pokedex[this.id]["types"];
    for (let i = 0; i < types.length; i++)
    {
        let type = document.createElement("span");
        type.innerText = types[i]["type"]["name"].toUpperCase();
        type.classList.add("type-box");
        type.classList.add(types[i]["type"]["name"]);
        typesDiv.append(type);
    }

    // Update the Pokémon description
    document.getElementById("pokemon-description").innerText = pokedex[this.id]["desc"];
}