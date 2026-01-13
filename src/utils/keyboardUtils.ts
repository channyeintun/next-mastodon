export const normalizeKey = (key: string): string => {
  const lowercaseKey = key.toLowerCase();

  switch (lowercaseKey) {
    case 'escape':
      return 'esc';
    case 'arrowup':
      return 'up';
    case 'arrowdown':
      return 'down';
    case 'arrowleft':
      return 'left';
    case 'arrowright':
      return 'right';
    default:
      return lowercaseKey;
  }
};

export const isKeyboardEvent = (event: Event): event is KeyboardEvent => {
  return 'key' in event;
};
