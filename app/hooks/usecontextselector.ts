import { useContext, useMemo } from "react";

// generic Types: C: context, V: value
export function useContextSelector<C extends {state: any}, V>(
  context: React.Context<{state: C["state"]}>,
  selector: (state: C["state"], ...args: any[]) => V,
  args: any[]
) {
  const {state} = useContext(context);
  const selectedValue = useMemo(() => {
    return selector(state, ...args);
  }, [selector, state, ...args])

  return selectedValue;
}
