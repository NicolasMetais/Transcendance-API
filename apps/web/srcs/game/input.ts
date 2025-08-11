export type Input = { p1Up: boolean; p1Down: boolean; p2Up: boolean; p2Down: boolean };

export function createInput(): Input {
  const s: Input = { p1Up: false, p1Down: false, p2Up: false, p2Down: false };
  
  const on = (v: boolean) => (e: KeyboardEvent) => {
    if (['w', 'W'].includes(e.key)) s.p1Up = v;
    if (['s', 'S'].includes(e.key)) s.p1Down = v;
    if (e.key === 'ArrowUp') s.p2Up = v;
    if (e.key === 'ArrowDown') s.p2Down = v;
  };
  
  addEventListener('keydown', on(true));
  addEventListener('keyup', on(false));
  
  return s;
} 