let graficaAutos;
let graficaPlataforma;
let graficaDiaria;

const META = 454;

// 🎨 COLORES VEMO
const COLORES = {
  verde: "#0F6D63",
  uber: "#000000",
  didi: "#FF6A00",
  gris: "#6b7280"
};

// 🔥 ANIMACIÓN KPI
function animarValor(id, valorFinal) {
  let actual = 0;
  const duracion = 800;
  const pasos = 40;
  const incremento = valorFinal / pasos;

  const intervalo = setInterval(() => {
    actual += incremento;

    if (actual >= valorFinal) {
      actual = valorFinal;
      clearInterval(intervalo);
    }

    document.getElementById(id).textContent = Math.floor(actual);
  }, duracion / pasos);
}

// 🔥 PARSEADOR ROBUSTO
function parseCSV(text) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map(f => f.split(/[,;]+/).map(c => c.trim()));
}

// ================= ENTREGAS =================
fetch("data.csv")
  .then(r => r.text())
  .then(text => {

    const filas = parseCSV(text).slice(1);
    let dataset = [];

    filas.forEach(col => {
      if (col.length < 4) return;

      const fecha = col[0];
      const ciudad = col[1];
      const auto = col[2] || "Sin dato";
      const plataforma = col[3] || "Otros";

      if (!fecha) return;

      const partes = fecha.split("/");
      if (partes.length !== 3) return;

      const dia = parseInt(partes[0]);

      dataset.push({
        dia,
        ciudad: ciudad.includes("México") ? "CDMX" : ciudad,
        auto,
        plataforma
      });
    });

    const filtroCiudad = document.getElementById("filtro-ciudad");
    const filtroTipo = document.getElementById("filtro-tipo");

    [...new Set(dataset.map(d => d.ciudad))].forEach(c => {
      filtroCiudad.innerHTML += `<option value="${c}">${c}</option>`;
    });

    [...new Set(dataset.map(d => d.auto))].forEach(a => {
      filtroTipo.innerHTML += `<option value="${a}">${a}</option>`;
    });

    function render() {

      let data = dataset;

      if (filtroCiudad.value !== "todos") {
        data = data.filter(d => d.ciudad === filtroCiudad.value);
      }

      if (filtroTipo.value !== "todos") {
        data = data.filter(d => d.auto === filtroTipo.value);
      }

      let autos={}, ciudades={}, plataformas={}, diario={}, total=0;

      data.forEach(d => {
        autos[d.auto]=(autos[d.auto]||0)+1;
        ciudades[d.ciudad]=(ciudades[d.ciudad]||0)+1;
        plataformas[d.plataforma]=(plataformas[d.plataforma]||0)+1;
        diario[d.dia]=(diario[d.dia]||0)+1;
        total++;
      });

      // KPI
      animarValor("kpi-entregas", total);

      document.getElementById("kpi-cumplimiento").textContent =
        total === 0 ? "0%" : ((total/META)*100).toFixed(0)+"%";

      // ================= EVOLUCIÓN DIARIA =================
      const dias = Object.keys(diario).sort((a,b)=>a-b);
      const vals = dias.map(d=>diario[d]);

      if(graficaDiaria) graficaDiaria.destroy();

      graficaDiaria = new Chart(document.getElementById("graficaDiaria"), {
        type:"line",
        data:{
          labels:dias,
          datasets:[{
            data: vals.map(() => 0),
            borderColor: COLORES.verde,
            backgroundColor: COLORES.verde,
            tension: 0.3
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          animation:{ duration:1400, easing:"easeOutCubic" }
        }
      });

      setTimeout(() => {
        graficaDiaria.data.datasets[0].data = vals;
        graficaDiaria.update();
      }, 200);

      // ================= AUTOS =================
      let labels=[], valores=[];
      const tablaAutos = document.getElementById("tabla-autos");
      tablaAutos.innerHTML="<tr><th>TIPO</th><th>CANTIDAD</th><th>SHARE</th></tr>";

      Object.entries(autos).forEach(([k,v])=>{
        const share = total ? ((v/total)*100).toFixed(0)+"%" : "0%";
        tablaAutos.innerHTML+=`<tr><td>${k}</td><td>${v}</td><td>${share}</td></tr>`;
        labels.push(k); 
        valores.push(v);
      });

      if(graficaAutos) graficaAutos.destroy();

      graficaAutos = new Chart(document.getElementById("graficaAutos"), {
        type:"bar",
        data:{
          labels,
          datasets:[{
            data: valores.map(() => 0),
            backgroundColor: COLORES.verde
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          animation:{ duration:1200, easing:"easeOutQuart" }
        }
      });

      setTimeout(() => {
        graficaAutos.data.datasets[0].data = valores;
        graficaAutos.update();
      }, 200);

      // ================= CIUDAD =================
      const tablaCiudad = document.getElementById("tabla-ciudad");
      tablaCiudad.innerHTML="<tr><th>CIUDAD</th><th>CANTIDAD</th><th>SHARE</th></tr>";

      Object.entries(ciudades).forEach(([k,v])=>{
        const share = total ? ((v/total)*100).toFixed(0)+"%" : "0%";
        tablaCiudad.innerHTML+=`<tr><td>${k}</td><td>${v}</td><td>${share}</td></tr>`;
      });

      // ================= PLATAFORMA =================
      let labelsP=[], valoresP=[], coloresP=[];
      const tablaPlat = document.getElementById("tabla-plataforma");
      tablaPlat.innerHTML="<tr><th>PLATAFORMA</th><th>CANTIDAD</th><th>SHARE</th></tr>";

      Object.entries(plataformas).forEach(([k,v])=>{
        const share = total ? ((v/total)*100).toFixed(0)+"%" : "0%";

        tablaPlat.innerHTML+=`
          <tr>
            <td>${k}</td>
            <td>${v}</td>
            <td>${share}</td>
          </tr>
        `;

        labelsP.push(k);
        valoresP.push(v);

        const nombre = k.toLowerCase().trim();

        if (nombre === "uber") coloresP.push(COLORES.uber);
        else if (nombre === "didi") coloresP.push(COLORES.didi);
        else coloresP.push(COLORES.verde);
      });

      if(graficaPlataforma) graficaPlataforma.destroy();

      graficaPlataforma = new Chart(document.getElementById("graficaPlataforma"), {
        type:"pie",
        data:{
          labels:labelsP,
          datasets:[{
            data: valoresP.map(() => 0),
            backgroundColor: coloresP,
            borderColor:"#fff",
            borderWidth:2
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          animation:{ animateRotate:true, duration:1200 }
        }
      });

      setTimeout(() => {
        graficaPlataforma.data.datasets[0].data = valoresP;
        graficaPlataforma.update();
      }, 200);
    }

    filtroCiudad.onchange = render;
    filtroTipo.onchange = render;

    render();
  });


// ================= STOCK =================
fetch("stock.csv")
  .then(r => r.text())
  .then(text => {

    const filas = parseCSV(text).slice(1);

    let libres=0, nuevos=0, usados=0;
    let modN={}, modU={};

    filas.forEach(col=>{
      if(col.length<1) return;

      const placa = col[0] || "";
      const condicion = (col[1]||"").toUpperCase();
      const modelo = col[2] || "";

      if(placa==="LIBRE"){ libres++; return; }
      if(!placa) return;

      if(condicion.includes("NUEVO")){
        nuevos++;
        if(modelo) modN[modelo]=(modN[modelo]||0)+1;
      }
      else if(condicion.includes("USADO")){
        usados++;
        if(modelo) modU[modelo]=(modU[modelo]||0)+1;
      }
    });

    const ocupados = nuevos + usados;
    const totalEspacios = ocupados + libres;
    const ocupacion = totalEspacios ? ((ocupados/totalEspacios)*100).toFixed(0) : 0;

    animarValor("stock-total", ocupados);
    animarValor("stock-nuevos", nuevos);
    animarValor("stock-usados", usados);
    animarValor("stock-libres", libres);

    document.getElementById("stock-ocupacion").textContent = ocupacion+"%";

    const tablaN = document.getElementById("tabla-nuevos");
    tablaN.innerHTML="<tr><th>MODELO</th><th>CANTIDAD</th></tr>";
    Object.entries(modN).forEach(([k,v])=>{
      tablaN.innerHTML+=`<tr><td>${k}</td><td>${v}</td></tr>`;
    });

    const tablaS = document.getElementById("tabla-seminuevos");
    tablaS.innerHTML="<tr><th>MODELO</th><th>CANTIDAD</th></tr>";
    Object.entries(modU).forEach(([k,v])=>{
      tablaS.innerHTML+=`<tr><td>${k}</td><td>${v}</td></tr>`;
    });

  });