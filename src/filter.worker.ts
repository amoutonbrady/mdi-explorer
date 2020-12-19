let icons = [];
let cachedSearch = 'NOT_INIT';
let cachedFilteredIcons = [];

function filter(search: string, page: number, perPage: number) {
  const res = [];
  const start = page * perPage;

  if (cachedSearch === search) {
    return [
      cachedFilteredIcons.slice(start, start + perPage),
      cachedFilteredIcons.length,
    ];
  }

  for (let i = 0; i < icons.length; i++) {
    const [name, path] = icons[i];
    if (!name.toLocaleLowerCase().includes(search)) continue;

    if (!search) {
      res.push([name, path, name.slice(3)]);
      continue;
    }

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

  cachedSearch = search;
  cachedFilteredIcons = res;

  return [res.slice(start, start + perPage), res.length];
}

globalThis.addEventListener('message', ({ data }) => {
  switch (data.event) {
    case 'SET_ICONS':
      icons = data.icons;
      break;

    case 'FILTER':
      const filteredIcons = filter(data.search, data.page, data.perPage);
      // @ts-ignore
      globalThis.postMessage(filteredIcons);
      break;
  }
});
