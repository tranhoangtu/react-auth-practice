import React, { useCallback, useEffect, useState } from "react";

const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});
const caculateRemainTime = (expiredTime) => {
  const currentTime = new Date().getTime();
  console.log(expiredTime);
  const adjExpirationTime = new Date(expiredTime).getTime();
  const remainDuration = adjExpirationTime - currentTime;
  return remainDuration;
};

const retrieveStoreToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpirationTime = localStorage.getItem("expirationTime");
  const remainTime = caculateRemainTime(storedExpirationTime);

  if (remainTime <= 3600) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }

  return {
    token: storedToken,
    duration: remainTime,
  };
};

export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoreToken();
  let initToken;
  if (tokenData) {
    initToken = tokenData.token;
  }

  const [token, setToken] = useState(initToken);

  const userIsLoggedIn = !!token;
  let logoutTimer;

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);
    const remainTime = caculateRemainTime(expirationTime);
    console.log(remainTime);
    logoutTimer = setTimeout(logoutHandler, remainTime);
  };

  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData]);

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
