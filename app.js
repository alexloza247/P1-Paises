const API = "https://studies.cs.helsinki.fi/restcountries/api";
let paisesActuales = []; 

async function buscarPais(nombre) {
    const url = `${API}/name/${encodeURIComponent(nombre.toLowerCase())}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        if (respuesta.status === 404) throw new Error("No se encontró ningún país con ese nombre.");
        throw new Error(`Error del servidor (código ${respuesta.status}).`);
    }
    const datos = await respuesta.json();
    return [datos]; 
}

async function buscarPorRegion(region) {
    const url = `${API}/all`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("Error al cargar las regiones.");
    
    const todos = await respuesta.json();
    return todos.filter(pais => pais.region === region);
}

function mostrarPaises(paises) {
    const contenedor = document.getElementById("resultados");
    contenedor.innerHTML = "";
    paisesActuales = paises; 
    
    paises.forEach(pais => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";
        tarjeta.title = "Clic para ver idiomas y moneda"; 
        
        tarjeta.innerHTML = `
            <img src="${pais.flags.png}" alt="Bandera de ${pais.name.common}">
            <h3>${pais.name.common}</h3>
            <p><b>Capital:</b> ${pais.capital ? pais.capital[0] : "Sin capital"}</p>
            <p><b>Región:</b> ${pais.region}</p>
            <p><b>Población:</b> ${pais.population.toLocaleString("es-MX")}</p>
        `;

        tarjeta.addEventListener("click", () => {
            const idiomas = pais.languages ? Object.values(pais.languages).join(", ") : "No disponible";
            let monedas = "No disponible";
            if (pais.currencies) {
                monedas = Object.values(pais.currencies).map(m => `${m.name} (${m.symbol})`).join(", ");
            }
            alert(`País: ${pais.name.common}\nIdiomas: ${idiomas}\nMoneda: ${monedas}`);
        });

        contenedor.appendChild(tarjeta);
    });
}

const form = document.getElementById("formBuscar");
const selectRegion = document.getElementById("selRegion");
const btnOrdenar = document.getElementById("btnOrdenar");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("txtPais").value.trim();
    if(!nombre) return;
    
    selectRegion.value = ""; 
    mensaje.textContent = "Cargando...";
    try {
        const paises = await buscarPais(nombre);
        mostrarPaises(paises);
        mensaje.textContent = `${paises.length} resultado(s)`;
    } catch (error) {
        document.getElementById("resultados").innerHTML = "";
        mensaje.textContent = error.message;
    }
});

selectRegion.addEventListener("change", async (e) => {
    const region = e.target.value;
    if (!region) return;
    
    document.getElementById("txtPais").value = ""; 
    mensaje.textContent = "Cargando región...";
    try {
        const paises = await buscarPorRegion(region);
        mostrarPaises(paises);
        mensaje.textContent = `${paises.length} resultado(s) en ${region}`;
    } catch (error) {
        document.getElementById("resultados").innerHTML = "";
        mensaje.textContent = error.message;
    }
});

btnOrdenar.addEventListener("click", () => {
    if (paisesActuales.length === 0) return;
    
    const paisesOrdenados = [...paisesActuales].sort((a, b) => b.population - a.population);
    mostrarPaises(paisesOrdenados);
    mensaje.textContent = "Resultados ordenados por población (mayor a menor).";
});