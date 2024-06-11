import React, { createContext } from 'react';

//This context is used to track loading state in JSON to Firebase.
//It allows us to disable buttons if postDataHard or postDataSoft is already running
const FunctionContext = createContext();

export default FunctionContext;