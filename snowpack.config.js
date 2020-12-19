const mount = {
  src: "/",
};

const proxy = {
  /* ... */
};

const plugins = [
  "@snowpack/plugin-typescript",
  "@snowpack/plugin-babel",
  "@snowpack/plugin-postcss",
  
  ['@intrnl/snowpack-bundle-rollup', {
    minify: true,
    modulesDir: false
  }]
];

const installOptions = {
  installTypes: true,
  NODE_ENV: true,
};

const alias = {
  /* */
};

const devOptions = {
  out: "dist",
  open: "none",
  bundle: true,
  baseUrl: "",
};

const buildOptions = {
  clean: true,
};

module.exports = {
  mount,
  alias,
  proxy,
  plugins,
  installOptions,
  devOptions,
  buildOptions,
};
