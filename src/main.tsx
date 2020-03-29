import * as Comlink from 'comlink';
import { render, For } from 'solid-js/dom';
import {
  createState,
  onError,
  createEffect,
  createResource,
  createMemo,
} from 'solid-js';

import { Icon } from './components/icon';
import { WorkerFunction } from './filter.worker';
import { Notification } from './components/notification';

type EventFromInput = InputEvent & {
  currentTarget: HTMLInputElement;
  target: HTMLInputElement;
};

function fetchIcons() {
  return import('@mdi/js').then((module) => Object.entries(module));
}

function App() {
  // STATE
  let interval: number;
  const [icons, loadIcons] = createResource([]);
  const [state, setState] = createState({
    search: '',
    filteredIcons: [],
    showCopiedText: false,
  });

  // INIT
  const worker = Comlink.wrap<WorkerFunction>(new Worker('./filter.worker.ts'));
  loadIcons(fetchIcons());

  // COMPUTED
  const iconsLength = createMemo(() => icons().length);

  // METHODS
  function updateSearch({ target }: EventFromInput) {
    setState('search', target.value.toLocaleLowerCase());
  }

  function copyToClipboard(iconName: string) {
    navigator.clipboard.writeText(iconName).then(() => {
      setState('showCopiedText', true);
      setTimeout(() => setState('showCopiedText', false), 3000);
    });
  }

  // WATCHERS
  createEffect(() => {
    const now = performance.now();

    worker.filter(icons(), state.search).then((filtered: string[][]) => {
      const copy = [...filtered];
      clearInterval(interval);
      setState('filteredIcons', []);

      interval = setInterval(() => {
        if (!copy.length) return clearInterval(interval);

        setState('filteredIcons', [
          ...state.filteredIcons,
          ...copy.splice(0, 500),
        ]);
      }, 150);

      const then = performance.now();
      console.log(`Filter took ${then - now}ms`);
    });
  });

  onError(console.error);

  return (
    <main class="container p-6 mx-auto relative">
      <h1 class="text-center text-4xl font-semibold">MDI Explorer</h1>

      <input
        value={state.search}
        onInput={updateSearch}
        class="uppercase border border-gray-700 bg-transparent rounded px-4 py-2 w-full mt-6 bg-gray-800 top-6 sticky z-20"
        placeholder="Search an icon..."
      />

      <p class="mt-3 text-right font-semibold">
        {state.filteredIcons.length}/{iconsLength()}
      </p>

      <section class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-15 gap-6 mt-12 relative z-10">
        <For each={state.filteredIcons}>
          {([id, path, name]) => (
            <button
              onClick={[copyToClipboard, id]}
              class="relative group border border-transparent hover:border-gray-500 rounded p-1"
            >
              <Icon path={path} id={id} class="w-full" />
              <p
                innerHTML={name}
                class="text-sm font-semibold absolute z-20 top-full left-1/2 -translate-x-1/2 transform translate-y-2 bg-gray-600 rounded shadow border-gray-900 px-3 py-2 group-hover:block group-active:block hidden"
              ></p>
            </button>
          )}
        </For>
      </section>

      <Notification show={state.showCopiedText} />
    </main>
  );
}

render(App, document.getElementById('app'));
