let navigator;

export const setNavigator = (nav) => {
  navigator = nav;
};

export const navigate = (routeName, params) => {
  if (navigator) {
    navigator.navigate(routeName, params);
  }
};