'use strict';

const state = { tabs: [], activeId: null };

function render() {
  const bar = document.getElementById('tabs');
  bar.innerHTML = '';
  state.tabs.forEach((t) => {
    const el = document.createElement('div');
    el.className = 'tab' + (t.id === state.activeId ? ' active' : '');
    el.title = t.title;
    el.addEventListener('click', () => window.tabsAPI.switchTab(t.id));

    const label = document.createElement('span');
    label.className = 'tab-label';
    label.textContent = t.title;
    el.appendChild(label);

    if (state.tabs.length > 1) {
      const close = document.createElement('button');
      close.className = 'tab-close';
      close.textContent = '×';
      close.title = 'Cerrar pestaña';
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        window.tabsAPI.closeTab(t.id);
      });
      el.appendChild(close);
    }

    bar.appendChild(el);
  });
}

document.getElementById('new-tab-btn').addEventListener('click', () => window.tabsAPI.newTab());

window.tabsAPI.onUpdate((data) => {
  state.tabs = data.tabs;
  state.activeId = data.activeId;
  render();
});
