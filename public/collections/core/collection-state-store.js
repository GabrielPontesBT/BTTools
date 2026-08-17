(function bootstrapCollectionStateStore(global) {
  'use strict';

  /**
   * Centraliza el estado de trabajo del builder y encapsula las reglas
   * base del dominio de escenarios/nodos para que el resto de la UI
   * opere con nombres claros y sin duplicar lógica estructural.
   */
  class CollectionStateStore {
    /**
     * Recibe la referencia al objeto de estado compartido del builder.
     * No clona nada: trabaja sobre el mismo objeto para que toda la UI
     * vea los cambios en tiempo real.
     */
    constructor(state) {
      this.state = state;
    }

    /**
     * Crea un nuevo escenario con todos los contenedores auxiliares listos.
     * Esto evita tener que preguntar en toda la app si una propiedad existe o no.
     */
    createScenario(name) {
      // Se incrementa el contador central para generar ids estables y únicos.
      var ordinal = this.state.nextScenarioId++;
      return {
        id: 'scenario_' + ordinal,
        name: name || ('Caso de uso ' + ordinal),
        items: [],
        connections: [],
        connectionsTouched: false,
        pendingConnectionFromId: '',
        selectedItemIndex: -1,
        previewVariables: [],
        previewOutputs: [],
        previewMappings: [],
        variableOverrides: {},
        inputMappings: {},
        inputAliases: {},
        outputAliases: {},
        repeatableOverrides: {}
      };
    }

    /**
     * Garantiza que cada ítem del flujo tenga un identificador técnico único.
     * Ese id se usa para canvas, conexiones y selección interna.
     */
    ensureItemNodeId(item) {
      if (!item) return '';
      // Solo se crea el id la primera vez; luego se reutiliza siempre el mismo.
      if (!item.nodeId) item.nodeId = 'node_' + (this.state.nextNodeId++);
      return item.nodeId;
    }

    /**
     * Define la posición inicial de un nodo cuando todavía no fue movido por el usuario.
     * Se reparte en una grilla simple para que el flujo no nazca encimado.
     */
    defaultNodeLayout(index) {
      var safeIndex = typeof index === 'number' && index >= 0 ? index : 0;
      return {
        x: 54 + ((safeIndex % 2) * 420),
        y: 42 + (Math.floor(safeIndex / 2) * 190)
      };
    }

    /**
     * Asegura que un ítem tenga coordenadas válidas de layout.
     * Si no existen, asigna la posición por defecto.
     */
    ensureItemLayout(item, index) {
      if (!item) return this.defaultNodeLayout(index);
      // Primero garantizamos el id porque el layout y el nodo siempre viajan juntos.
      this.ensureItemNodeId(item);
      if (!item.layout || typeof item.layout.x !== 'number' || typeof item.layout.y !== 'number') {
        item.layout = this.defaultNodeLayout(index);
      }
      return item.layout;
    }

    /**
     * Normaliza la colección de conexiones de un escenario.
     * El objetivo es dejar solo enlaces válidos entre nodos existentes.
     */
    ensureScenarioConnections(scenario) {
      if (!scenario) return [];
      if (!Array.isArray(scenario.connections)) scenario.connections = [];

      var validIds = {};
      // Se arma un mapa rápido de ids existentes para validar cada conexión.
      (scenario.items || []).forEach(function collectNodeIds(item) {
        validIds[this.ensureItemNodeId(item)] = true;
      }, this);

      // Se eliminan conexiones rotas, incompletas o que se apunten a sí mismas.
      scenario.connections = scenario.connections.filter(function filterInvalidConnections(connection) {
        return connection &&
          validIds[connection.fromId] &&
          validIds[connection.toId] &&
          connection.fromId !== connection.toId;
      });

      if (typeof scenario.pendingConnectionFromId !== 'string') scenario.pendingConnectionFromId = '';
      if (typeof scenario.connectionsTouched !== 'boolean') scenario.connectionsTouched = false;

      // Si el usuario todavía no tocó las conexiones, se genera un flujo lineal por defecto.
      if (!scenario.connections.length && !scenario.connectionsTouched && Array.isArray(scenario.items) && scenario.items.length > 1) {
        for (var i = 0; i < scenario.items.length - 1; i++) {
          scenario.connections.push({
            fromId: this.ensureItemNodeId(scenario.items[i]),
            toId: this.ensureItemNodeId(scenario.items[i + 1])
          });
        }
      }

      return scenario.connections;
    }

    /**
     * Devuelve el escenario marcado como activo por la UI.
     * Si el id activo ya no existe, usa el primero disponible.
     */
    getActiveScenario() {
      var activeId = this.state.activeScenarioId;
      for (var i = 0; i < this.state.scenarios.length; i++) {
        if (this.state.scenarios[i].id === activeId) return this.state.scenarios[i];
      }
      return this.state.scenarios[0] || null;
    }

    /**
     * Garantiza que exista al menos un escenario para trabajar.
     * El builder nunca debería quedar sin contexto de escenario activo.
     */
    ensureScenario() {
      if (!this.state.scenarios.length) {
        // Se crea un escenario inicial para que la pantalla arranque utilizable.
        var scenario = this.createScenario('Caso de uso 1');
        this.state.scenarios.push(scenario);
        this.state.activeScenarioId = scenario.id;
      }
      if (!this.getActiveScenario()) {
        // Si el activo desapareció por alguna operación previa, se apunta al primero.
        this.state.activeScenarioId = this.state.scenarios[0].id;
      }
    }
  }

  global.BTCollectionModules = global.BTCollectionModules || {};
  global.BTCollectionModules.CollectionStateStore = CollectionStateStore;
})(window);
