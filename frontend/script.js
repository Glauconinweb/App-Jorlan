document.addEventListener("DOMContentLoaded", () => {
  const addExercicioBtn = document.getElementById("add-exercicio");
  const exerciciosLista = document.getElementById("exercicios-lista");
  let exercicioCount = 0;

  addExercicioBtn.addEventListener("click", () => {
    exercicioCount++;

    // 1. Criar o container do exercício
    const exercicioDiv = document.createElement("div");
    exercicioDiv.classList.add("exercicio-item");
    exercicioDiv.id = `exercicio-${exercicioCount}`;

    // 2. Adicionar os inputs
    exercicioDiv.innerHTML = `
            <h3>Exercício #${exercicioCount}</h3>
            <label>Nome:</label>
            <input type="text" placeholder="Ex: Agachamento Livre">
            
            <label>Séries:</label>
            <input type="number" value="3" min="1">
            
            <label>Repetições:</label>
            <input type="text" value="8-12" placeholder="Ex: 8-12 ou 10">
            
            <label>Obs:</label>
            <input type="text" placeholder="Ex: Carga 80% de 1RM">
            
            <button class="remover-exercicio" data-id="${exercicioCount}">Remover</button>
            <hr>
        `;

    // 3. Inserir na lista
    exerciciosLista.appendChild(exercicioDiv);
  });

  // 4. Lógica de remover (Opcional, mas útil para o teste)
  exerciciosLista.addEventListener("click", (e) => {
    if (e.target.classList.contains("remover-exercicio")) {
      const id = e.target.getAttribute("data-id");
      const elementToRemove = document.getElementById(`exercicio-${id}`);
      if (elementToRemove) {
        elementToRemove.remove();
      }
    }
  });

  // DICA: Adicione um console.log ou alerta simples para mostrar que "enviou"
  // Pode ser um botão "Gerar Planilha" que simplesmente pega os dados e mostra no console.
});
