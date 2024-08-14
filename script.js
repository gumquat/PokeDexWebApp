const pokemonCount = 1008;
const pokemonPerLoad = 504;
var pokedex = {};
var currentLoadedCount = 0;

window.onload = async function() 
{
    await loadMorePokemon();
    
    console.log(pokedex);
}

async function loadMorePokemon()
{
    let start = currentLoadedCount + 1;
    let end = Math.min(start + pokemonPerLoad - 1, pokemonCount);
    
    // Add loading indicator
    let loadingIndicator = document.createElement("p");
    loadingIndicator.id = "loading-indicator";
    loadingIndicator.innerText = "Loading...";
    document.getElementById("pokemon-list").appendChild(loadingIndicator);
    
    await getPokemonBulk(start, end);
    
    // Remove loading indicator
    document.getElementById("loading-indicator").remove();
    
    for (let i = start; i <= end; i++) {
        let pokemon = document.createElement("div");
        pokemon.id = i;
        pokemon.innerText = i.toString() + ". " + pokedex[i]["name"].toUpperCase();
        pokemon.classList.add("pokemon-name");
        pokemon.addEventListener("click", updatePokemon);
        document.getElementById("pokemon-list").append(pokemon);
    }
    
    if (currentLoadedCount === 0) {
        document.getElementById("pokemon-description").innerText = pokedex[1]["desc"];
        updatePokemon.call(document.getElementById("1"));
    }
    
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
    let promises = [];
    for (let i = start; i <= end; i++) {
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`));
    }
    let responses = await Promise.all(promises);
    let pokemons = await Promise.all(responses.map(res => res.json()));
    
    let descPromises = pokemons.map(pokemon => fetch(pokemon.species.url));
    let descResponses = await Promise.all(descPromises);
    let descriptions = await Promise.all(descResponses.map(res => res.json()));
    
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
}

function updatePokemon() {
    document.getElementById("pokemon-img").src = pokedex[this.id]["img"];

    let typesDiv = document.getElementById("pokemon-types");
    typesDiv.innerHTML = '';

    let types = pokedex[this.id]["types"];
    for (let i = 0; i < types.length; i++)
    {
        let type = document.createElement("span");
        type.innerText = types[i]["type"]["name"].toUpperCase();
        type.classList.add("type-box");
        type.classList.add(types[i]["type"]["name"]);
        typesDiv.append(type);
    }

    document.getElementById("pokemon-description").innerText = pokedex[this.id]["desc"];
}