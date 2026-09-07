(function bootstrapCollectionChainSuggestionAdapter(global) {
  'use strict';

  /**
   * Adapter de compatibilidad: funciones globales del drawer "Sugerir
   * cadena" que el HTML del panel invoca por nombre. Ver la nota de
   * arquitectura en shared/collection-utils-adapter.js.
   */

  global.collectionOpenChainSuggestionDrawer = function collectionOpenChainSuggestionDrawerAdapter() {
    global.collectionGetChainSuggestionManager().open();
  };

  global.collectionCloseChainSuggestionDrawer = function collectionCloseChainSuggestionDrawerAdapter() {
    global.collectionGetChainSuggestionManager().close();
  };

  global.collectionSetSuggestStartMethod = function collectionSetSuggestStartMethodAdapter(value) {
    global.collectionGetChainSuggestionManager().setStartMethod(value);
  };

  global.collectionSetSuggestScope = function collectionSetSuggestScopeAdapter(scope) {
    global.collectionGetChainSuggestionManager().setScope(scope);
  };

  global.collectionRunChainSuggestionSearch = function collectionRunChainSuggestionSearchAdapter() {
    return global.collectionGetChainSuggestionManager().search();
  };

  global.collectionToggleChainSuggestion = function collectionToggleChainSuggestionAdapter(index) {
    global.collectionGetChainSuggestionManager().toggleExpand(index);
  };

  global.collectionConfirmChainSuggestion = function collectionConfirmChainSuggestionAdapter(index) {
    return global.collectionGetChainSuggestionManager().confirmInsert(index);
  };
})(window);
