(function bootstrapCollectionPreviewAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales de variables, mappings y
   * salidas de la preview, invocadas por nombre desde el HTML del panel.
   * Ver la nota de arquitectura en shared/collection-utils-adapter.js.
   */

  /**
   * Claves que la app ya resuelve sola (token, canal, usuario, etc.): no se
   * ofrecen como input mapeable en la preview. Funcion pura, inyectada como
   * callback en CollectionPreviewManager.
   */
  global.collectionIsAutoResolvedKey = function collectionIsAutoResolvedKey(key, pathLabel) {
    var normalized = String(pathLabel || key || '').trim().toLowerCase();
    return [
      'device',
      'usuario',
      'user',
      'userid',
      'username',
      'requerimiento',
      'requirement',
      'canal',
      'channel',
      'token',
      'authorization',
      'idempotency-key',
      'content-type'
    ].indexOf(normalized) >= 0;
  };

  global.collectionVariableValue = function collectionVariableValueAdapter(key, fallback) {
    return global.collectionGetPreviewManager().variableValue(key, fallback);
  };

  global.collectionSelectedItemInputValue = function collectionSelectedItemInputValueAdapter(key, fallback) {
    return global.collectionGetPreviewManager().selectedItemInputValue(key, fallback);
  };

  global.collectionUpdateVar = function collectionUpdateVarAdapter(key, value) {
    global.collectionGetPreviewManager().updateVar(key, value);
  };

  global.collectionSyncInspectorInputs = function collectionSyncInspectorInputsAdapter() {
    global.collectionGetPreviewManager().syncInspectorInputs();
  };

  global.collectionBuildSelectedItemExecutionUrl = function collectionBuildSelectedItemExecutionUrlAdapter() {
    return global.collectionGetPreviewManager().buildSelectedItemExecutionUrl();
  };

  global.collectionSaveSelectedStepInputs = function collectionSaveSelectedStepInputsAdapter() {
    global.collectionGetPreviewManager().saveSelectedStepInputs();
  };

  global.collectionNormalizeMappingConfig = function collectionNormalizeMappingConfigAdapter(mapping) {
    return global.collectionGetPreviewManager().normalizeMappingConfig(mapping);
  };

  global.collectionInputMappingConfig = function collectionInputMappingConfigAdapter(mappingKey) {
    return global.collectionGetPreviewManager().inputMappingConfig(mappingKey);
  };

  global.collectionInputMappingValue = function collectionInputMappingValueAdapter(mappingKey) {
    return global.collectionGetPreviewManager().inputMappingValue(mappingKey);
  };

  global.collectionUpdateInputMapping = function collectionUpdateInputMappingAdapter(mappingKey, value) {
    global.collectionGetPreviewManager().updateInputMapping(mappingKey, value);
  };

  global.collectionUpdateInputMappingFilterField = function collectionUpdateInputMappingFilterFieldAdapter(mappingKey, value) {
    global.collectionGetPreviewManager().updateInputMappingFilterField(mappingKey, value);
  };

  global.collectionUpdateInputMappingFilterValue = function collectionUpdateInputMappingFilterValueAdapter(mappingKey, value) {
    global.collectionGetPreviewManager().updateInputMappingFilterValue(mappingKey, value);
  };

  global.collectionUpdateOutputAlias = function collectionUpdateOutputAliasAdapter(sourceVarKey, value) {
    global.collectionGetPreviewManager().updateOutputAlias(sourceVarKey, value);
  };

  global.collectionOutputDisplayName = function collectionOutputDisplayNameAdapter(output) {
    return global.collectionGetPreviewManager().outputDisplayName(output);
  };

  global.collectionSplitCollectionOutputPath = function collectionSplitCollectionOutputPathAdapter(pathLabel) {
    return global.collectionGetPreviewManager().splitCollectionOutputPath(pathLabel);
  };

  global.collectionDecoratePreviewOutputs = function collectionDecoratePreviewOutputsAdapter(outputs) {
    return global.collectionGetPreviewManager().decoratePreviewOutputs(outputs);
  };

  global.collectionFindSourceOption = function collectionFindSourceOptionAdapter(input, sourceVarKey) {
    return global.collectionGetPreviewManager().findSourceOption(input, sourceVarKey);
  };

  global.collectionInputMappingFilterField = function collectionInputMappingFilterFieldAdapter(mappingKey) {
    return global.collectionGetPreviewManager().inputMappingFilterField(mappingKey);
  };

  global.collectionInputMappingFilterValue = function collectionInputMappingFilterValueAdapter(mappingKey) {
    return global.collectionGetPreviewManager().inputMappingFilterValue(mappingKey);
  };

  global.collectionBuildOutputVarKey = function collectionBuildOutputVarKeyAdapter(item, outputField) {
    return global.collectionGetPreviewManager().buildOutputVarKey(item, outputField);
  };

  global.collectionBuildInputMappingKey = function collectionBuildInputMappingKeyAdapter(item, input) {
    return global.collectionGetPreviewManager().buildInputMappingKey(item, input);
  };

  global.collectionSuggestMappingForInput = function collectionSuggestMappingForInputAdapter(input, sourceOptions) {
    return global.collectionGetPreviewManager().suggestMappingForInput(input, sourceOptions);
  };

  global.collectionLoadPreview = async function collectionLoadPreviewAdapter() {
    return global.collectionGetPreviewManager().loadPreview();
  };

  /**
   * Copia al portapapeles la URL de ejecucion armada para el paso
   * seleccionado. Opera sobre #collection-step-url-preview, el mismo
   * elemento que llena saveSelectedStepInputs() de arriba — por eso vive
   * aca y no en execution/, a pesar de que su nombre menciona "Execution".
   */
  global.collectionCopyExecutionUrl = function collectionCopyExecutionUrlAdapter(button) {
    var urlElement = document.getElementById('collection-step-url-preview');
    var url = urlElement ? urlElement.textContent : '';
    if (!url || !navigator.clipboard) return;

    navigator.clipboard.writeText(url).then(function showCopied() {
      if (!button) return;
      var originalLabel = button.textContent;
      button.textContent = 'Copiado';
      setTimeout(function restoreLabel() { button.textContent = originalLabel; }, 1500);
    }).catch(function ignoreCopyError() {});
  };
})(window);
