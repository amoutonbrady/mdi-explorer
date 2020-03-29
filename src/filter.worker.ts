import * as Comlink from 'comlink';

function filter(icons: string[][], search: string) {
  const res = [];

  for (let i = 0; i < icons.length; i++) {
    const [name, path] = icons[i];
    if (!name.toLocaleLowerCase().includes(search)) continue;

    res.push([
      name,
      path,
      name
        .slice(3)
        .replace(
          new RegExp(`(${search})`, 'gi'),
          '<span class="border-b border-red-300">$1</span>',
        ),
    ]);
  }

  return res;
}

Comlink.expose({ filter });

export type WorkerFunction = {
  filter: typeof filter;
};
