import React, { createContext } from 'react';

const FunctionContext = createContext(); //tracks loading state to disable buttons if something is already running

export default FunctionContext;