import { For } from 'solid-js/web';
import {
  createState,
  onError,
  createResource,
  createMemo,
  Component,
  Suspense,
  createSignal,
  createSelector,
  createComputed,
} from 'solid-js';

import { Icon } from './components/icon';
import { Notification } from './components/notification';

type EventFromInput = InputEvent & {
  currentTarget: HTMLInputElement;
  target: HTMLInputElement;
};

async function fetchIcons() {
  const icons = await import('@mdi/js');
  return Object.entries(icons);
}

export const App: Component = () => {
  const [icons, loadIcons] = createResource([]);
  loadIcons(fetchIcons);

  const [state, setState] = createState({
    search: '',
    loading: false,
    page: 0,
    perPage: 100,
    workerReady: false,
    showCopiedText: false,
    filteredLength: 0,
    filteredIcons: [] as string[][],
  });

  const [selected, setSelected] = createSignal(null, true);
  const isSelected = createSelector(selected);

  const worker = new Worker(new URL('./filter.worker.js', import.meta.url));

  const numberOfPages = createMemo(() =>
    Math.ceil(state.filteredLength / state.perPage),
  );

  function updateSearch({ target }: EventFromInput) {
    setState({
      search: target.value.toLocaleLowerCase(),
      page: 0,
    });
  }

  function copyToClipboard({ id = '', duration = 3000 }) {
    if (!id) return;

    navigator.clipboard.writeText(id).then(() => {
      setState('showCopiedText', true);
      setTimeout(() => setState('showCopiedText', false), duration);
    });
  }

  function downloadSVG({ path = '', duration = 3000 }) {
    const id = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="${path}" /></svg>`;

    copyToClipboard({ id, duration });
  }

  createComputed(() => {
    if (!icons().length) return;

    worker.postMessage({ event: 'SET_ICONS', icons: icons() });
    setState('workerReady', true);
  });

  worker.addEventListener('message', ({ data }) => {
    const [filteredIcons, filteredLength] = data;
    setState({ filteredIcons, filteredLength });
  });

  createComputed(() => {
    if (!state.workerReady) return;

    worker.postMessage({
      event: 'FILTER',
      search: state.search,
      page: state.page,
      perPage: state.perPage,
    });
  });

  onError(console.error);

  return (
    <main class="container p-6 mx-auto relative">
      <h1 class="text-center text-4xl font-semibold">MDI Explorer</h1>

      <Suspense
        fallback={<p class="mt-12 text-xl text-center">Loading the icons...</p>}
      >
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
              <a
                href={`#/${id}`}
                class="relative group border border-transparent hover:border-gray-500 rounded p-1"
                onClick={() => {
                  return isSelected(id) ? setSelected(null) : setSelected(id);
                }}
              >
                <Icon path={path} id={id} class="w-full" />

                <div
                  class="text-sm overflow-hidden font-semibold absolute z-20 top-full left-1/2 -translate-x-1/2 transform bg-gray-600 rounded shadow border-gray-900"
                  classList={{
                    block: isSelected(id),
                    hidden: !isSelected(id),
                  }}
                >
                  <p innerHTML={name} class="p-2 text-center"></p>

                  <div class="flex">
                    <button
                      type="button"
                      onClick={[downloadSVG, { path }]}
                      class="flex-1 w-full border-t-2 border-r border-gray-400 p-1 px-6 hover:bg-gray-700 active:bg-gray-800 focus:outline-none"
                    >
                      SVG
                    </button>
                    <button
                      type="button"
                      onClick={[copyToClipboard, { id }]}
                      class="flex-1 w-full border-t-2 border-l border-gray-400 p-1 px-6 hover:bg-gray-700 active:bg-gray-800 focus:outline-none"
                    >
                      ID!!
                    </button>
                  </div>
                </div>
              </a>
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
            <span>&lt;</span>
            <span class="hidden sm:inline-block">&nbsp;Previous page</span>
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
              class="border border-transparent hover:border-gray-700 rounded px-4 py-2 bg-transparent w-20 relative transform translate-x-12 hover:translate-x-0 transition duration-300"
            />
            <span>&nbsp;of&nbsp;</span>
            <span>{numberOfPages()}</span>
          </div>

          <button
            type="button"
            onClick={() => setState('page', state.page + 1)}
            disabled={state.filteredIcons.length < state.perPage}
            classList={{
              'opacity-0 scale-0': state.filteredIcons.length < state.perPage,
            }}
            class="bg-gray-800 px-3 py-2 rounded border border-gray-700 hover:bg-gray-900 active:bg-black text-sm font-mono uppercase tracking-wide transition transform duration-300"
          >
            <span class="hidden sm:inline-block">Next page&nbsp;</span>
            <span>&gt;</span>
          </button>
        </div>
      </Suspense>

      <Notification show={state.showCopiedText} />
    </main>
  );
};
