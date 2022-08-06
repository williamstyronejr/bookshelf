// import React, { createContext, useContext, useReducer } from 'react';

// type State = {
//   authenticating: boolean;
//   authenticated: boolean;
// };

// const initState: State = {
//   authenticated: false,
//   authenticating: false,
// };

// const AuthContext = createContext({});

// const authReducer = (state: State, action: { type: string; payload: any }) => {
//   switch (action.type) {
//     default:
//       throw new Error(`Unsupported action type ${action.type}`);
//   }
// };

// export function AuthContextProvider(props: any) {
//   const [state, dispatch] = useReducer(authReducer, initState);

//   return <AuthContext.Provider {...props} />;
// }

// export function useAuthContext() {}
