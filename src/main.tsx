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
import { MDIWorker } from './filter.worker';
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
  const [icons, loadIcons] = createResource([]);
  const [state, setState] = createState({
    search: '',
    filteredIcons: [] as string[][],
    filteredLength: 0,
    showCopiedText: false,
    perPage: 100,
    page: 0,
    workerReady: false,
  });

  // INIT
  const worker = Comlink.wrap<MDIWorker>(new Worker('./filter.worker.ts'));

  loadIcons(fetchIcons());

  // COMPUTED
  const numberOfPages = createMemo(() =>
    Math.ceil(state.filteredLength / state.perPage),
  );

  // METHODS
  function updateSearch({ target }: EventFromInput) {
    setState('search', target.value.toLocaleLowerCase());
  }

  function copyToClipboard({ iconName = '', duration = 3000 }) {
    if (!iconName) return;

    navigator.clipboard.writeText(iconName).then(() => {
      setState('showCopiedText', true);
      setTimeout(() => setState('showCopiedText', false), duration);
    });
  }

  // WATCHERS
  createEffect(() => {
    if (!icons().length) return;

    worker.setIcons(icons()).then(() => setState('workerReady', true));
  });

  createEffect(() => {
    if (!state.workerReady) return;
    const now = performance.now();

    worker
      .filter(state.search, state.page, state.perPage)
      .then(([filtered, length]: [string[][], number]) => {
        setState((state) => {
          state.filteredIcons = filtered;
          state.filteredLength = length;
        });

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
        {state.filteredLength} result(s)
      </p>

      <section class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-15 gap-6 mt-12 relative z-10">
        <For each={state.filteredIcons}>
          {([id, path, name]) => (
            <button
              onClick={[copyToClipboard, { iconName: id }]}
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

      <div class="flex justify-between mt-20">
        <button
          onClick={() => setState('page', state.page - 1)}
          disabled={state.page === 0}
          classList={{ 'opacity-0 scale-0': state.page === 0 }}
          class="bg-gray-800 px-3 py-2 rounded border border-gray-700 hover:bg-gray-900 active:bg-black text-sm font-mono uppercase tracking-wide transition transform duration-300"
        >
          <span>&lt; Previous page</span>
        </button>

        <div
          class="text-xl font-mono flex items-center scale-1 transform transition duration-300"
          classList={{ 'opacity-0 scale-0': numberOfPages() === 0 }}
        >
          <input
            type="number"
            name="pagination"
            id="pagination"
            min="1"
            max={numberOfPages()}
            value={state.page + 1}
            onInput={(e) =>
              setState('page', Number.parseInt(e.target.value, 10) - 1)
            }
            class="border border-transparent hover:border-gray-700 bg-transparent rounded px-4 py-2 bg-transparent w-20 relative transform translate-x-12 hover:translate-x-0 transition duration-300"
          />
          <span>&nbsp;of&nbsp;</span>
          <span>{numberOfPages()}</span>
        </div>

        <button
          onClick={() => setState('page', state.page + 1)}
          disabled={state.filteredIcons.length < state.perPage}
          classList={{
            'opacity-0 scale-0': state.filteredIcons.length < state.perPage,
          }}
          class="bg-gray-800 px-3 py-2 rounded border border-gray-700 hover:bg-gray-900 active:bg-black text-sm font-mono uppercase tracking-wide transition transform duration-300"
        >
          <span>Next page &gt;</span>
        </button>
      </div>

      <Notification show={state.showCopiedText} />
    </main>
  );
}

render(App, document.getElementById('app'));
