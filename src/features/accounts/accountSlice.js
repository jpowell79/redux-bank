import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

// Define the async thunk
export const deposit = createAsyncThunk(
  "account/deposit",
  async ({ amount, currency }) => {
    if (currency === "USD") {
      return amount; // Directly return the amount for USD
    }
    const response = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await response.json();
    return data.rates.USD; // This will be the fulfilled action payload
  }
);

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    // deposit(state, action) {
    //   state.balance += action.payload;
    //   state.isLoading = false;
    // },
    withdraw(state, action) {
      state.balance -= action.payload;
    },
    requestLoan: {
      prepare(amount, purpose) {
        return {
          payload: {
            amount,
            purpose,
          },
        };
      },
      reducer(state, action) {
        if (state.loan > 0) return;
        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purpose;
        state.balance += action.payload.amount;
      },
    },
    payLoan(state) {
      state.balance -= state.loan;
      state.loan = 0;
      state.loanPurpose = "";
    },
    convertingCurrency(state) {
      state.isLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deposit.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deposit.fulfilled, (state, action) => {
        state.balance += action.payload;
        state.isLoading = false;
      });
  },
});

export const { withdraw, requestLoan, payLoan } = accountSlice.actions;

// export function deposit(amount, currency) {
//   if (currency === "USD")
//     return {
//       type: "account/deposit",
//       payload: amount,
//     };

//   return async function (dispatch, getState) {
//     dispatch({ type: "account/convertingCurrency" });
//     // API call
//     const res = await fetch(
//       `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
//     );

//     const data = await res.json();
//     const converted = data.rates.USD;

//     dispatch({ type: "account/deposit", payload: converted });
//   };
// }

export default accountSlice.reducer;

/*

export default function accountReducer(state = initialState, action) {
  switch (action.type) {
    case "account/deposit":
      return {
        ...state,
        balance: state.balance + action.payload,
        isLoading: false,
      };
    case "account/withdraw":
      return {
        ...state,
        balance: state.balance - action.payload,
      };
    case "account/requestLoan":
      if (state.loan > 0) return state;
      return {
        ...state,
        loan: action.payload.amount,
        loanPurpose: action.payload.purpose,
        balance: state.balance + action.payload.amount,
      };
    case "account/payLoan":
      return {
        ...state,
        loan: 0,
        loanPurpose: "",
        balance: state.balance - state.loan,
      };

    case "account/convertingCurrency":
      return {
        ...state,
        isLoading: true,
      };

    default:
      return state;
  }
}

export function deposit(amount, currency) {
  if (currency === "USD")
    return {
      type: "account/deposit",
      payload: amount,
    };

  return async function (dispatch, getState) {
    dispatch({ type: "account/convertingCurrency" });
    // API call
    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
    );

    const data = await res.json();
    const converted = data.rates.USD;

    dispatch({ type: "account/deposit", payload: converted });
  };
}

export function withdraw(amount) {
  return {
    type: "account/withdraw",
    payload: amount,
  };
}

export function requestLoan(amount, purpose) {
  return {
    type: "account/requestLoan",
    payload: { amount, purpose },
  };
}

export function payLoan() {
  return {
    type: "account/payLoan",
  };
}

*/
