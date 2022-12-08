import { useState } from "react";

const useCustomState = (initState = {}) => {
  const [state, _setState] = useState(initState);

  const setState = (payload) => {
    _setState((prev) => ({
      ...prev,
      ...payload,
    }));
  };

  return [state, setState];
};

export default useCustomState;
