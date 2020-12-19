import type { Component } from 'solid-js';

type PropsType = {
  id?: string;
  path: string;
  class?: string;
};

export const Icon: Component<PropsType> = (props) => {
  return (
    <svg
      id={props.id}
      viewBox="0 0 24 24"
      class={`fill-current ${props.class}`}
    >
      <path d={props.path} />
    </svg>
  );
};
