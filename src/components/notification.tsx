import type { Component } from 'solid-js';

export const Notification: Component<{ show: boolean }> = (props) => {
  return (
    <p
      class="absolute top-6 right-6 px-3 py-2 font-semibold bg-green-200 text-green-800 border border-green-800 rounded shadow transition duration-300 transform z-30"
      classList={{
        'scale-1 opacity-1': props.show,
        'scale-0 opacity-0': !props.show,
      }}
    >
      Icon copied to clipboard!
    </p>
  );
};
