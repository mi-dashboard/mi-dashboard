// ---------------- AUTOS ----------------

let graficaAutos;

fetch("autos.csv")
  .then(res => res.text())
  .then(data => {

    const filas = data.split("\n").slice(1);
    let datos = [];

    filas.forEach(fila => {
      const [tipo, cantidad] = fila.split(",");
      if (tipo && cantidad) {
        datos.push({ tipo, cantidad: parseInt(cantidad) });
      }
    });

    const tabla = document.getElementById("tabla-autos");
    const filtro = document.getElementById("filtro-tipo");
    const kpi = document.querySelector(".kpi-number");

    // KPI automático
    const totalGeneral = datos.reduce((acc, item) => acc + item.cantidad, 0);
    kpi.textContent = totalGeneral;

    // llenar filtro
    datos.forEach(item => {
      const option = document.createElement("option");
      option.value = item.tipo;
      option.textContent = item.tipo;
      filtro.appendChild(option);
    });

    function renderAutos(filtroSeleccionado) {

      tabla.innerHTML = `
        <tr>
          <th>TIPO</th>
          <th>CANTIDAD</th>
          <th>SHARE</th>
        </tr>
      `;

      let datosFiltrados = datos;

      if (filtroSeleccionado !== "todos") {
        datosFiltrados = datos.filter(d => d.tipo === filtroSeleccionado);
      }

      const total = datosFiltrados.reduce((acc, item) => acc + item.cantidad, 0);

      let labels = [];
      let valores = [];

      datosFiltrados.forEach(item => {

        const fila = document.createElement("tr");
        const share = ((item.cantidad / total) * 100).toFixed(0) + "%";

        fila.innerHTML = `
          <td>${item.tipo}</td>
          <td>${item.cantidad}</td>
          <td>${share}</td>
        `;

        tabla.appendChild(fila);

        labels.push(item.tipo);
        valores.push(item.cantidad);
      });

      const ctx = document.getElementById("graficaAutos").getContext("2d");

      if (graficaAutos) graficaAutos.destroy();

      graficaAutos = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Autos",
            data: valores,
            backgroundColor: ["#0F6D63","#2BB673","#F4C542","#1f2937","#9ca3af"]
          }]
        }
      });
    }

    filtro.addEventListener("change", (e) => {
      renderAutos(e.target.value);
    });

    renderAutos("todos");
  });


// ---------------- CIUDAD ----------------

fetch("ciudad.csv")
  .then(res => res.text())
  .then(data => {

    const filas = data.split("\n").slice(1);
    let total = 0;
    let datos = [];

    filas.forEach(fila => {
      const [ciudad, cantidad] = fila.split(",");
      if (ciudad && cantidad) {
        const num = parseInt(cantidad);
        datos.push({ ciudad, cantidad: num });
        total += num;
      }
    });

    const tabla = document.getElementById("tabla-ciudad");

    datos.forEach(item => {

      const fila = document.createElement("tr");
      const share = ((item.cantidad / total) * 100).toFixed(0) + "%";

      fila.innerHTML = `
        <td>${item.ciudad}</td>
        <td>${item.cantidad}</td>
        <td>${share}</td>
      `;

      tabla.appendChild(fila);
    });
  });


// ---------------- PLATAFORMA (CSV REAL) ----------------

let graficaPlataforma;

fetch("plataforma.csv")
  .then(res => res.text())
  .then(data => {

    const filas = data.split("\n").slice(1);

    let datos = [];
    let total = 0;

    filas.forEach(fila => {
      const [plataforma, cantidad] = fila.split(",");
      if (plataforma && cantidad) {
        const num = parseInt(cantidad);
        datos.push({ plataforma, cantidad: num });
        total += num;
      }
    });

    const tabla = document.getElementById("tabla-plataforma");

    let labels = [];
    let valores = [];
    let colores = [];

    datos.forEach(item => {

      const fila = document.createElement("tr");
      const share = ((item.cantidad / total) * 100).toFixed(0) + "%";

      fila.innerHTML = `
        <td>${item.plataforma}</td>
        <td>${item.cantidad}</td>
        <td>${share}</td>
      `;

      tabla.appendChild(fila);

      labels.push(item.plataforma);
      valores.push(item.cantidad);

      if (item.plataforma === "Uber") {
        colores.push("#000000");
      } else if (item.plataforma === "DiDi") {
        colores.push("#FF6A00");
      } else {
        colores.push("#6b7280");
      }
    });

    const ctx = document.getElementById("graficaPlataforma").getContext("2d");

    graficaPlataforma = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: valores,
          backgroundColor: colores
        }]
      }
    });

  });