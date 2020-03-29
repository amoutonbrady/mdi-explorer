type PropsType = {
  id?: string;
  path: string;
  class?: string;
};

export function Icon(props: PropsType) {
  return (
    <svg
      id={props.id}
      viewBox="0 0 24 24"
      class={`fill-current ${props.class}`}
    >
      <path d={props.path} />
    </svg>
  );
}
